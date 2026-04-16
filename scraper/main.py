import os
import re
import sys
import time
import unicodedata

import psycopg2
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://comidadibuteco.com.br"
FLARESOLVERR = "http://localhost:8191/v1"
SLEEP = 0.5
SESSION_ID = "scraper-session"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "onde-tem-buteco-scraper/1.0"


def fs_request(url: str) -> str:
    """Fetch a URL via FlareSolverr. Returns HTML or empty string on failure."""
    try:
        resp = requests.post(
            FLARESOLVERR,
            json={
                "cmd": "request.get",
                "url": url,
                "session": SESSION_ID,
                "maxTimeout": 60000,
            },
            timeout=90,
        )
        data = resp.json()
        if data.get("status") == "ok":
            return data["solution"]["response"]
        print(f"  FlareSolverr erro: {data.get('message', data.get('status'))}")
        return ""
    except Exception as e:
        print(f"  FlareSolverr exceção: {e}")
        return ""


def fs_create_session() -> None:
    """Create a persistent FlareSolverr session (reuses cookies across requests)."""
    try:
        requests.post(
            FLARESOLVERR,
            json={"cmd": "sessions.create", "session": SESSION_ID},
            timeout=15,
        )
    except Exception:
        pass


def get_slugs(page: int) -> list[str]:
    url = f"{BASE_URL}/butecos/page/{page}/"
    html = fs_request(url)
    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    if not soup.select_one("a[href*='/buteco/']"):
        print(f"  sem links de buteco na página {page} (possível bloqueio ou fim)")
        return []

    seen: set[str] = set()
    slugs: list[str] = []
    for a in soup.select("a[href*='/buteco/']"):
        href = a.get("href", "")
        match = re.search(r"/buteco/([^/]+)/?$", href)
        if match:
            slug = match.group(1)
            if slug not in seen:
                seen.add(slug)
                slugs.append(slug)
    return slugs


def _parse_section_fields(section) -> dict:
    """Extract endereco, telefone, horario and petisco from .section-text."""
    result = {
        "endereco": None,
        "telefone": None,
        "horario": None,
        "petisco_nome": None,
        "petisco_desc": None,
    }
    for i, p in enumerate(section.find_all("p")):
        bold = p.find("b")
        if not bold:
            continue
        label = bold.get_text(strip=True).lower().rstrip(":")
        bold_text = bold.get_text(strip=True)
        value = p.get_text(strip=True)[len(bold_text) :].strip().lstrip(":").strip()

        if label in ("endereço", "endereco"):
            result["endereco"] = value
        elif label == "telefone":
            result["telefone"] = value
        elif label in ("horario", "horário"):
            result["horario"] = value
        elif i == 0:
            result["petisco_nome"] = bold_text
            result["petisco_desc"] = value if value else None
    return result


def _parse_location(endereco: str) -> tuple[str | None, str | None]:
    """Split endereco string into (cidade, bairro)."""
    parts = [p.strip() for p in endereco.split(",")]
    last = parts[-1].strip()
    if re.match(r"^[A-Z]{2}$", last):
        parts = parts[:-1]
    cidade = parts[-1].strip() if parts else None
    bairro = parts[-2].strip() if len(parts) >= 2 else None
    return cidade, bairro


def _slugify(name: str) -> str:
    normalized = unicodedata.normalize("NFKD", name)
    ascii_name = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_name.lower()).strip("-")
    return slug


def geocode_address(endereco: str) -> tuple[float | None, float | None]:
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": endereco, "format": "json", "limit": 1},
            headers={"User-Agent": USER_AGENT},
            timeout=20,
        )
        data = resp.json()
        if not data:
            return None, None
        first = data[0]
        return float(first["lat"]), float(first["lon"])
    except Exception:
        return None, None


def scrape_buteco(slug: str) -> dict:
    url = f"{BASE_URL}/buteco/{slug}/"
    html = fs_request(url)
    if not html:
        return {}

    soup = BeautifulSoup(html, "html.parser")
    nome_tag = soup.select_one("h1.section-title")
    if not nome_tag:
        print(f"  h1.section-title não encontrado em {slug}")
        return {}

    nome = nome_tag.get_text(strip=True)

    foto_tag = soup.select_one("img.img-single")
    foto_url = (foto_tag.get("src") or foto_tag.get("data-src")) if foto_tag else None

    section = soup.select_one(".section-text")
    fields = (
        _parse_section_fields(section)
        if section
        else {
            "endereco": None,
            "telefone": None,
            "horario": None,
            "petisco_nome": None,
            "petisco_desc": None,
        }
    )

    endereco = fields["endereco"]
    cidade, bairro = _parse_location(endereco) if endereco else (None, None)

    lat, lng = geocode_address(endereco) if endereco else (None, None)
    final_slug = slug or _slugify(nome)

    return {
        "slug": final_slug,
        "nome": nome,
        "cidade": cidade or "",
        "bairro": bairro,
        "endereco": endereco or "",
        "telefone": fields["telefone"],
        "horario": fields["horario"],
        "petisco_nome": fields["petisco_nome"],
        "petisco_desc": fields["petisco_desc"],
        "foto_url": foto_url,
        "lat": lat,
        "lng": lng,
    }


def upsert_buteco(conn, data: dict) -> None:
    sql = """
        INSERT INTO "Buteco" (
            id, slug, nome, cidade, bairro, endereco,
            telefone, horario, "petiscoNome", "petiscoDesc",
            "fotoUrl", lat, lng, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text, %(slug)s, %(nome)s, %(cidade)s, %(bairro)s, %(endereco)s,
            %(telefone)s, %(horario)s, %(petisco_nome)s, %(petisco_desc)s, %(foto_url)s,
            %(lat)s, %(lng)s, NOW(), NOW()
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
            lat           = EXCLUDED.lat,
            lng           = EXCLUDED.lng,
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

    fs_create_session()
    print("Sessão FlareSolverr criada.")

    page_num = 1
    total = 0
    errors = 0

    while True:
        print(f"\n[página {page_num}] buscando slugs...")
        slugs = get_slugs(page_num)
        if not slugs:
            print("  sem resultados — fim da paginação.")
            break

        for slug in slugs:
            time.sleep(SLEEP)
            data = scrape_buteco(slug)
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

    conn.close()
    print(f"\nConcluído: {total} butecos inseridos/atualizados, {errors} erros.")

    if total == 0 and errors > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
