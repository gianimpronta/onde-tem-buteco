# AGENTS.md — onde-tem-buteco

Guia de desenvolvimento para agentes de IA e colaboradores do projeto.
Leia este arquivo inteiro antes de escrever qualquer código.

---

## Visão geral do projeto

**Onde Tem Buteco** é um web app que complementa o site oficial do concurso
Comida di Buteco (comidadibuteco.com.br), preenchendo lacunas de UX como:
mapa interativo, filtro por bairro, montagem de roteiro e conta de usuário
com favoritos e histórico de visitas.

Os dados são obtidos exclusivamente via scraping do site oficial e nunca
devem ser alterados manualmente no banco.

---

## Repositório

- **Nome:** `onde-tem-buteco`
- **Organização:** `gianimpronta`
- **URL:** `https://github.com/gianimpronta/onde-tem-buteco`

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilização | Tailwind CSS |
| ORM | Prisma |
| Banco de dados | Vercel Postgres (Neon) |
| Autenticação | NextAuth.js v5 (Google OAuth) |
| Mapa | Leaflet.js |
| Scraper | Python 3.12 + BeautifulSoup + psycopg2 |
| CI/CD | GitHub Actions |
| Hospedagem | Vercel |

---

## Estrutura do repositório

```
onde-tem-buteco/
├── apps/
│   └── web/                          # Aplicação Next.js
│       ├── app/
│       │   ├── (public)/
│       │   │   ├── page.tsx                    # Home com mapa
│       │   │   ├── butecos/
│       │   │   │   ├── page.tsx                # Listagem com filtros
│       │   │   │   └── [slug]/page.tsx         # Detalhe do buteco
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── cadastro/page.tsx
│       │   ├── (private)/
│       │   │   └── minha-conta/page.tsx        # Favoritos + histórico
│       │   └── api/
│       │       ├── auth/[...nextauth]/route.ts
│       │       └── butecos/route.ts
│       ├── components/
│       │   ├── ui/                             # Componentes base
│       │   ├── mapa/                           # Componentes Leaflet
│       │   └── butecos/                        # Cards, filtros, listagem
│       ├── lib/
│       │   ├── prisma.ts                       # Singleton do Prisma client
│       │   └── auth.ts                         # Configuração NextAuth
│       └── prisma/
│           └── schema.prisma
└── scraper/                          # Script Python isolado
    ├── main.py
    ├── requirements.txt
    └── .github/
        └── workflows/
            └── scraper.yml
```

---

## Schema do banco de dados

```prisma
model Buteco {
  id          String   @id @default(cuid())
  slug        String   @unique
  nome        String
  cidade      String
  bairro      String?
  endereco    String
  telefone    String?
  horario     String?
  petiscoNome String?
  petiscoDesc String?
  fotoUrl     String?
  lat         Float?
  lng         Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  favoritos   Favorito[]
  visitas     Visita[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())

  favoritos Favorito[]
  visitas   Visita[]
}

model Favorito {
  id        String   @id @default(cuid())
  userId    String
  butecoId  String
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  buteco    Buteco   @relation(fields: [butecoId], references: [id])

  @@unique([userId, butecoId])
}

model Visita {
  id          String   @id @default(cuid())
  userId      String
  butecoId    String
  visitadoEm DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
  buteco    Buteco   @relation(fields: [butecoId], references: [id])

  @@unique([userId, butecoId])
}
```

---

## Variáveis de ambiente

```bash
# .env.local (nunca commitar)
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

O scraper usa apenas `DATABASE_URL`, injetada via GitHub Actions Secret.

---

## Scraper

- **Fonte:** `https://comidadibuteco.com.br/butecos/`
- **Frequência:** Toda segunda-feira às 06h (GitHub Actions cron)
- **Estratégia:** Upsert por `slug` — nunca deletar registros existentes
- **Rate limit:** `time.sleep(0.5)` entre requisições para respeitar o servidor
- **Geocodificação:** Nominatim (OpenStreetMap) — gratuito, sem chave de API

### Rodar manualmente

```bash
cd scraper
pip install -r requirements.txt
DATABASE_URL=<url> python main.py
```

---

## Convenções de código

### Geral
- TypeScript strict mode sempre ativado — sem `any`
- Funções e variáveis em `camelCase`
- Componentes React em `PascalCase`
- Arquivos de componente em `kebab-case.tsx`
- Sem comentários óbvios — o código deve ser autodescritivo

### Next.js
- Preferir Server Components por padrão
- Client Components (`"use client"`) apenas quando necessário (interatividade, hooks)
- Dados sempre buscados no servidor via Prisma — nunca expor o client do Prisma no browser
- Rotas de API apenas para mutações (POST/DELETE de favoritos e visitas)

### Prisma
- Sempre usar o singleton de `lib/prisma.ts`
- Nunca usar `prisma.$queryRaw` — usar a API do Prisma
- Migrations via `prisma migrate dev` em desenvolvimento

### Tailwind
- Sem CSS customizado — usar apenas classes utilitárias do Tailwind
- Componentes reutilizáveis extraídos para `components/ui/`

---

## Fluxo de desenvolvimento

### Antes de começar qualquer tarefa
1. Ler este arquivo
2. Verificar se existe issue ou task relacionada
3. Criar branch a partir de `main` com nome descritivo: `feat/mapa-leaflet`, `fix/filtro-bairro`

### Commits
Seguir Conventional Commits:
```
feat: adiciona mapa interativo com Leaflet
fix: corrige filtro por bairro no Rio
chore: atualiza dependências
docs: atualiza AGENTS.md com instruções do scraper
```

### Pull Requests
- PRs pequenos e focados — uma funcionalidade por PR
- Descrever o que foi feito e como testar
- Vercel cria preview deploy automático por PR

### Antes de push
- Sempre rodar `format`, `lint`, `test` e `e2e` antes de qualquer `git push`
- Não fazer push com qualquer uma dessas etapas falhando
- Ao descrever validação em PRs, incluir de forma objetiva que essas quatro etapas foram executadas

### Issues
- Issues criadas por agentes de IA devem ser atribuídas a `@gianimpronta` no momento da criação
- Ao desmembrar uma issue em sub-issues, manter a atribuição em `@gianimpronta` por padrão
- Não é necessário workflow de auto-assign enquanto esse fluxo continuar estável
- Se o projeto passar a ter múltiplos responsáveis abrindo issues com frequência, reavaliar essa convenção

---

## Fases do MVP

### Fase 1 — Dados ✅ (base)
- [ ] Setup Next.js 16 + TypeScript + Tailwind + Prisma
- [ ] Configurar Vercel Postgres
- [ ] Rodar scraper manualmente para popular o banco
- [ ] Migrations iniciais

### Fase 2 — Leitura
- [ ] Listagem de butecos com filtro por cidade e bairro
- [ ] Busca por nome
- [ ] Página de detalhe do buteco
- [ ] Mapa interativo com Leaflet

### Fase 3 — Usuário
- [ ] Google OAuth via NextAuth
- [ ] Favoritar buteco
- [ ] Marcar como visitado
- [ ] Página "Minha Conta" com favoritos e histórico

### Fase 4 — Produção
- [ ] SEO básico (metadata, Open Graph, sitemap.xml)
- [ ] Deploy na Vercel
- [ ] Configurar GitHub Actions cron do scraper
- [ ] Monitoramento de erros (Sentry ou Vercel Analytics)

---

## Repositório público — cuidados

Este repositório é **público**. Qualquer pessoa pode ler o código.

- Nunca commitar `.env.local`, `.env` ou qualquer arquivo com credenciais reais
- Manter `.env.example` sempre atualizado com todas as chaves necessárias (valores vazios)
- O scraper é visível publicamente — manter `time.sleep` e não fazer scraping agressivo
- Este projeto é **fan-made**, sem fins comerciais. Os dados pertencem ao Comida di Buteco
- Não incluir tokens, senhas ou URLs de banco de dados em issues, PRs ou comentários de código
- Secrets de produção ficam **apenas** nas configurações da Vercel e nos GitHub Actions Secrets

---

## Arquivos obrigatórios no repositório

| Arquivo | Propósito |
|---|---|
| `.gitignore` | Ignorar `.env.local`, `.env`, `node_modules/`, `.next/`, `__pycache__/` |
| `.env.example` | Documentar todas as variáveis necessárias com valores vazios |
| `README.md` | Descrição, como rodar localmente, stack e créditos |
| `LICENSE` | MIT — uso livre com atribuição |
| `AGENTS.md` | Este arquivo — guia para agentes de IA e colaboradores |

---

## O que NÃO fazer

- Não editar dados de butecos manualmente no banco — a fonte da verdade é o scraper
- Não usar `prisma.$queryRaw` ou SQL direto
- Não criar CSS customizado fora do Tailwind
- Não commitar `.env.local` ou qualquer secret
- Não fazer scraping sem `time.sleep` — respeitar o servidor de origem
- Não usar `any` no TypeScript
- Não criar Server Actions para leituras — usar Server Components diretamente
- Não incluir credenciais reais em nenhum arquivo versionado, mesmo que "temporariamente"
