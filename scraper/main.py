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
    pass


def scrape_buteco(slug: str) -> dict:
    pass


def upsert_buteco(conn, data: dict) -> None:
    pass


def main() -> None:
    pass


if __name__ == "__main__":
    main()
