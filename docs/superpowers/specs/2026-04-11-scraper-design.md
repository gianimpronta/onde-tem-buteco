# Scraper Design — onde-tem-buteco

**Data:** 2026-04-11  
**Escopo:** Script Python para coletar dados do comidadibuteco.com.br e popular o banco PostgreSQL

---

## Contexto

O site comidadibuteco.com.br é um WordPress server-side rendered com ~92 páginas de listagem (~1100 butecos). Cada buteco tem uma página de detalhe em `/buteco/{slug}/` com todos os campos necessários. BeautifulSoup + requests é suficiente — sem JavaScript rendering.

---

## Arquitetura

Script único `scraper/main.py` com 4 funções:

### `get_slugs(page: int) -> list[str]`
- Busca `https://comidadibuteco.com.br/butecos/page/{page}/`
- Extrai slugs dos links "Detalhes" (`a[href*="/buteco/"]`)
- Retorna lista vazia quando página não existe (fim da paginação)

### `scrape_buteco(slug: str) -> dict`
- Busca `https://comidadibuteco.com.br/buteco/{slug}/`
- Extrai dados de `.section-text` e `img.img-single`
- Retorna dict com todos os campos do schema

### `upsert_buteco(conn, data: dict) -> None`
- `INSERT INTO "Buteco" (...) ON CONFLICT (slug) DO UPDATE SET ...`
- Nunca deleta registros existentes

### `main()`
- Itera páginas 1 em diante até `get_slugs` retornar vazio
- `time.sleep(0.5)` entre cada requisição (listagem e detalhe)
- Abre uma conexão psycopg2 e reutiliza durante toda a execução
- Imprime progresso: `[página X] slug → ok/erro`

---

## Extração de campos

| Campo | Origem |
|---|---|
| `slug` | Da URL `/buteco/{slug}/` |
| `nome` | `h1.section-title` |
| `petiscoNome` | Primeiro `<b>` do primeiro `<p>` em `.section-text` |
| `petiscoDesc` | Texto restante do mesmo `<p>` após o `<b>` |
| `endereco` | `<p><b>Endereço:</b> ...</p>` |
| `telefone` | `<p><b>Telefone:</b> ...</p>` |
| `horario` | `<p><b>Horario:</b> ...</p>` |
| `cidade` | Última parte do endereço (após última vírgula, sem estado) |
| `bairro` | Penúltima parte do endereço (heurística, pode ser `NULL`) |
| `fotoUrl` | `img.img-single[src]` |
| `lat`, `lng` | `NULL` — geocodificação em script separado |

---

## Dependências

```
requests==2.32.3
beautifulsoup4==4.12.3
psycopg2-binary==2.9.10
python-dotenv==1.0.1
```

---

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `POSTGRES_URL_NON_POOLING` | Conexão direta ao Supabase (sem PgBouncer) |

Carregada via `python-dotenv` de `.env` local ou injetada pelo GitHub Actions Secret.

---

## Estrutura de arquivos

```
scraper/
├── main.py
├── requirements.txt
└── .env.example
```

---

## GitHub Actions

`scraper/.github/workflows/scraper.yml` — cron toda segunda-feira às 06h UTC:
- Instala Python 3.12 + dependências
- Injeta `POSTGRES_URL_NON_POOLING` via secret
- Roda `python main.py`

---

## O que este script NÃO faz

- Deletar butecos do banco
- Geocodificar (lat/lng ficam NULL)
- Scraping paralelo / sem sleep
