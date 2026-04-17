# SonarQube Issues Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os 4 issues abertos reportados pelo SonarCloud no projeto `gianimpronta_onde-tem-buteco`.

**Architecture:** Dois grupos independentes de mudanças — (1) refatoração do scraper Python para reduzir complexidade cognitiva, (2) três correções de type-safety no app Next.js. Ambos podem ser executados em paralelo por subagentes separados.

**Tech Stack:** Python 3.12 (scraper), TypeScript + Next.js 16 + NextAuth v5 (web)

---

## Contexto dos issues

| # | Arquivo | Linha | Regra | Severidade | Descrição |
|---|---|---|---|---|---|
| 1 | `scraper/main.py` | 78 | `python:S3776` | 🟠 Critical | `scrape_buteco` tem complexidade cognitiva 29 (máx 15) |
| 2 | `apps/web/app/(public)/butecos/[slug]/page.tsx` | 6 | `typescript:S6759` | 🔵 Minor | Props do componente não marcadas como `Readonly` |
| 3 | `apps/web/app/(public)/butecos/page.tsx` | 3 | `typescript:S6759` | 🔵 Minor | Props do componente não marcadas como `Readonly` |
| 4 | `apps/web/lib/auth.ts` | 29 | `typescript:S4325` | 🔵 Minor | Type assertion desnecessária na extensão de `session.user` |

---

## Task 1: Reduzir complexidade cognitiva de `scrape_buteco` (S3776)

**Parallelizable:** sim — independente do Task 2.

**Files:**
- Modify: `scraper/main.py` — extrair duas funções auxiliares de `scrape_buteco`

### Análise do problema

A função `scrape_buteco` tem complexidade 29 por acumular:
- Loop `for i, p in enumerate(paragraphs)` com `if not bold`, múltiplos `elif`, e lógica de petisco aninhada
- Bloco `if endereco:` com split/regex/indexing

A solução é extrair duas funções auxiliares:
- `_parse_section_fields(section)` → `dict` com `endereco`, `telefone`, `horario`, `petisco_nome`, `petisco_desc`
- `_parse_location(endereco)` → `tuple[str | None, str | None]` com `(cidade, bairro)`

---

- [ ] **Step 1: Ler o arquivo atual**

Confirmar que `scraper/main.py` está no estado esperado (função `scrape_buteco` começa na linha 78).

- [ ] **Step 2: Extrair `_parse_section_fields` e `_parse_location`**

Substituir o conteúdo de `scraper/main.py` adicionando as duas funções antes de `scrape_buteco` e simplificando o corpo da função principal.

O novo conteúdo de `scraper/main.py` a partir da linha 78:

```python
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
        value = p.get_text(strip=True)[len(bold_text):].strip().lstrip(":").strip()

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
    parts = [p.strip() for p in endereco.split(",")]
    last = parts[-1].strip()
    if re.match(r"^[A-Z]{2}$", last):
        parts = parts[:-1]
    cidade = parts[-1].strip() if parts else None
    bairro = parts[-2].strip() if len(parts) >= 2 else None
    return cidade, bairro


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
    fields = _parse_section_fields(section) if section else {
        "endereco": None, "telefone": None, "horario": None,
        "petisco_nome": None, "petisco_desc": None,
    }

    endereco = fields["endereco"]
    cidade, bairro = _parse_location(endereco) if endereco else (None, None)

    return {
        "slug": slug,
        "nome": nome,
        "cidade": cidade or "",
        "bairro": bairro,
        "endereco": endereco or "",
        "telefone": fields["telefone"],
        "horario": fields["horario"],
        "petisco_nome": fields["petisco_nome"],
        "petisco_desc": fields["petisco_desc"],
        "foto_url": foto_url,
    }
```

- [ ] **Step 3: Verificar que ruff passa localmente**

```bash
cd scraper
pip install ruff --quiet
ruff check main.py
ruff format --check main.py
```

Expected: nenhum erro.

- [ ] **Step 4: Commit**

```bash
git add scraper/main.py
git commit -m "refactor: extrai _parse_section_fields e _parse_location (S3776)"
```

---

## Task 2: Corrigir issues TypeScript (S6759 × 2 + S4325)

**Parallelizable:** sim — independente do Task 1.

**Files:**
- Modify: `apps/web/app/(public)/butecos/[slug]/page.tsx:6`
- Modify: `apps/web/app/(public)/butecos/page.tsx:3`
- Create: `apps/web/types/next-auth.d.ts`
- Modify: `apps/web/lib/auth.ts:29`

---

### Sub-task 2a: Marcar props como `Readonly` (S6759)

- [ ] **Step 1: Corrigir `[slug]/page.tsx`**

Em `apps/web/app/(public)/butecos/[slug]/page.tsx`, linha 6, alterar:

```typescript
// antes
export default async function ButecoPage({ params }: { params: Promise<{ slug: string }> }) {

// depois
export default async function ButecoPage({ params }: Readonly<{ params: Promise<{ slug: string }> }>) {
```

- [ ] **Step 2: Corrigir `butecos/page.tsx`**

Em `apps/web/app/(public)/butecos/page.tsx`, linhas 3–7, alterar:

```typescript
// antes
export default async function ButecosPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }>;
}) {

// depois
export default async function ButecosPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }> }>) {
```

---

### Sub-task 2b: Remover type assertion desnecessária em `auth.ts` (S4325)

O problema: `(session.user as typeof session.user & { id: string }).id = dbUser.id` faz um cast inline que SonarQube aponta como desnecessário. A solução correta para NextAuth v5 é fazer module augmentation do tipo `Session`.

- [ ] **Step 3: Criar `apps/web/types/next-auth.d.ts`**

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Atualizar `apps/web/lib/auth.ts`**

Linha 29: substituir o cast inline por atribuição direta:

```typescript
// antes
(session.user as typeof session.user & { id: string }).id = dbUser.id;

// depois
session.user.id = dbUser.id;
```

O arquivo completo após a mudança:

```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      await prisma.user.upsert({
        where: { email: user.email },
        update: { name: user.name, image: user.image },
        create: { email: user.email, name: user.name, image: user.image },
      });
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
});
```

- [ ] **Step 5: Verificar type check**

```bash
cd apps/web
npx tsc --noEmit
```

Expected: sem erros de tipo.

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/\(public\)/butecos/\[slug\]/page.tsx
git add apps/web/app/\(public\)/butecos/page.tsx
git add apps/web/types/next-auth.d.ts
git add apps/web/lib/auth.ts
git commit -m "fix: marca props como Readonly e remove type assertion desnecessária (S6759, S4325)"
```

---

## Verificação final

Após ambas as tasks (em qualquer ordem):

- [ ] Push para main: `git push origin main`
- [ ] Aguardar execução das pipelines CI no GitHub Actions
- [ ] Confirmar que quality e security workflows passam
- [ ] Verificar no SonarCloud que os 4 issues aparecem como FIXED
