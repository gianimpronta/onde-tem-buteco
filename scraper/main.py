import os
import sys
import time
import re
import psycopg2
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Page

load_dotenv()

BASE_URL = "https://comidadibuteco.com.br"
SLEEP = 0.5

BROWSER_ARGS = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-dev-shm-usage",
]

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)


def new_stealth_page(browser):
    page = browser.new_page(
        user_agent=UA,
        viewport={"width": 1920, "height": 1080},
    )
    try:
        from playwright_stealth import stealth_sync
        stealth_sync(page)
    except ImportError:
        pass
    return page


def navigate(page_obj: Page, url: str, selector: str) -> bool:
    """Navigate to URL, wait through Cloudflare challenge if needed, then find selector."""
    try:
        page_obj.goto(url, timeout=60000)
    except Exception as e:
        print(f"  goto falhou: {e}")
        return False

    # If Cloudflare challenge page, poll until title changes (up to 35s)
    if page_obj.title() == "Just a moment...":
        deadline = time.time() + 35
        resolved = False
        while time.time() < deadline:
            try:
                if page_obj.title() != "Just a moment...":
                    resolved = True
                    break
            except Exception:
                pass
            time.sleep(0.5)
        if not resolved:
            print(f"  Cloudflare não resolveu: {url}")
            return False

    try:
        page_obj.wait_for_selector(selector, timeout=15000)
        return True
    except Exception:
        print(f"  falhou | título={page_obj.title()!r} | url={page_obj.url}")
        return False


def get_slugs(page_obj: Page, page: int) -> list[str]:
    url = f"{BASE_URL}/butecos/page/{page}/"
    if not navigate(page_obj, url, "a[href*='/buteco/']"):
        return []

    html = page_obj.content()
    soup = BeautifulSoup(html, "html.parser")
    seen = set()
    slugs = []
    for a in soup.select("a[href*='/buteco/']"):
        href = a.get("href", "")
        match = re.search(r"/buteco/([^/]+)/?$", href)
        if match:
            slug = match.group(1)
            if slug not in seen:
                seen.add(slug)
                slugs.append(slug)
    return slugs


def scrape_buteco(page_obj: Page, slug: str) -> dict:
    url = f"{BASE_URL}/buteco/{slug}/"
    if not navigate(page_obj, url, "h1.section-title"):
        return {}

    html = page_obj.content()
    soup = BeautifulSoup(html, "html.parser")

    nome_tag = soup.select_one("h1.section-title")
    nome = nome_tag.get_text(strip=True) if nome_tag else ""

    foto_tag = soup.select_one("img.img-single")
    foto_url = (foto_tag.get("src") or foto_tag.get("data-src")) if foto_tag else None

    section = soup.select_one(".section-text")
    petisco_nome = None
    petisco_desc = None
    endereco = None
    telefone = None
    horario = None

    if section:
        paragraphs = section.find_all("p")
        for i, p in enumerate(paragraphs):
            bold = p.find("b")
            if not bold:
                continue
            label = bold.get_text(strip=True).lower().rstrip(":")
            value = p.get_text(strip=True)[len(bold.get_text(strip=True)):].strip().lstrip(":").strip()

            if label in ("endereço", "endereco"):
                endereco = value
            elif label == "telefone":
                telefone = value
            elif label in ("horario", "horário"):
                horario = value
            elif i == 0:
                petisco_nome = bold.get_text(strip=True)
                petisco_desc = value if value else None

    cidade = None
    bairro = None
    if endereco:
        parts = [p.strip() for p in endereco.split(",")]
        last = parts[-1].strip()
        if re.match(r"^[A-Z]{2}$", last):
            parts = parts[:-1]
        cidade = parts[-1].strip() if parts else None
        bairro = parts[-2].strip() if len(parts) >= 2 else None

    return {
        "slug": slug,
        "nome": nome,
        "cidade": cidade or "",
        "bairro": bairro,
        "endereco": endereco or "",
        "telefone": telefone,
        "horario": horario,
        "petisco_nome": petisco_nome,
        "petisco_desc": petisco_desc,
        "foto_url": foto_url,
    }


def upsert_buteco(conn, data: dict) -> None:
    sql = """
        INSERT INTO "Buteco" (
            id, slug, nome, cidade, bairro, endereco,
            telefone, horario, "petiscoNome", "petiscoDesc",
            "fotoUrl", lat, lng, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text, %(slug)s, %(nome)s, %(cidade)s, %(bairro)s, %(endereco)s,
            %(telefone)s, %(horario)s, %(petisco_nome)s, %(petisco_desc)s,
            %(foto_url)s, NULL, NULL, NOW(), NOW()
        )
        ON CONFLICT (slug) DO UPDATE SET
            nome          = EXCLUDED.nome,
            cidade        = EXCLUDED.cidade,
            bairro        = EXCLUDED.bairro,
            endereco      = EXCLUDED.endereco,
            telefone      = EXCLUDED.telefone,
            horario       = EXCLUDED.horario,
            "petiscoNome" = EXCLUDED."petiscoNome",
            "petiscoDesc" = EXCLUDED."petiscoDesc",
            "fotoUrl"     = EXCLUDED."fotoUrl",
            "updatedAt"   = NOW()
    """
    with conn.cursor() as cur:
        cur.execute(sql, data)
    conn.commit()


def main() -> None:
    db_url = os.environ.get("POSTGRES_URL_NON_POOLING")
    if not db_url:
        raise RuntimeError("POSTGRES_URL_NON_POOLING não definida")

    conn = psycopg2.connect(db_url)
    print("Conectado ao banco.")

    page_num = 1
    total = 0
    errors = 0

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, args=BROWSER_ARGS)
            page_obj = new_stealth_page(browser)

            while True:
                print(f"\n[página {page_num}] buscando slugs...")
                slugs = get_slugs(page_obj, page_num)
                if not slugs:
                    print("  sem resultados — fim da paginação.")
                    break

                for slug in slugs:
                    time.sleep(SLEEP)
                    data = scrape_buteco(page_obj, slug)
                    if not data:
                        print(f"  {slug} → erro (sem dados)")
                        errors += 1
                        continue
                    try:
                        upsert_buteco(conn, data)
                        print(f"  {slug} → ok")
                        total += 1
                    except Exception as e:
                        print(f"  {slug} → erro no banco: {e}")
                        conn.rollback()
                        errors += 1

                page_num += 1
                time.sleep(SLEEP)

            browser.close()
    finally:
        conn.close()

    print(f"\nConcluído: {total} butecos inseridos/atualizados, {errors} erros.")

    if total == 0 and errors > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
