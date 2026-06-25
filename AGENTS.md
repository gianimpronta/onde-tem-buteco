# AGENTS.md — onde-tem-buteco

Guia de desenvolvimento para agentes de IA e colaboradores. Leia inteiro antes de
escrever código. Estas instruções têm prioridade sobre o comportamento padrão.

> **Sincronização:** `CLAUDE.md` e `AGENTS.md` (raiz) devem estar sempre idênticos.
> Ao alterar stack, comandos, convenções ou regras, atualize os dois na mesma entrega.

---

## Visão geral

**Onde Tem Buteco** é um web app fan-made que complementa o site oficial do concurso
Comida di Buteco (comidadibuteco.com.br), preenchendo lacunas de UX: mapa interativo,
filtro por bairro, roteiro e conta de usuário com favoritos e histórico de visitas.

Os dados vêm **exclusivamente** do scraper do site oficial e **nunca** devem ser
editados manualmente no banco — a fonte da verdade é o scraper.

- **Repo (público):** `https://github.com/gianimpronta/onde-tem-buteco` — org `gianimpronta`
- **Branch default:** `main` · branches de trabalho `feat/...` `fix/...` a partir de `main`

---

## Stack

| Camada            | Tecnologia                                                            |
| ----------------- | -------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router) + React 19 + TypeScript                      |
| Estilização       | Tailwind CSS v4 (`@tailwindcss/postcss`) — sem CSS customizado       |
| ORM               | Prisma 7 (`@prisma/client` + `@prisma/adapter-pg`)                   |
| Banco             | Supabase Postgres (via driver adapter `pg.Pool`)                     |
| Autenticação      | NextAuth.js v5 (Google OAuth)                                        |
| Mapa              | Leaflet + `react-leaflet`                                            |
| Testes (web)      | Jest 30 + Testing Library (jsdom) · Playwright + `@axe-core` (E2E)  |
| Scraper           | Python 3.12 + BeautifulSoup + **FlareSolverr** · ruff · pytest       |
| Toolchain (web)   | **pnpm 11.5.1 (obrigatório — não usar npm)** · Node 22              |
| CI / Quality gate | GitHub Actions · SonarCloud                                          |
| Hospedagem        | Vercel                                                               |

---

## Comandos

> Comandos do app rodam a partir de `apps/web`. Use **sempre pnpm** (nunca npm/yarn).

| Comando                                                          | O que faz                                      |
| --------------------------------------------------------------- | ---------------------------------------------- |
| `pnpm install --frozen-lockfile`                                | Instala dependências                           |
| `pnpm exec prisma generate`                                     | Gera o client em `app/generated/prisma/`       |
| `pnpm dev`                                                       | Dev server (http://localhost:3000)             |
| `pnpm build`                                                     | `prisma generate && next build` (checa tipos)  |
| `pnpm lint`                                                      | ESLint                                          |
| `npx prettier --write "app/**/*.{ts,tsx}" "lib/**/*.{ts,tsx}"`  | Formata TS (**não há script `format`**)        |
| `pnpm test`                                                      | Jest (unit/componentes, jsdom)                 |
| `pnpm test --coverage`                                          | Cobertura (TS)                                 |
| `pnpm test:e2e:setup`                                           | `prisma generate` + instala Chromium (1ª vez)  |
| `pnpm test:e2e`                                                 | `prisma generate && playwright test`           |
| `pnpm exec prisma migrate dev`                                  | Cria/aplica migration em desenvolvimento       |

**Antes de qualquer `git push`** (espelha o quality gate do CI) — rode e passe:

1. `npx prettier --write ...` (TS) + `ruff format scraper/ && ruff check --fix scraper/` (Python) → `git diff` limpo
2. `pnpm lint`
3. `pnpm test` (Jest) + `pytest scraper/tests/` (Python)
4. `pnpm test:e2e`

Não fazer push com qualquer etapa falhando; ao descrever validação no PR, declare que as quatro rodaram.

### Infra (gh / Vercel / Supabase)

```bash
gh auth status · gh issue view <n> · gh pr create --draft · gh run list
vercel link · vercel env pull .env.local
supabase link --project-ref <ref> · supabase db pull · supabase db push
```

---

## Arquitetura

```
onde-tem-buteco/
├── apps/web/                       # Aplicação Next.js (pnpm)
│   ├── app/
│   │   ├── (public)/               # Home (mapa), /butecos, /butecos/[slug]
│   │   ├── (auth)/                 # /login, /cadastro
│   │   ├── (private)/              # /minha-conta (favoritos + histórico)
│   │   ├── api/                    # auth/[...nextauth], mutações
│   │   └── generated/prisma/       # Prisma Client GERADO — não versionar, não editar
│   ├── components/                 # ui/, mapa/ (Leaflet), butecos/
│   ├── lib/                        # auth.ts, prisma.ts (singleton+adapter),
│   │   │                           # buteco-actions.ts, detail-actions.ts (Server Actions),
│   │   │                           # *-filters/-formatters, geolocalizacao, __tests__/
│   │   └── ...
│   ├── prisma/                     # schema.prisma + migrations/ (fonte da verdade do schema)
│   └── prisma.config.ts            # Prisma 7: datasource.url aqui (NÃO no schema.prisma)
└── scraper/                        # Script Python isolado (main.py, tests/, ruff.toml)
```

Modelos do banco: `Buteco`, `User`, `Favorito`, `Visita` — ver `apps/web/prisma/schema.prisma`
(não duplicar o schema aqui; ele é a fonte da verdade).

---

## Ambiente

Copie `.env.example` → `.env.local` (gitignored, **nunca** commitar). Chaves e onde
obter cada valor estão documentadas no `.env.example`.

- **Web:** o Prisma lê `POSTGRES_URL_NON_POOLING` (config) com fallback para
  `POSTGRES_URL` → `POSTGRES_PRISMA_URL` → `DATABASE_URL` (ver `lib/prisma.ts`).
  Mais `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`.
- **Scraper:** usa apenas `DATABASE_URL`, injetada via GitHub Actions Secret.

---

## Scraper

- **Fonte:** `https://comidadibuteco.com.br/butecos/` · **Cron:** seg. 06h (GitHub Actions)
- **Bypass Cloudflare:** o scraper usa **FlareSolverr** (sessão via `fs_create_session`),
  não só requests/BeautifulSoup — o serviço precisa estar no ar. `test_bypass.py` /
  workflow `test-bypass.yml` cobrem esse caminho.
- **Estratégia:** upsert por `slug` — **nunca deletar** registros existentes.
- **Rate limit:** `time.sleep(0.5)` entre requisições — respeitar o servidor de origem.
- **Geocodificação:** Nominatim (OpenStreetMap), sem chave de API.
- **Lint/format:** ruff · **Testes:** pytest (`requirements-dev.txt`, `.coveragerc`).

```bash
cd scraper && pip install -r requirements.txt
DATABASE_URL=<url> python main.py                                  # scrape + upsert
DATABASE_URL=<url> python main.py --skip-scrape --backfill-missing-geocodes  # só lat/lng nulos
```

---

## Estilo de código

- TypeScript strict, **sem `any`** · tipos explícitos, nada de funções sem tipagem.
- Funções: 4–20 linhas. Arquivos: < 500 linhas. Uma responsabilidade por módulo (SRP).
- Nomes específicos e únicos (evite `data`, `handler`, `Manager`); prefira nomes com
  < 5 ocorrências no `grep`.
- Sem duplicação — extraia lógica compartilhada. Retornos antecipados em vez de `if`s
  aninhados (máx. 2 níveis de indentação).
- `camelCase` (funções/vars), `PascalCase` (componentes), `kebab-case.tsx` (arquivos).
- Mensagens de exceção incluem o valor problemático e o formato esperado.

### Next.js / Prisma / Tailwind

- Server Components por padrão; `"use client"` só com interatividade/hooks.
- Leituras: buscar no servidor via Prisma direto em Server Components — **não** criar
  Server Action para leitura. Mutações (favoritar/visitar): Server Actions (`lib/*-actions.ts`)
  ou Route Handler. Nunca expor o Prisma Client no browser.
- Sempre o singleton `lib/prisma.ts`; **nunca** `prisma.$queryRaw`/SQL direto.
- Tailwind apenas (sem CSS customizado); reusáveis em `components/ui/`.

---

## Comentários

- Escreva o **PORQUÊ**, não o O QUÊ. Sem comentários óbvios — código autodescritivo.
- Mantenha seus próprios comentários em refactors — carregam intenção e origem.
- Docstrings em funções públicas: intenção + um exemplo. Referencie issue/SHA quando
  uma linha existir por causa de um bug específico ou restrição upstream.

---

## Testes

- **Web (unit/componentes):** Jest 30 + Testing Library (jsdom), co-localizados em
  `lib/__tests__/` e `app/**`; mockam I/O (Prisma) — `lib/prisma.ts` fica fora da cobertura.
- **Web (E2E):** Playwright + `@axe-core/playwright` (acessibilidade); fixtures estáveis
  para os fluxos públicos — **não** dependem do banco real (local ou CI).
- **Scraper:** pytest com cobertura (`scraper/tests/`).
- Toda função nova ganha teste; toda correção de bug ganha teste de regressão.
- F.I.R.S.T (rápidos, independentes, repetíveis, auto-validáveis, oportunos).
- Mock de I/O externo (Prisma, `fetch`, filesystem) com **classes fake nomeadas**, não
  stubs inline.

---

## Dependências

- Encapsule libs de terceiros atrás de uma interface fina deste projeto — `lib/prisma.ts`
  já faz isso (singleton + driver adapter), não espalhe o SDK do Prisma.
- Injete dependências via parâmetro quando o consumidor precisar ser testável.

---

## Gotchas que mordem em CI / dev

> Cada vez que algo "passou local e quebrou no CI" ou custou > 15 min, registre aqui
> em uma linha: sintoma → causa → fix.

- **`pnpm` only (11.5.1), nunca `npm`** — o lockfile é `apps/web/pnpm-lock.yaml`;
  settings do pnpm ficam em `apps/web/pnpm-workspace.yaml`. O README ainda tem passos
  com `npm install`/`npx` (legado/inconsistente) — ignore, use pnpm.
- **Prisma 7 — `url` NÃO vai no `schema.prisma`** — vai em `apps/web/prisma.config.ts`
  (`datasource.url = POSTGRES_URL_NON_POOLING`), que carrega `.env.local` via `dotenv`.
  O runtime usa driver adapter (`@prisma/adapter-pg` + `pg.Pool`) em `lib/prisma.ts`.
- **Prisma Client gerado em `app/generated/prisma/`** (output custom, **não versionado**) —
  `prisma generate` é obrigatório antes de `build`/`dev`/`test:e2e`; os scripts `build` e
  `test:e2e` já chamam. Importar de `@/app/generated/prisma/client`, **não** de `@prisma/client`.
- **Não há script `format`** (só `format:check`) — o CI formata com
  `npx prettier --write "app/**/*.{ts,tsx}" "lib/**/*.{ts,tsx}"` e falha no `git diff --exit-code`
  se ficar sujo. Mesma regra Python: `ruff format` + `ruff check --fix` + git limpo.
- **Não há script `type-check`** — a checagem de tipos vem do `pnpm build` (`next build`).
  Para checar isolado: `npx tsc --noEmit`.
- **CI usa Node 22 e `pnpm install --ignore-scripts`** — os testes Jest mockam o Prisma,
  por isso `pnpm test` roda sem `prisma generate`. O README diz "Node 20+"; o CI fixa **22**.
- **Quality gate (SonarCloud)** depende de cobertura TS + Python + E2E (workflow `quality.yml`):
  uma das etapas falhando derruba o gate.
- **Scraper precisa do FlareSolverr no ar** (bypass Cloudflare) — sem ele, o scrape falha
  antes do BeautifulSoup.

---

## Fluxo de desenvolvimento (GitHub)

### Issues

- Toda issue recebe `labels`, `milestone` e `project`, e representa uma unidade rastreável
  antes do PR.
- No project `Onde Tem Buteco`, manter **apenas issues** como itens visíveis (PRs não viram
  itens próprios — a ligação aparece em `Linked pull requests`).
- Issues criadas por agentes de IA são atribuídas a `@gianimpronta` (inclusive ao desmembrar
  em sub-issues).

### Commits — Conventional Commits

```
feat: adiciona mapa interativo com Leaflet
fix: corrige filtro por bairro no Rio
chore: atualiza dependências   ·   docs: atualiza CLAUDE.md
```

- **Não** adicionar `Co-Authored-By` nos commits.

### Pull Requests

- Pequenos e focados — uma funcionalidade por PR; descrever o que foi feito e como testar.
- Vincular à issue: `Closes #n`/`Fixes #n` no PR que encerra; `Refs #n` em PRs complementares.
- Preencher `labels`, `milestone` e `project`. Vercel cria preview deploy por PR.

---

## Repositório público — cuidados

Este repo é **público**. Qualquer pessoa lê o código.

- Nunca commitar `.env.local`/`.env` ou qualquer credencial — nem "temporariamente".
- Manter `.env.example` atualizado (todas as chaves, valores vazios).
- Scraper é visível: manter `time.sleep` e não fazer scraping agressivo.
- Secrets de produção ficam **apenas** na Vercel e nos GitHub Actions Secrets.
- Projeto fan-made, sem fins comerciais — os dados pertencem ao Comida di Buteco.

---

## O que NÃO fazer

- Editar dados de butecos manualmente no banco (a fonte é o scraper).
- Usar `npm`/`yarn` no app (é pnpm) ou `prisma.$queryRaw`/SQL direto.
- Criar CSS customizado fora do Tailwind, ou usar `any` no TypeScript.
- Criar Server Action para **leitura** (use Server Component direto).
- Commitar `.env.local`/secrets, ou versionar `app/generated/prisma/`.
- Fazer scraping sem `time.sleep` — respeitar o servidor de origem.
