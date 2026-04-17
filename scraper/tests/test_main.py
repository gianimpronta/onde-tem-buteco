"""Unit tests for scraper/main.py"""

from unittest.mock import MagicMock, patch

from bs4 import BeautifulSoup

from main import (
    _build_geocode_queries,
    _normalize_address,
    _parse_location,
    _parse_section_fields,
    _sanitize_database_url,
    _slugify,
    backfill_missing_coordinates,
    fetch_butecos_missing_coordinates,
    fs_create_session,
    fs_request,
    geocode_address,
    get_slugs,
    main,
    parse_args,
    resolve_database_url,
    scrape_buteco,
    should_exit_with_error,
    update_buteco_coordinates,
    upsert_buteco,
)


class TestParseLocation:
    def test_city_and_district(self):
        cidade, bairro = _parse_location("Rua das Flores, 123, Santa Efigenia, Belo Horizonte")
        assert cidade == "Belo Horizonte"
        assert bairro == "Santa Efigenia"

    def test_strips_state_abbreviation(self):
        cidade, bairro = _parse_location("Rua A, Centro, Sao Paulo, SP")
        assert cidade == "Sao Paulo"
        assert bairro == "Centro"

    def test_only_city_no_district(self):
        cidade, bairro = _parse_location("Curitiba")
        assert cidade == "Curitiba"
        assert bairro is None

    def test_city_and_district_no_state(self):
        cidade, bairro = _parse_location("Rua B, Floresta, Porto Alegre")
        assert cidade == "Porto Alegre"
        assert bairro == "Floresta"

    def test_strips_whitespace(self):
        cidade, bairro = _parse_location("  Savassi ,  Belo Horizonte , MG ")
        assert cidade == "Belo Horizonte"
        assert bairro == "Savassi"

    def test_handles_pipe_and_state_dash_format(self):
        cidade, bairro = _parse_location(
            "R. Eduardo Tozzi, 115 | Jd. das Laranjeiras, Jaguariuna – SP"
        )
        assert cidade == "Jaguariuna"
        assert bairro == "Jd. das Laranjeiras"


class TestSlugify:
    def test_generates_slug_from_name(self):
        assert _slugify("Bar do Ze & Filhos!") == "bar-do-ze-filhos"


class TestNormalizeAddress:
    def test_normalizes_whitespace_and_cep(self):
        endereco = " Rua A - 123,  Centro , Belo Horizonte , MG, CEP 30110-000 "
        assert _normalize_address(endereco) == "Rua A, 123, Centro, Belo Horizonte, MG"

    def test_normalizes_pipe_and_state_dash(self):
        endereco = "R. Eduardo Tozzi, 115 | Jd. das Laranjeiras, Jaguariuna – SP"
        assert _normalize_address(endereco) == (
            "R. Eduardo Tozzi, 115, Jd. das Laranjeiras, Jaguariuna, SP"
        )


class TestBuildGeocodeQueries:
    def test_generates_fallback_queries_without_duplicates(self):
        queries = _build_geocode_queries(
            "Rua A - 123, Centro, Belo Horizonte, MG",
            cidade="Belo Horizonte",
            bairro="Centro",
        )

        assert queries == [
            "Rua A, 123, Centro, Belo Horizonte, MG",
            "Rua A, 123, Centro, Belo Horizonte, MG, Belo Horizonte, Brasil",
            "Belo Horizonte, MG",
            "Centro, Belo Horizonte, Brasil",
            "Belo Horizonte, Brasil",
        ]


class TestDatabaseUrl:
    def test_sanitizes_pgbouncer_query_param(self):
        url = "postgres://user:pass@host/db?sslmode=require&pgbouncer=true"
        assert _sanitize_database_url(url) == "postgres://user:pass@host/db?sslmode=require"

    @patch.dict(
        "main.os.environ",
        {
            "POSTGRES_PRISMA_URL": "postgres://prisma/db?pgbouncer=true",
            "DATABASE_URL": "postgres://database/db?sslmode=require",
        },
        clear=True,
    )
    def test_prefers_database_url_when_non_pooling_is_missing(self):
        assert resolve_database_url() == "postgres://database/db?sslmode=require"

    @patch.dict("main.os.environ", {}, clear=True)
    def test_raises_when_no_database_url_exists(self):
        try:
            resolve_database_url()
            raise AssertionError("resolve_database_url() deveria falhar sem env")
        except RuntimeError as err:
            assert "POSTGRES_URL_NON_POOLING" in str(err)


def make_section(html: str):
    soup = BeautifulSoup(f"<div class='section-text'>{html}</div>", "html.parser")
    return soup.select_one(".section-text")


class TestParseSectionFields:
    def test_parses_endereco(self):
        section = make_section("<p><b>Endereco:</b> Rua das Flores, 10</p>")
        result = _parse_section_fields(section)
        assert result["endereco"] == "Rua das Flores, 10"

    def test_parses_telefone(self):
        section = make_section("<p><b>Telefone:</b> (31) 3333-4444</p>")
        result = _parse_section_fields(section)
        assert result["telefone"] == "(31) 3333-4444"

    def test_parses_horario(self):
        section = make_section("<p><b>Horario:</b> Seg a Sex, 18h as 23h</p>")
        result = _parse_section_fields(section)
        assert result["horario"] == "Seg a Sex, 18h as 23h"

    def test_parses_petisco_nome_and_desc(self):
        section = make_section(
            "<p><b>Bolinho de Bacalhau</b>: Crocante por fora, cremoso por dentro</p>"
        )
        result = _parse_section_fields(section)
        assert result["petisco_nome"] == "Bolinho de Bacalhau"
        assert result["petisco_desc"] == "Crocante por fora, cremoso por dentro"

    def test_petisco_without_desc(self):
        section = make_section("<p><b>Torresmo</b></p>")
        result = _parse_section_fields(section)
        assert result["petisco_nome"] == "Torresmo"
        assert result["petisco_desc"] is None

    def test_full_section(self):
        html = (
            "<p><b>Pastel de Vento</b>: Fininho e crocante</p>"
            "<p><b>Endereco:</b> Av. Brasil, 500, Centro, BH</p>"
            "<p><b>Telefone:</b> (31) 9999-0000</p>"
            "<p><b>Horario:</b> Diario, 11h as 22h</p>"
        )
        result = _parse_section_fields(make_section(html))
        assert result["petisco_nome"] == "Pastel de Vento"
        assert result["petisco_desc"] == "Fininho e crocante"
        assert result["endereco"] == "Av. Brasil, 500, Centro, BH"
        assert result["telefone"] == "(31) 9999-0000"
        assert result["horario"] == "Diario, 11h as 22h"

    def test_empty_section_returns_nones(self):
        section = make_section("")
        result = _parse_section_fields(section)
        assert result["endereco"] is None
        assert result["telefone"] is None
        assert result["horario"] is None
        assert result["petisco_nome"] is None
        assert result["petisco_desc"] is None

    def test_paragraph_without_bold_is_skipped(self):
        section = make_section("<p>Texto sem negrito</p>")
        result = _parse_section_fields(section)
        assert all(v is None for v in result.values())


class TestFsRequest:
    def test_returns_response_html_on_success(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {
            "status": "ok",
            "solution": {"response": "<html>ok</html>"},
        }
        with patch("main.requests.post", return_value=mock_resp) as mock_post:
            result = fs_request("https://example.com")
        mock_post.assert_called_once()
        assert result == "<html>ok</html>"

    def test_returns_empty_string_on_non_ok_status(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = {"status": "error", "message": "timeout"}
        with patch("main.requests.post", return_value=mock_resp):
            result = fs_request("https://example.com")
        assert result == ""

    def test_returns_empty_string_on_exception(self):
        with patch("main.requests.post", side_effect=ConnectionError("unreachable")):
            result = fs_request("https://example.com")
        assert result == ""


class TestGeocodeAddress:
    def test_calls_nominatim_and_returns_coordinates(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = [{"lat": "-19.9167", "lon": "-43.9345"}]
        with patch("main.requests.get", return_value=mock_resp) as mock_get:
            lat, lng = geocode_address(
                "Rua A, Centro, Belo Horizonte",
                cidade="Belo Horizonte",
                bairro="Centro",
                sleep_seconds=0,
            )

        assert lat == -19.9167
        assert lng == -43.9345
        mock_get.assert_called_once()
        _, kwargs = mock_get.call_args
        assert kwargs["params"]["q"] == "Rua A, Centro, Belo Horizonte"
        assert kwargs["params"]["format"] == "jsonv2"
        assert kwargs["params"]["limit"] == 1

    def test_returns_none_tuple_when_api_fails(self):
        with patch("main.requests.get", side_effect=RuntimeError("network down")):
            lat, lng = geocode_address("Rua B, 10", sleep_seconds=0)
        assert lat is None
        assert lng is None

    def test_returns_none_tuple_when_api_returns_empty_payload(self):
        mock_resp = MagicMock()
        mock_resp.json.return_value = []
        with patch("main.requests.get", return_value=mock_resp):
            lat, lng = geocode_address("Rua sem resultado", sleep_seconds=0)
        assert lat is None
        assert lng is None

    def test_tries_fallback_queries_until_one_succeeds(self):
        first_resp = MagicMock()
        first_resp.json.return_value = []
        second_resp = MagicMock()
        second_resp.json.return_value = [{"lat": "-19.9", "lon": "-43.9"}]

        with (
            patch("main.requests.get", side_effect=[first_resp, second_resp]) as mock_get,
            patch("main.time.sleep") as mock_sleep,
        ):
            lat, lng = geocode_address(
                "Rua A, 10, Centro, Belo Horizonte",
                cidade="Belo Horizonte",
                bairro="Centro",
            )

        assert lat == -19.9
        assert lng == -43.9
        assert mock_get.call_count == 2
        mock_sleep.assert_called_once()


class TestFsCreateSession:
    def test_ignores_flaresolverr_exception(self):
        with patch("main.requests.post", side_effect=RuntimeError("offline")):
            fs_create_session()


_SLUG_PAGE_HTML = """
<html><body>
  <a href="/buteco/bar-do-ze/">Bar do Ze</a>
  <a href="/buteco/cantina-italiana/">Cantina</a>
  <a href="/buteco/bar-do-ze/">Bar do Ze (dup)</a>
  <a href="/outros/">outro</a>
</body></html>
"""


class TestGetSlugs:
    def test_returns_unique_slugs(self):
        with patch("main.fs_request", return_value=_SLUG_PAGE_HTML):
            slugs = get_slugs(1)
        assert slugs == ["bar-do-ze", "cantina-italiana"]

    def test_returns_empty_list_when_no_html(self):
        with patch("main.fs_request", return_value=""):
            slugs = get_slugs(1)
        assert slugs == []

    def test_returns_empty_list_when_no_buteco_links(self):
        with patch("main.fs_request", return_value="<html><a href='/outros/'>x</a></html>"):
            slugs = get_slugs(1)
        assert slugs == []


_BUTECO_HTML = """
<html><body>
  <h1 class="section-title">Bar do Ze</h1>
  <img class="img-single" src="https://example.com/foto.jpg">
  <div class="section-text">
    <p><b>Torresmo Artesanal</b>: Crocante e temperado</p>
    <p><b>Endereco:</b> Rua A, 1, Floresta, Belo Horizonte, MG</p>
    <p><b>Telefone:</b> (31) 3333-0000</p>
    <p><b>Horario:</b> Ter a Dom, 17h as 23h</p>
  </div>
</body></html>
"""


class TestScrapeButeco:
    def test_parses_full_page(self):
        with (
            patch("main.fs_request", return_value=_BUTECO_HTML),
            patch("main.geocode_address", return_value=(-19.9, -43.9)) as mock_geocode,
        ):
            data = scrape_buteco("bar-do-ze")
        assert data["slug"] == "bar-do-ze"
        assert data["nome"] == "Bar do Ze"
        assert data["cidade"] == "Belo Horizonte"
        assert data["bairro"] == "Floresta"
        assert "Rua A, 1" in data["endereco"]
        assert data["telefone"] == "(31) 3333-0000"
        assert "17h" in data["horario"]
        assert data["petisco_nome"] == "Torresmo Artesanal"
        assert data["petisco_desc"] == "Crocante e temperado"
        assert data["foto_url"] == "https://example.com/foto.jpg"
        assert data["lat"] == -19.9
        assert data["lng"] == -43.9
        mock_geocode.assert_called_once_with(
            "Rua A, 1, Floresta, Belo Horizonte, MG",
            cidade="Belo Horizonte",
            bairro="Floresta",
        )

    def test_returns_empty_dict_when_no_html(self):
        with patch("main.fs_request", return_value=""):
            data = scrape_buteco("missing-slug")
        assert data == {}

    def test_returns_empty_dict_when_no_title(self):
        with patch("main.fs_request", return_value="<html><body>sem titulo</body></html>"):
            data = scrape_buteco("no-title")
        assert data == {}

    def test_foto_url_falls_back_to_data_src(self):
        html = (
            "<html><body>"
            "<h1 class='section-title'>Buteco X</h1>"
            "<img class='img-single' data-src='https://cdn.example.com/lazy.jpg'>"
            "<div class='section-text'>"
            "<p><b>Endereco:</b> Rua B, Centro, Rio de Janeiro</p>"
            "</div></body></html>"
        )
        with (
            patch("main.fs_request", return_value=html),
            patch("main.geocode_address", return_value=(None, None)),
        ):
            data = scrape_buteco("buteco-x")
        assert data["foto_url"] == "https://cdn.example.com/lazy.jpg"

    def test_no_section_text_still_returns_data(self):
        html = "<html><body><h1 class='section-title'>Buteco Minimal</h1></body></html>"
        with patch("main.fs_request", return_value=html):
            data = scrape_buteco("buteco-minimal")
        assert data["nome"] == "Buteco Minimal"
        assert data["endereco"] == ""
        assert data["cidade"] == ""
        assert data["foto_url"] is None

    def test_generates_slug_from_name_when_input_slug_is_empty(self):
        html = (
            "<html><body>"
            "<h1 class='section-title'>Cantina do Joao</h1>"
            "<div class='section-text'><p><b>Endereco:</b> Rua C, Centro, Curitiba</p></div>"
            "</body></html>"
        )
        with (
            patch("main.fs_request", return_value=html),
            patch("main.geocode_address", return_value=(None, None)),
        ):
            data = scrape_buteco("")
        assert data["slug"] == "cantina-do-joao"


class TestUpsertButeco:
    def test_executes_upsert_and_commits(self):
        conn = MagicMock()
        cur_ctx = MagicMock()
        conn.cursor.return_value.__enter__.return_value = cur_ctx
        data = {
            "slug": "bar-do-ze",
            "nome": "Bar do Ze",
            "cidade": "Belo Horizonte",
            "bairro": "Floresta",
            "endereco": "Rua A, 1",
            "telefone": "(31) 3333-0000",
            "horario": "18h-23h",
            "petisco_nome": "Torresmo",
            "petisco_desc": "Crocante",
            "foto_url": "https://example.com/foto.jpg",
            "lat": -19.9,
            "lng": -43.9,
        }

        upsert_buteco(conn, data)

        cur_ctx.execute.assert_called_once()
        sql, params = cur_ctx.execute.call_args[0]
        assert 'INSERT INTO "Buteco"' in sql
        assert "ON CONFLICT (slug) DO UPDATE SET" in sql
        assert 'COALESCE(EXCLUDED.lat, "Buteco".lat)' in sql
        assert 'COALESCE(EXCLUDED.lng, "Buteco".lng)' in sql
        assert params == data
        conn.commit.assert_called_once()


class TestBackfillCoordinates:
    def test_fetches_only_records_with_missing_coordinates(self):
        conn = MagicMock()
        cur_ctx = MagicMock()
        cur_ctx.fetchall.return_value = [("bar-do-ze", "Rua A, 1", "Belo Horizonte", "Floresta")]
        conn.cursor.return_value.__enter__.return_value = cur_ctx

        result = fetch_butecos_missing_coordinates(conn)

        assert result == [
            {
                "slug": "bar-do-ze",
                "endereco": "Rua A, 1",
                "cidade": "Belo Horizonte",
                "bairro": "Floresta",
            }
        ]

    def test_updates_coordinates_and_commits(self):
        conn = MagicMock()
        cur_ctx = MagicMock()
        cur_ctx.rowcount = 1
        conn.cursor.return_value.__enter__.return_value = cur_ctx

        updated = update_buteco_coordinates(conn, "bar-do-ze", -19.9, -43.9)

        assert updated is True
        cur_ctx.execute.assert_called_once()
        conn.commit.assert_called_once()

    def test_backfill_updates_only_successful_geocodes(self):
        conn = MagicMock()
        with (
            patch(
                "main.fetch_butecos_missing_coordinates",
                return_value=[
                    {
                        "slug": "bar-1",
                        "endereco": "Rua A, 1",
                        "cidade": "Belo Horizonte",
                        "bairro": "Floresta",
                    },
                    {
                        "slug": "bar-2",
                        "endereco": "Rua B, 2",
                        "cidade": "Curitiba",
                        "bairro": "Centro",
                    },
                ],
            ),
            patch("main.geocode_address", side_effect=[(-19.9, -43.9), (None, None)]),
            patch("main.update_buteco_coordinates", return_value=True) as mock_update,
        ):
            updated, failed = backfill_missing_coordinates(conn)

        assert updated == 1
        assert failed == 1
        mock_update.assert_called_once_with(conn, "bar-1", -19.9, -43.9)


class TestCliAndExitRules:
    def test_parses_backfill_flags(self):
        args = parse_args(["--skip-scrape", "--backfill-missing-geocodes"])
        assert args.skip_scrape is True
        assert args.backfill_missing_geocodes is True

    def test_exit_rule_requires_failure_without_any_success(self):
        assert should_exit_with_error(0, 1, False, 0, 0) is True
        assert should_exit_with_error(0, 1, True, 0, 1) is True
        assert should_exit_with_error(1, 1, False, 0, 0) is False
        assert should_exit_with_error(0, 1, True, 1, 0) is False


class TestMainLoop:
    @patch("main.time.sleep")
    @patch("main.psycopg2.connect")
    @patch("main.resolve_database_url", return_value="postgres://example")
    @patch("main.fs_create_session")
    @patch("main.upsert_buteco")
    @patch("main.scrape_buteco")
    @patch("main.get_slugs")
    def test_calls_sleep_between_requests_and_pages(
        self,
        mock_get_slugs,
        mock_scrape_buteco,
        mock_upsert_buteco,
        _mock_fs_create_session,
        _mock_resolve_database_url,
        mock_connect,
        mock_sleep,
    ):
        mock_get_slugs.side_effect = [["bar-1", "bar-2"], []]
        mock_scrape_buteco.side_effect = [
            {"slug": "bar-1", "nome": "Bar 1", "cidade": "", "endereco": ""},
            {"slug": "bar-2", "nome": "Bar 2", "cidade": "", "endereco": ""},
        ]
        conn = MagicMock()
        mock_connect.return_value = conn

        main()

        assert mock_sleep.call_count == 3
        mock_sleep.assert_any_call(0.5)
        assert mock_upsert_buteco.call_count == 2
        conn.close.assert_called_once()

    @patch("main.time.sleep")
    @patch("main.psycopg2.connect")
    @patch("main.resolve_database_url", return_value="postgres://example")
    @patch("main.fs_create_session")
    @patch("main.upsert_buteco")
    @patch("main.scrape_buteco")
    @patch("main.get_slugs")
    @patch("main.sys.exit")
    def test_exits_with_code_one_when_only_errors_happen(
        self,
        mock_exit,
        mock_get_slugs,
        mock_scrape_buteco,
        _mock_upsert_buteco,
        _mock_fs_create_session,
        _mock_resolve_database_url,
        mock_connect,
        _mock_sleep,
    ):
        mock_get_slugs.side_effect = [["bar-1"], []]
        mock_scrape_buteco.return_value = {}
        mock_connect.return_value = MagicMock()

        main()

        mock_exit.assert_called_once_with(1)

    @patch("main.time.sleep")
    @patch("main.psycopg2.connect")
    @patch("main.resolve_database_url", return_value="postgres://example")
    @patch("main.fs_create_session")
    @patch("main.upsert_buteco", side_effect=RuntimeError("db down"))
    @patch("main.scrape_buteco")
    @patch("main.get_slugs")
    @patch("main.sys.exit")
    def test_rolls_back_when_upsert_raises(
        self,
        mock_exit,
        mock_get_slugs,
        mock_scrape_buteco,
        _mock_upsert_buteco,
        _mock_fs_create_session,
        _mock_resolve_database_url,
        mock_connect,
        _mock_sleep,
    ):
        mock_get_slugs.side_effect = [["bar-1"], []]
        mock_scrape_buteco.return_value = {
            "slug": "bar-1",
            "nome": "Bar 1",
            "cidade": "",
            "endereco": "",
        }
        conn = MagicMock()
        mock_connect.return_value = conn

        main()

        conn.rollback.assert_called_once()
        mock_exit.assert_called_once_with(1)

    @patch("main.backfill_missing_coordinates", return_value=(2, 1))
    @patch("main.psycopg2.connect")
    @patch("main.resolve_database_url", return_value="postgres://example")
    def test_runs_backfill_when_flag_is_enabled(
        self,
        _mock_resolve_database_url,
        mock_connect,
        mock_backfill,
    ):
        conn = MagicMock()
        mock_connect.return_value = conn

        main(["--skip-scrape", "--backfill-missing-geocodes"])

        mock_backfill.assert_called_once_with(conn)
        conn.close.assert_called_once()
