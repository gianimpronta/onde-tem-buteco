import os
import time
import re
import requests
import psycopg2
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://comidadibuteco.com.br"
HEADERS = {"User-Agent": "onde-tem-buteco-scraper/1.0"}
SLEEP = 0.5


def get_slugs(page: int) -> list[str]:
    url = f"{BASE_URL}/butecos/page/{page}/"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        print(f"  erro ao buscar página {page}: {e}")
        return []

    if resp.status_code == 404:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    slugs = []
    for a in soup.select("a[href*='/buteco/']"):
        href = a["href"]
        match = re.search(r"/buteco/([^/]+)/?$", href)
        if match:
            slug = match.group(1)
            if slug not in slugs:
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
