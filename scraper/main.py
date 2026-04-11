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
    pass


def upsert_buteco(conn, data: dict) -> None:
    pass


def main() -> None:
    pass


if __name__ == "__main__":
    main()
