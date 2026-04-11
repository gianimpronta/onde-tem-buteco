import os
import time
import re
import requests
import psycopg2
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://comidadibuteco.com.br"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9",
}
SLEEP = 0.5


def get_slugs(page: int) -> list[str]:
    url = f"{BASE_URL}/butecos/page/{page}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        print(f"  erro ao buscar página {page}: {e}")
        return []

    if not resp.ok:
        print(f"  HTTP {resp.status_code} para página {page}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    seen = set()
    slugs = []
    for a in soup.select("a[href*='/buteco/']"):
        href = a["href"]
        match = re.search(r"/buteco/([^/]+)/?$", href)
        if match:
            slug = match.group(1)
            if slug not in seen:
                seen.add(slug)
                slugs.append(slug)
    return slugs


def scrape_buteco(slug: str) -> dict:
    url = f"{BASE_URL}/buteco/{slug}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  erro ao buscar {slug}: {e}")
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")

    nome_tag = soup.select_one("h1.section-title")
    nome = nome_tag.get_text(strip=True) if nome_tag else ""

    foto_tag = soup.select_one("img.img-single")
    foto_url = foto_tag["src"] if foto_tag else None

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

            if label == "endereço" or label == "endereco":
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
        # Remove estado (UF) se presente na última parte
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
    pass


if __name__ == "__main__":
    main()
