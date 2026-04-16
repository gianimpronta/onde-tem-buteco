"""Unit tests for scraper/main.py"""

from unittest.mock import MagicMock, patch

from bs4 import BeautifulSoup

from main import (
    _parse_location,
    _parse_section_fields,
    fs_request,
    get_slugs,
    scrape_buteco,
)

# ── _parse_location ──────────────────────────────────────────────────────────


class TestParseLocation:
    def test_city_and_district(self):
        cidade, bairro = _parse_location("Rua das Flores, 123, Santa Efigênia, Belo Horizonte")
        assert cidade == "Belo Horizonte"
        assert bairro == "Santa Efigênia"

    def test_strips_state_abbreviation(self):
        cidade, bairro = _parse_location("Rua A, Centro, São Paulo, SP")
        assert cidade == "São Paulo"
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


# ── _parse_section_fields ────────────────────────────────────────────────────


def make_section(html: str):
    """Wrap HTML in a div.section-text and return the BS4 element."""
    soup = BeautifulSoup(f"<div class='section-text'>{html}</div>", "html.parser")
    return soup.select_one(".section-text")


class TestParseSectionFields:
    def test_parses_endereco(self):
        section = make_section("<p><b>Endereço:</b> Rua das Flores, 10</p>")
        result = _parse_section_fields(section)
        assert result["endereco"] == "Rua das Flores, 10"

    def test_parses_telefone(self):
        section = make_section("<p><b>Telefone:</b> (31) 3333-4444</p>")
        result = _parse_section_fields(section)
        assert result["telefone"] == "(31) 3333-4444"

    def test_parses_horario(self):
        section = make_section("<p><b>Horário:</b> Seg a Sex, 18h às 23h</p>")
        result = _parse_section_fields(section)
        assert result["horario"] == "Seg a Sex, 18h às 23h"

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
            "<p><b>Endereço:</b> Av. Brasil, 500, Centro, BH</p>"
            "<p><b>Telefone:</b> (31) 9999-0000</p>"
            "<p><b>Horário:</b> Diário, 11h às 22h</p>"
        )
        result = _parse_section_fields(make_section(html))
        assert result["petisco_nome"] == "Pastel de Vento"
        assert result["petisco_desc"] == "Fininho e crocante"
        assert result["endereco"] == "Av. Brasil, 500, Centro, BH"
        assert result["telefone"] == "(31) 9999-0000"
        assert result["horario"] == "Diário, 11h às 22h"

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


# ── fs_request ───────────────────────────────────────────────────────────────


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


# ── get_slugs ────────────────────────────────────────────────────────────────

_SLUG_PAGE_HTML = """
<html><body>
  <a href="/buteco/bar-do-ze/">Bar do Zé</a>
  <a href="/buteco/cantina-italiana/">Cantina</a>
  <a href="/buteco/bar-do-ze/">Bar do Zé (dup)</a>
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


# ── scrape_buteco ────────────────────────────────────────────────────────────

_BUTECO_HTML = """
<html><body>
  <h1 class="section-title">Bar do Zé</h1>
  <img class="img-single" src="https://example.com/foto.jpg">
  <div class="section-text">
    <p><b>Torresmo Artesanal</b>: Crocante e temperado</p>
    <p><b>Endereço:</b> Rua A, 1, Floresta, Belo Horizonte, MG</p>
    <p><b>Telefone:</b> (31) 3333-0000</p>
    <p><b>Horário:</b> Ter a Dom, 17h às 23h</p>
  </div>
</body></html>
"""


class TestScrapeButeco:
    def test_parses_full_page(self):
        with patch("main.fs_request", return_value=_BUTECO_HTML):
            data = scrape_buteco("bar-do-ze")
        assert data["slug"] == "bar-do-ze"
        assert data["nome"] == "Bar do Zé"
        assert data["cidade"] == "Belo Horizonte"
        assert data["bairro"] == "Floresta"
        assert "Rua A, 1" in data["endereco"]
        assert data["telefone"] == "(31) 3333-0000"
        assert "17h" in data["horario"]
        assert data["petisco_nome"] == "Torresmo Artesanal"
        assert data["petisco_desc"] == "Crocante e temperado"
        assert data["foto_url"] == "https://example.com/foto.jpg"

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
            "<p><b>Endereço:</b> Rua B, Centro, Rio de Janeiro</p>"
            "</div></body></html>"
        )
        with patch("main.fs_request", return_value=html):
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
