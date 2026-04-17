# Python Unit Tests — scraper/main.py Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write unit tests for `scraper/main.py` to bring Python coverage above the SonarCloud 80% threshold.

**Architecture:** Pure functions (`_parse_location`, `_parse_section_fields`) are tested directly with fixtures. Network-dependent functions (`get_slugs`, `scrape_buteco`) are tested with `unittest.mock.patch` targeting `scraper.main.fs_request`. All tests live in `scraper/tests/test_main.py` and are discovered by pytest.

**Tech Stack:** pytest 8.3.5, pytest-cov 6.1.0, beautifulsoup4 4.12.3, unittest.mock (stdlib)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `scraper/tests/test_main.py` | Create | All unit tests |
| `scraper/tests/__init__.py` | Already exists | Package marker |
| `scraper/.coveragerc` | Already exists | Omits test files from coverage |
| `scraper/requirements.txt` | Modify | Add pytest + pytest-cov dev deps |

---

### Task 1: Tests for `_parse_location`

`_parse_location(endereco)` splits an address string into `(cidade, bairro)`. It strips trailing UF codes (e.g., `SP`, `MG`) and takes the last and second-to-last comma-separated parts.

**Files:**
- Create: `scraper/tests/test_main.py`

- [ ] **Step 1: Add pytest and pytest-cov to requirements.txt**

Open `scraper/requirements.txt` and append:

```
pytest==8.3.5
pytest-cov==6.1.0
```

- [ ] **Step 2: Write failing tests for `_parse_location`**

Create `scraper/tests/test_main.py`:

```python
import pytest
from scraper.main import _parse_location


class TestParseLocation:
    def test_full_address_with_uf(self):
        endereco = "Rua das Flores, 123, Centro, Belo Horizonte, MG"
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Belo Horizonte"
        assert bairro == "Centro"

    def test_full_address_without_uf(self):
        endereco = "Rua das Flores, 123, Centro, Belo Horizonte"
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Belo Horizonte"
        assert bairro == "Centro"

    def test_address_only_city(self):
        # Only one part after stripping UF → bairro is None
        endereco = "Belo Horizonte, MG"
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Belo Horizonte"
        assert bairro is None

    def test_address_city_and_bairro_no_uf(self):
        endereco = "Santa Efigênia, Belo Horizonte"
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Belo Horizonte"
        assert bairro == "Santa Efigênia"

    def test_address_trims_whitespace(self):
        endereco = "  Rua X ,  Centro ,  Curitiba , PR  "
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Curitiba"
        assert bairro == "Centro"

    def test_single_part_no_uf(self):
        endereco = "Belo Horizonte"
        cidade, bairro = _parse_location(endereco)
        assert cidade == "Belo Horizonte"
        assert bairro is None
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/test_main.py::TestParseLocation -v
```

Expected: `ImportError` or `ModuleNotFoundError` — `scraper.main` not importable yet (no `scraper/__init__.py`).

- [ ] **Step 4: Create `scraper/__init__.py` to make it a package**

```bash
touch scraper/__init__.py
```

Or create the file with empty content.

- [ ] **Step 5: Run tests again**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/test_main.py::TestParseLocation -v
```

Expected: All 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add scraper/__init__.py scraper/tests/test_main.py scraper/requirements.txt
git commit -m "test: adiciona testes unitários para _parse_location"
```

---

### Task 2: Tests for `_parse_section_fields`

`_parse_section_fields(section)` takes a BeautifulSoup element (`.section-text`) and returns a dict with `endereco`, `telefone`, `horario`, `petisco_nome`, `petisco_desc`. The first `<p>` with a `<b>` that doesn't match known labels becomes the petisco.

**Files:**
- Modify: `scraper/tests/test_main.py`

- [ ] **Step 1: Write failing tests for `_parse_section_fields`**

Append to `scraper/tests/test_main.py`:

```python
from bs4 import BeautifulSoup
from scraper.main import _parse_section_fields


def _make_section(html: str) -> BeautifulSoup:
    """Wrap html in a div and return the div element."""
    soup = BeautifulSoup(f"<div class='section-text'>{html}</div>", "html.parser")
    return soup.select_one(".section-text")


class TestParseSectionFields:
    def test_all_fields_present(self):
        section = _make_section("""
            <p><b>Petisco Incrível</b> Descrição do petisco</p>
            <p><b>Endereço:</b> Rua X, 10, Centro, BH, MG</p>
            <p><b>Telefone:</b> (31) 9999-9999</p>
            <p><b>Horário:</b> Seg a Sex 18h–23h</p>
        """)
        result = _parse_section_fields(section)
        assert result["petisco_nome"] == "Petisco Incrível"
        assert result["petisco_desc"] == "Descrição do petisco"
        assert result["endereco"] == "Rua X, 10, Centro, BH, MG"
        assert result["telefone"] == "(31) 9999-9999"
        assert result["horario"] == "Seg a Sex 18h–23h"

    def test_endereco_accent_variant(self):
        section = _make_section("""
            <p><b>Endereço:</b> Av. Brasil, 1, São Paulo</p>
        """)
        result = _parse_section_fields(section)
        assert result["endereco"] == "Av. Brasil, 1, São Paulo"

    def test_endereco_no_accent(self):
        section = _make_section("""
            <p><b>Endereco:</b> Av. Brasil, 1, São Paulo</p>
        """)
        result = _parse_section_fields(section)
        assert result["endereco"] == "Av. Brasil, 1, São Paulo"

    def test_missing_optional_fields_return_none(self):
        section = _make_section("""
            <p><b>Endereço:</b> Rua Y, 5, Centro, BH</p>
        """)
        result = _parse_section_fields(section)
        assert result["telefone"] is None
        assert result["horario"] is None
        assert result["petisco_nome"] is None
        assert result["petisco_desc"] is None

    def test_petisco_without_description(self):
        section = _make_section("""
            <p><b>Só o Nome</b></p>
        """)
        result = _parse_section_fields(section)
        assert result["petisco_nome"] == "Só o Nome"
        assert result["petisco_desc"] is None

    def test_paragraph_without_bold_is_ignored(self):
        section = _make_section("""
            <p>Texto sem negrito</p>
            <p><b>Endereço:</b> Rua Z</p>
        """)
        result = _parse_section_fields(section)
        assert result["endereco"] == "Rua Z"

    def test_empty_section_returns_all_none(self):
        section = _make_section("")
        result = _parse_section_fields(section)
        assert result == {
            "endereco": None,
            "telefone": None,
            "horario": None,
            "petisco_nome": None,
            "petisco_desc": None,
        }

    def test_horario_accent_variant(self):
        section = _make_section("""
            <p><b>Horario:</b> Dom 12h–18h</p>
        """)
        result = _parse_section_fields(section)
        assert result["horario"] == "Dom 12h–18h"
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/test_main.py::TestParseSectionFields -v
```

Expected: All 8 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add scraper/tests/test_main.py
git commit -m "test: adiciona testes unitários para _parse_section_fields"
```

---

### Task 3: Tests for `get_slugs`

`get_slugs(page)` calls `fs_request(url)`, parses the HTML and extracts unique slugs from `a[href*='/buteco/']` links. Returns `[]` on empty HTML or no matches.

**Files:**
- Modify: `scraper/tests/test_main.py`

- [ ] **Step 1: Write failing tests for `get_slugs`**

Append to `scraper/tests/test_main.py`:

```python
from unittest.mock import patch
from scraper.main import get_slugs


class TestGetSlugs:
    def test_returns_slugs_from_html(self):
        html = """
        <html><body>
          <a href="/buteco/bar-do-ze/">Bar do Zé</a>
          <a href="/buteco/boteco-antigo/">Boteco Antigo</a>
        </body></html>
        """
        with patch("scraper.main.fs_request", return_value=html) as mock_fs:
            result = get_slugs(1)
        mock_fs.assert_called_once_with("https://comidadibuteco.com.br/butecos/page/1/")
        assert result == ["bar-do-ze", "boteco-antigo"]

    def test_deduplicates_slugs(self):
        html = """
        <html><body>
          <a href="/buteco/bar-do-ze/">Link 1</a>
          <a href="/buteco/bar-do-ze/">Link 2 duplicado</a>
          <a href="/buteco/boteco-antigo/">Boteco Antigo</a>
        </body></html>
        """
        with patch("scraper.main.fs_request", return_value=html):
            result = get_slugs(1)
        assert result == ["bar-do-ze", "boteco-antigo"]
        assert len(result) == 2

    def test_returns_empty_on_empty_html(self):
        with patch("scraper.main.fs_request", return_value=""):
            result = get_slugs(1)
        assert result == []

    def test_returns_empty_when_no_buteco_links(self):
        html = "<html><body><a href='/outra/pagina/'>Outro</a></body></html>"
        with patch("scraper.main.fs_request", return_value=html):
            result = get_slugs(1)
        assert result == []

    def test_uses_correct_page_url(self):
        html = "<html><body><a href='/buteco/slug-x/'>X</a></body></html>"
        with patch("scraper.main.fs_request", return_value=html) as mock_fs:
            get_slugs(5)
        mock_fs.assert_called_once_with("https://comidadibuteco.com.br/butecos/page/5/")
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/test_main.py::TestGetSlugs -v
```

Expected: All 5 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add scraper/tests/test_main.py
git commit -m "test: adiciona testes unitários para get_slugs"
```

---

### Task 4: Tests for `scrape_buteco`

`scrape_buteco(slug)` calls `fs_request(url)`, parses the full buteco page HTML, and returns a dict with all fields. Returns `{}` on empty HTML or missing `h1.section-title`.

**Files:**
- Modify: `scraper/tests/test_main.py`

- [ ] **Step 1: Write failing tests for `scrape_buteco`**

Append to `scraper/tests/test_main.py`:

```python
from scraper.main import scrape_buteco


def _buteco_html(
    nome="Bar do Zé",
    foto_src=None,
    foto_data_src=None,
    endereco="Rua X, 10, Centro, Belo Horizonte, MG",
    telefone="(31) 9999-9999",
    horario="Seg–Sex 18h–23h",
    petisco_nome="Bolinho de Bacalhau",
    petisco_desc="Crocante por fora",
) -> str:
    foto_attrs = ""
    if foto_src:
        foto_attrs = f'src="{foto_src}"'
    elif foto_data_src:
        foto_attrs = f'data-src="{foto_data_src}"'

    foto_tag = f'<img class="img-single" {foto_attrs} />' if (foto_src or foto_data_src) else ""

    return f"""
    <html><body>
      <h1 class="section-title">{nome}</h1>
      {foto_tag}
      <div class="section-text">
        <p><b>{petisco_nome}</b> {petisco_desc}</p>
        <p><b>Endereço:</b> {endereco}</p>
        <p><b>Telefone:</b> {telefone}</p>
        <p><b>Horário:</b> {horario}</p>
      </div>
    </body></html>
    """


class TestScrapButeco:
    def test_returns_full_data(self):
        html = _buteco_html()
        with patch("scraper.main.fs_request", return_value=html) as mock_fs:
            result = scrape_buteco("bar-do-ze")
        mock_fs.assert_called_once_with("https://comidadibuteco.com.br/buteco/bar-do-ze/")
        assert result["slug"] == "bar-do-ze"
        assert result["nome"] == "Bar do Zé"
        assert result["cidade"] == "Belo Horizonte"
        assert result["bairro"] == "Centro"
        assert result["endereco"] == "Rua X, 10, Centro, Belo Horizonte, MG"
        assert result["telefone"] == "(31) 9999-9999"
        assert result["horario"] == "Seg–Sex 18h–23h"
        assert result["petisco_nome"] == "Bolinho de Bacalhau"
        assert result["petisco_desc"] == "Crocante por fora"

    def test_foto_url_from_src(self):
        html = _buteco_html(foto_src="https://cdn.example.com/foto.jpg")
        with patch("scraper.main.fs_request", return_value=html):
            result = scrape_buteco("bar-do-ze")
        assert result["foto_url"] == "https://cdn.example.com/foto.jpg"

    def test_foto_url_from_data_src(self):
        html = _buteco_html(foto_data_src="https://cdn.example.com/lazy.jpg")
        with patch("scraper.main.fs_request", return_value=html):
            result = scrape_buteco("bar-do-ze")
        assert result["foto_url"] == "https://cdn.example.com/lazy.jpg"

    def test_no_foto_returns_none(self):
        html = _buteco_html()
        with patch("scraper.main.fs_request", return_value=html):
            result = scrape_buteco("bar-do-ze")
        assert result["foto_url"] is None

    def test_returns_empty_dict_on_empty_html(self):
        with patch("scraper.main.fs_request", return_value=""):
            result = scrape_buteco("nao-existe")
        assert result == {}

    def test_returns_empty_dict_when_no_h1(self):
        html = "<html><body><p>Sem título</p></body></html>"
        with patch("scraper.main.fs_request", return_value=html):
            result = scrape_buteco("sem-titulo")
        assert result == {}

    def test_no_section_text_returns_none_fields(self):
        html = """
        <html><body>
          <h1 class="section-title">Bar Vazio</h1>
        </body></html>
        """
        with patch("scraper.main.fs_request", return_value=html):
            result = scrape_buteco("bar-vazio")
        assert result["nome"] == "Bar Vazio"
        assert result["endereco"] == ""
        assert result["cidade"] == ""
        assert result["bairro"] is None
        assert result["telefone"] is None
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/test_main.py::TestScrapButeco -v
```

Expected: All 8 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add scraper/tests/test_main.py
git commit -m "test: adiciona testes unitários para scrape_buteco"
```

---

### Task 5: Verify coverage report

Run the full test suite with coverage and confirm the XML report is generated and meets the 80% threshold.

**Files:**
- No changes — verify existing config works end-to-end.

- [ ] **Step 1: Install test dependencies**

```bash
cd E:/repo/onde-tem-buteco/scraper
pip install pytest==8.3.5 pytest-cov==6.1.0 beautifulsoup4==4.12.3
```

- [ ] **Step 2: Run all tests with coverage**

```bash
cd E:/repo/onde-tem-buteco
python -m pytest scraper/tests/ \
  --cov=scraper \
  --cov-report=xml:scraper/coverage.xml \
  --cov-report=term-missing \
  --cov-config=scraper/.coveragerc \
  -v
```

Expected output:
- All tests PASS (no failures)
- Coverage report shows `scraper/main.py` coverage ≥ 80%
- `scraper/coverage.xml` is created

- [ ] **Step 3: Verify coverage.xml exists**

```bash
head -5 scraper/coverage.xml
```

Expected: XML header + `<coverage>` root element.

- [ ] **Step 4: Verify `scraper/__init__.py` is not accidentally covered**

Check the coverage term output — `scraper/__init__.py` should appear with 100% (empty file) and `scraper/tests/test_main.py` should NOT appear (omitted by `.coveragerc`).

- [ ] **Step 5: Commit and push**

```bash
git add scraper/__init__.py scraper/tests/test_main.py scraper/requirements.txt
git push
```

Note: If `scraper/__init__.py` was already committed in Task 1, only add the remaining files.

- [ ] **Step 6: Verify CI passes**

After pushing, check the `coverage-python` job in GitHub Actions:

```
https://github.com/gianimpronta/onde-tem-buteco/actions
```

Expected: `coverage-python` job succeeds, uploads `scraper/coverage.xml` artifact.

---

## Self-Review

### Spec Coverage
- `_parse_location` → Task 1 ✅
- `_parse_section_fields` → Task 2 ✅
- `get_slugs` → Task 3 ✅
- `scrape_buteco` → Task 4 ✅
- CI coverage report → Task 5 ✅
- SonarCloud 80% threshold → Covered by Task 5 verification

### Functions NOT covered by tests (intentional)
- `fs_request` — thin wrapper over `requests.post`; tested implicitly via mocks
- `fs_create_session` — same; fire-and-forget, ignores exceptions
- `upsert_buteco` — requires a live database connection; excluded from unit test scope
- `main` — orchestration; requires live DB + FlareSolverr

Coverage of the 4 targeted functions should bring `scraper/main.py` to ~65–75% line coverage. If SonarCloud still fails the 80% gate, add tests for `fs_request` (mock `requests.post`) and `fs_create_session` as a bonus Task 6.
