# 🍺 Onde Tem Buteco

[![Code quality](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/quality.yml/badge.svg)](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/quality.yml)
[![CodeQL SAST](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/codeql.yml/badge.svg)](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/codeql.yml)
[![Security scanning](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/security.yml/badge.svg)](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/security.yml)
[![Scraper semanal](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/scraper.yml/badge.svg)](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/scraper.yml)
[![OpenSSF Scorecard](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/scorecard.yml/badge.svg)](https://github.com/gianimpronta/onde-tem-buteco/actions/workflows/scorecard.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Encontre botecos do Comida di Buteco perto de você, monte seu roteiro e registre os que já visitou.

---

## O que é

**Onde Tem Buteco** é um web app fan-made que complementa o site oficial do [Comida di Buteco](https://comidadibuteco.com.br), preenchendo lacunas de experiência como:

- 🗺️ **Mapa interativo** com todos os botecos participantes
- 🔍 **Filtro por bairro** e busca por nome do bar ou petisco
- 📍 **Página de detalhe** com foto, descrição do petisco, endereço e horários
- ⭐ **Favoritos** — salve os bares que você quer visitar
- ✅ **Histórico** — registre os bares que já visitou

> **Aviso:** Este projeto não tem vínculo oficial com o Comida di Buteco. Os dados exibidos são de propriedade do concurso e obtidos via scraping do site oficial exclusivamente para fins não-comerciais.

---

## Stack

| Camada         | Tecnologia                           |
| -------------- | ------------------------------------ |
| Framework      | Next.js 15 (App Router) + TypeScript |
| Estilização    | Tailwind CSS                         |
| ORM            | Prisma                               |
| Banco de dados | Vercel Postgres (Neon)               |
| Autenticação   | NextAuth.js v5 (Google OAuth)        |
| Mapa           | Leaflet.js                           |
| Scraper        | Python 3.12 + BeautifulSoup          |
| CI/CD          | GitHub Actions                       |
| Hospedagem     | Vercel                               |

---

## Rodando localmente

### Pré-requisitos

- Node.js 20+
- Python 3.12+
- Uma instância PostgreSQL (local ou Neon free tier)

### 1. Clone o repositório

```bash
git clone https://github.com/gianimpronta/onde-tem-buteco.git
cd onde-tem-buteco
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com seus valores
```

### 3. Instale as dependências e rode as migrations

```bash
cd apps/web
npm install
npx prisma migrate dev
```

### 4. Popule o banco com o scraper

```bash
cd ../../scraper
pip install -r requirements.txt
DATABASE_URL=<sua_url> python main.py
```

### 5. Inicie o servidor de desenvolvimento

```bash
cd ../apps/web
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 6. Rode os testes end-to-end

```bash
cd apps/web
pnpm install
pnpm exec playwright install chromium
pnpm test:e2e
```

Os testes e2e usam fixtures estáveis para os fluxos públicos e não dependem do banco real para a execução local ou em CI.

---

## Scraper

O scraper coleta os dados dos botecos participantes do site oficial e faz upsert no banco de dados.

- **Fonte:** `https://comidadibuteco.com.br/butecos/`
- **Frequência em produção:** Toda segunda-feira às 06h via GitHub Actions
- **Rate limiting:** 500ms entre requisições para respeitar o servidor de origem

Para rodar manualmente:

```bash
cd scraper
pip install -r requirements.txt
DATABASE_URL=<url> python main.py
```

Para reprocessar apenas os butecos que já estão no banco sem `lat/lng`:

```bash
cd scraper
pip install -r requirements.txt
DATABASE_URL=<url> python main.py --skip-scrape --backfill-missing-geocodes
```

---

## Variáveis de ambiente necessárias

Veja o arquivo [`.env.example`](.env.example) para a lista completa com instruções de onde obter cada valor.

---

## Contribuindo

1. Fork o repositório
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit seguindo [Conventional Commits](https://www.conventionalcommits.org/): `feat: adiciona filtro por bairro`
4. Abra um Pull Request descrevendo o que foi feito e como testar

Para agentes de IA e colaboradores: leia o [`CLAUDE.md`](CLAUDE.md) antes de começar.

---

## Licença

[MIT](LICENSE) — use livremente com atribuição.

---

## Créditos

- Dados dos botecos: [Comida di Buteco](https://comidadibuteco.com.br)
- Mapas: [OpenStreetMap](https://www.openstreetmap.org) via [Leaflet](https://leafletjs.com)
- Geocodificação: [Nominatim](https://nominatim.org)
