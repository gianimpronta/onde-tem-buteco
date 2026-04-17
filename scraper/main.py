import argparse
import os
import re
import sys
import time
import unicodedata
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg2
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://comidadibuteco.com.br"
FLARESOLVERR = "http://localhost:8191/v1"
SLEEP = 0.5
GEOCODE_SLEEP = 1.0
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
    normalized = _normalize_address(endereco)
    parts = [p.strip() for p in normalized.split(",") if p.strip()]
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


def _normalize_whitespace(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _normalize_address(endereco: str) -> str:
    normalized = _normalize_whitespace(endereco)
    normalized = normalized.replace("|", ", ")
    normalized = re.sub(r"\bCEP[:\s-]*\d{5}-?\d{3}\b", "", normalized, flags=re.IGNORECASE)
    normalized = normalized.replace(" – ", ", ")
    normalized = normalized.replace(" - ", ", ")
    parts = [part.strip() for part in normalized.split(",") if part.strip()]
    return ", ".join(parts)


def _build_geocode_queries(
    endereco: str,
    cidade: str | None = None,
    bairro: str | None = None,
) -> list[str]:
    normalized_address = _normalize_address(endereco)
    normalized_city = _normalize_whitespace(cidade) if cidade else ""
    normalized_district = _normalize_whitespace(bairro) if bairro else ""
    address_parts = [part.strip() for part in normalized_address.split(",") if part.strip()]

    queries: list[str] = []
    seen: set[str] = set()

    def add_query(value: str) -> None:
        query = _normalize_address(value)
        if query and query not in seen:
            seen.add(query)
            queries.append(query)

    add_query(normalized_address)

    if normalized_city:
        add_query(f"{normalized_address}, {normalized_city}, Brasil")

    if len(address_parts) >= 2:
        add_query(", ".join(address_parts[-2:]))

    if normalized_district and normalized_city:
        add_query(f"{normalized_district}, {normalized_city}, Brasil")

    if normalized_city:
        add_query(f"{normalized_city}, Brasil")

    return queries


def _sanitize_database_url(url: str) -> str:
    parts = urlsplit(url)
    filtered_query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key != "pgbouncer"
    ]
    return urlunsplit(
        (parts.scheme, parts.netloc, parts.path, urlencode(filtered_query), parts.fragment)
    )


def resolve_database_url() -> str:
    for env_name in ("POSTGRES_URL_NON_POOLING", "DATABASE_URL", "POSTGRES_PRISMA_URL"):
        raw_url = os.environ.get(env_name)
        if raw_url:
            return _sanitize_database_url(raw_url)

    raise RuntimeError(
        "Configure POSTGRES_URL_NON_POOLING, DATABASE_URL "
        "ou POSTGRES_PRISMA_URL antes de rodar o scraper"
    )


def geocode_address(
    endereco: str,
    cidade: str | None = None,
    bairro: str | None = None,
    *,
    sleep_seconds: float = GEOCODE_SLEEP,
) -> tuple[float | None, float | None]:
    queries = _build_geocode_queries(endereco, cidade, bairro)

    for index, query in enumerate(queries):
        if index > 0 and sleep_seconds > 0:
            time.sleep(sleep_seconds)

        try:
            resp = requests.get(
                NOMINATIM_URL,
                params={
                    "q": query,
                    "format": "jsonv2",
                    "limit": 1,
                    "countrycodes": "br",
                    "addressdetails": 0,
                },
                headers={"User-Agent": USER_AGENT, "Accept-Language": "pt-BR"},
                timeout=20,
            )
            data = resp.json()
        except Exception as exc:
            print(f"  geocode falhou para '{query}': {exc}")
            continue

        if not data:
            continue

        first = data[0]
        return float(first["lat"]), float(first["lon"])

    return None, None


def fetch_butecos_missing_coordinates(conn) -> list[dict[str, str | None]]:
    sql = """
        SELECT slug, endereco, cidade, bairro
        FROM "Buteco"
        WHERE (lat IS NULL OR lng IS NULL)
          AND COALESCE(endereco, '') <> ''
        ORDER BY nome ASC
    """
    with conn.cursor() as cur:
        cur.execute(sql)
        rows = cur.fetchall()

    return [
        {
            "slug": slug,
            "endereco": endereco,
            "cidade": cidade,
            "bairro": bairro,
        }
        for slug, endereco, cidade, bairro in rows
    ]


def update_buteco_coordinates(conn, slug: str, lat: float, lng: float) -> bool:
    sql = """
        UPDATE "Buteco"
        SET lat = %s,
            lng = %s,
            "updatedAt" = NOW()
        WHERE slug = %s
          AND (lat IS NULL OR lng IS NULL)
    """
    with conn.cursor() as cur:
        cur.execute(sql, (lat, lng, slug))
        updated = cur.rowcount > 0
    conn.commit()
    return updated


def backfill_missing_coordinates(conn) -> tuple[int, int]:
    pending = fetch_butecos_missing_coordinates(conn)
    if not pending:
        print("\n[backfill] nenhum buteco pendente de geolocalização.")
        return 0, 0

    print(f"\n[backfill] reprocessando {len(pending)} butecos sem coordenadas...")

    updated = 0
    failed = 0

    for item in pending:
        lat, lng = geocode_address(
            item["endereco"] or "",
            cidade=item["cidade"],
            bairro=item["bairro"],
        )
        if lat is None or lng is None:
            print(f"  {item['slug']} → sem coordenadas")
            failed += 1
            continue

        if update_buteco_coordinates(conn, item["slug"] or "", lat, lng):
            print(f"  {item['slug']} → coordenadas atualizadas")
            updated += 1

    return updated, failed


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scraper do Onde Tem Buteco")
    parser.add_argument(
        "--skip-scrape",
        action="store_true",
        help="pula a etapa de scraping e roda apenas o backfill, se habilitado",
    )
    parser.add_argument(
        "--backfill-missing-geocodes",
        action="store_true",
        help="reprocessa butecos já salvos com lat/lng nulos usando o endereço do banco",
    )
    return parser.parse_args(argv if argv is not None else [])


def scrape_and_upsert_butecos(conn) -> tuple[int, int]:
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

    return total, errors


def should_exit_with_error(
    total: int,
    errors: int,
    backfill_attempted: bool,
    backfill_updated: int,
    backfill_failed: int,
) -> bool:
    if total > 0 or errors == 0:
        return False

    if not backfill_attempted:
        return True

    return backfill_updated == 0 and backfill_failed > 0


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    db_url = resolve_database_url()
    conn = psycopg2.connect(db_url)
    print("Conectado ao banco.")

    total = 0
    errors = 0
    backfill_updated = 0
    backfill_failed = 0

    if not args.skip_scrape:
        total, errors = scrape_and_upsert_butecos(conn)

    if args.backfill_missing_geocodes:
        backfill_updated, backfill_failed = backfill_missing_coordinates(conn)

    conn.close()
    print(f"\nConcluído: {total} butecos inseridos/atualizados, {errors} erros.")

    if args.backfill_missing_geocodes:
        print(
            "Backfill: "
            f"{backfill_updated} butecos geolocalizados, "
            f"{backfill_failed} ainda pendentes."
        )

    if should_exit_with_error(
        total,
        errors,
        args.backfill_missing_geocodes,
        backfill_updated,
        backfill_failed,
    ):
        sys.exit(1)


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

    lat, lng = geocode_address(endereco, cidade=cidade, bairro=bairro) if endereco else (None, None)
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
            lat           = COALESCE(EXCLUDED.lat, "Buteco".lat),
            lng           = COALESCE(EXCLUDED.lng, "Buteco".lng),
            "updatedAt"   = NOW()
    """
    with conn.cursor() as cur:
        cur.execute(sql, data)
    conn.commit()


if __name__ == "__main__":
    main(sys.argv[1:])
