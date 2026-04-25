# Design System Implementation — Onde Tem Buteco

**Issue:** #88  
**Data:** 2026-04-24  
**Fonte do design:** Claude Design bundle (handoff exportado em 2026-04-24)

---

## Contexto

O projeto recebeu um handoff completo de design produzido no Claude Design: paleta warm earthy, três famílias tipográficas, sprite de ícones customizados, logo SVG e especificação de componentes e telas. Esta spec define como implementar esse design system no codebase Next.js existente em 6 sub-issues incrementais.

---

## Arquitetura geral

### Dependências entre sub-issues

```
#88-1 foundation
   └── #88-2 componentes    (depende: tokens, fontes, assets)
         └── #88-3 header   (depende: componentes base)
               ├── #88-4 home + listagem   (depende: header, componentes)
               ├── #88-5 detalhe           (depende: header, componentes)
               └── #88-6 login + conta     (depende: header, componentes)
```

### Convenção de branches e PRs

| Sub-issue | Branch | PR fecha |
|---|---|---|
| #88-1 | `feat/ds-1-foundation` | sub-issue #88-1, Refs #88 |
| #88-2 | `feat/ds-2-componentes` | sub-issue #88-2, Refs #88 |
| #88-3 | `feat/ds-3-header-nav` | sub-issue #88-3, Refs #88 |
| #88-4 | `feat/ds-4-home-listagem` | sub-issue #88-4, Refs #88 |
| #88-5 | `feat/ds-5-detalhe-buteco` | sub-issue #88-5, Refs #88 |
| #88-6 | `feat/ds-6-conta` | sub-issue #88-6, Refs #88 |

A issue #88 (parent) é fechada manualmente após merge de todos os PRs filhos.

### Estratégia de tokens (Tailwind v4)

Os tokens do design ficam como CSS custom properties em `:root` no `globals.css`. O bloco `@theme inline` os mapeia para o sistema de utilidades do Tailwind:

```css
:root {
  --tinto-700: #6E1E18;
  /* ... */
}

@theme inline {
  --color-tinto-700: var(--tinto-700);
  /* → gera bg-tinto-700, text-tinto-700, border-tinto-700 */
}
```

Isso mantém os tokens num único lugar e produz classes idiomáticas no JSX (`text-tinto-700`) em vez de valores arbitrários (`text-[#6E1E18]`).

### Dark mode

Mantém o sistema existente (classe `.dark` no `<html>`, toggle via `localStorage`). As vars semânticas (`--bg`, `--surface`, `--ink`, etc.) são sobrescritas dentro de `.dark {}`, correspondendo ao dark mode especificado no design.

---

## Sub-issue 1 — Foundation

**Branch:** `feat/ds-1-foundation`

### Arquivos alterados

#### `apps/web/app/globals.css`

Remove: tokens `--background`/`--foreground` e mapeamento zinc/slate.

Adiciona:

```css
:root {
  /* Cream / bone surfaces */
  --cream-50: #FBF6EC;
  --cream-100: #F4ECDB;
  --cream-200: #E9DCC0;
  --cream-300: #D9C69E;

  /* Terracota — CTA primário */
  --terracota-100: #F7DDCE;
  --terracota-300: #E6A279;
  --terracota-500: #C9683C;
  --terracota-600: #B05628;
  --terracota-700: #8C421E;

  /* Mostarda — acento secundário */
  --mostarda-100: #F7E4B2;
  --mostarda-300: #E6C169;
  --mostarda-500: #CE9A24;
  --mostarda-600: #A97C17;
  --mostarda-700: #7E5C10;

  /* Tinto — headlines, brand */
  --tinto-300: #C65B52;
  --tinto-500: #9E3027;
  --tinto-700: #6E1E18;
  --tinto-900: #4A140F;

  /* Breu — near-black text */
  --breu-700: #3E2F22;
  --breu-800: #2A1E14;
  --breu-900: #1A120B;

  /* Mata — sucesso, "aberto" */
  --mata-500: #456B3E;
  --mata-700: #2E4A2A;

  /* Semânticos */
  --bg:          var(--cream-50);
  --surface:     var(--cream-100);
  --surface-alt: #FFFBF2;
  --ink:         var(--breu-900);
  --ink-soft:    var(--breu-700);
  --ink-muted:   #7A6A58;
  --line:        #D9C69E;
  --line-soft:   #E9DCC0;
  --brand:       var(--tinto-700);
  --primary:     var(--terracota-500);
  --primary-ink: #FFFBF2;
  --accent:      var(--mostarda-500);
  --positive:    var(--mata-500);
  --danger:      var(--tinto-500);

  /* Shadows */
  --shadow-warm-sm: 0 1px 2px rgba(74,20,15,.06), 0 1px 1px rgba(74,20,15,.04);
  --shadow-warm:    0 2px 4px rgba(74,20,15,.06), 0 8px 20px -8px rgba(74,20,15,.14);
  --shadow-warm-lg: 0 4px 8px rgba(74,20,15,.08), 0 24px 48px -16px rgba(74,20,15,.2);
}

.dark {
  --bg:          #1B1510;
  --surface:     #251C14;
  --surface-alt: #2E231A;
  --ink:         #F4ECDB;
  --ink-soft:    #D9C69E;
  --ink-muted:   #9E8B73;
  --line:        #3A2D20;
  --line-soft:   #2E231A;
  --brand:       #E8A27A;
  --primary:     #E0835A;
  --primary-ink: #1B1510;
  --accent:      #E6C169;
}

@theme inline {
  /* Superfícies */
  --color-bg:          var(--bg);
  --color-surface:     var(--surface);
  --color-surface-alt: var(--surface-alt);

  /* Texto */
  --color-ink:       var(--ink);
  --color-ink-soft:  var(--ink-soft);
  --color-ink-muted: var(--ink-muted);

  /* Bordas */
  --color-line:      var(--line);
  --color-line-soft: var(--line-soft);

  /* Brand */
  --color-brand:       var(--brand);
  --color-primary:     var(--primary);
  --color-primary-ink: var(--primary-ink);
  --color-accent:      var(--accent);
  --color-positive:    var(--positive);
  --color-danger:      var(--danger);

  /* Escala completa */
  --color-cream-50:      #FBF6EC;
  --color-cream-100:     #F4ECDB;
  --color-cream-200:     #E9DCC0;
  --color-cream-300:     #D9C69E;
  --color-terracota-100: #F7DDCE;
  --color-terracota-300: #E6A279;
  --color-terracota-500: #C9683C;
  --color-terracota-600: #B05628;
  --color-terracota-700: #8C421E;
  --color-mostarda-100:  #F7E4B2;
  --color-mostarda-300:  #E6C169;
  --color-mostarda-500:  #CE9A24;
  --color-mostarda-600:  #A97C17;
  --color-mostarda-700:  #7E5C10;
  --color-tinto-300:     #C65B52;
  --color-tinto-500:     #9E3027;
  --color-tinto-700:     #6E1E18;
  --color-tinto-900:     #4A140F;
  --color-breu-700:      #3E2F22;
  --color-breu-800:      #2A1E14;
  --color-breu-900:      #1A120B;
  --color-mata-500:      #456B3E;
  --color-mata-700:      #2E4A2A;

  /* Fontes */
  --font-display: var(--font-familjen-grotesk), ui-sans-serif, system-ui, sans-serif;
  --font-body:    var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif;
  --font-mono:    var(--font-dm-mono), ui-monospace, "SFMono-Regular", Menlo, monospace;
}

/* Textura kraft — uso em hero e card flat */
.grao {
  background-image:
    radial-gradient(rgba(74,20,15,.08) 1px, transparent 1px),
    radial-gradient(rgba(74,20,15,.05) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
}
```

#### `apps/web/app/layout.tsx`

Remove: `Geist`, `Geist_Mono`.  
Adiciona: `Familjen_Grotesk`, `Inter_Tight`, `DM_Mono` via `next/font/google`.

```ts
import { Familjen_Grotesk, Inter_Tight, DM_Mono } from "next/font/google";

const familjenGrotesk = Familjen_Grotesk({
  variable: "--font-familjen-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
```

As três vars são adicionadas ao `className` do `<html>`. O `body` usa `font-body` como padrão.

#### `apps/web/public/` (já copiados)

- `icons.svg` — sprite de ícones (pin, rota, carimbo, glass, search, filter, user, home, map, heart, plus, arrow-right, clock, gole-filled, gole-empty)
- `logo-mark.svg` — mark circular OTB
- `logo-wordmark.svg` — logotipo completo
- `texture-grao.svg` — textura para uso como `<img>` em contextos sem CSS background

---

## Sub-issue 2 — Componentes UI

**Branch:** `feat/ds-2-componentes`

### Novos arquivos

#### `components/ui/chip.tsx`

```tsx
type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};
```

Pill com `border border-line`, `bg-surface-alt`, `font-body text-[13px] font-medium`. Variante `active`: `bg-tinto-700 text-primary-ink border-tinto-700`. Dot colorido à esquerda.

#### `components/ui/button.tsx`

```tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  // + props padrão de button
};
```

- **primary:** `bg-primary text-primary-ink`, hover `bg-terracota-600`
- **secondary:** `border border-tinto-700 text-tinto-700`, transparent bg
- **ghost:** `text-ink-soft`, sem borda

#### `components/ui/carimbo.tsx`

```tsx
type CarimboProps = {
  nome: string;
  bairro?: string;
  numero?: string;
  size?: "lg" | "sm" | "xs";  // 96px | 56px | 32px
  color?: "tinto" | "mostarda" | "mata";
};
```

Badge circular com `border-2 border-tinto-700`, `::after` inner dashed ring, rotação leve (`-6deg` no lg). Fonte DM Mono. Sizes xs e sm omitem bairro/número.

### Arquivo atualizado

#### `components/butecos/buteco-card.tsx` *(novo — substitui inline JSX nas páginas)*

```tsx
type ButecoCardProps = {
  buteco: { nome, bairro, cidade, petiscoNome, fotoUrl, slug };
  variant?: "photo" | "flat";
};
```

- **photo:** `bg-white border border-line-soft rounded-[14px]`, hero image `aspect-[4/2.6]`, chips "aberto"/"fav" sobrepostos, petiscoNome em `text-tinto-700 font-display`, footer com preço em DM Mono
- **flat:** `bg-mostarda-100 border border-mostarda-300 rounded-[14px]`, classe `.grao` sobreposta, nome em `text-tinto-700 font-display text-[30px]`, lista de petiscos, eyebrow em DM Mono

#### `components/butecos/filter-form.tsx` *(atualização)*

Inputs e selects ganham `rounded-full border border-line px-4 py-2.5 font-body text-[14px]`. Botão "Aplicar" usa `<Button variant="primary" size="sm">`. Botão "Limpar" usa `<Button variant="secondary" size="sm">`.

---

## Sub-issue 3 — Header + Bottom Nav

**Branch:** `feat/ds-3-header-nav`

### `components/ui/header.tsx`

- Logo: `<img src="/logo-wordmark.svg" height="32" alt="Onde tem buteco">` em vez de texto
- Superfície: `bg-surface border-b border-line-soft` (sem arredondamento — full-width)
- Links: `font-body text-[14px] font-medium text-ink-soft`, hover `text-primary`
- Botão Login: `<Button variant="primary" size="sm">`
- Botão Sair: `<Button variant="ghost" size="sm">`

### `components/ui/bottom-nav.tsx` *(novo)*

Nav fixo na base da tela, apenas mobile (`md:hidden`). 5 tabs com ícones do sprite `icons.svg`:

| Tab | Ícone | Rota |
|---|---|---|
| Início | `#home` | `/` |
| Mapa | `#map` | `/` (mesmo que Início — ganhará rota própria quando a página de mapa existir) |
| Rotas | `#rota` | `/rotas` (futuro — link desabilitado por ora) |
| Carimbos | `#carimbo` | `/minha-conta` |
| Perfil | `#user` | `/minha-conta` |

Fundo `bg-white border-t border-line-soft`, active state `text-tinto-700 bg-mostarda-100`, labels em DM Mono uppercase 9px.

### `apps/web/app/(public)/layout.tsx`

Adiciona `<BottomNav>` após `{children}`, antes do `</main>` wrapper. Padding-bottom `pb-20 md:pb-0` no conteúdo principal para não sobrepor o nav.

---

## Sub-issue 4 — Home + Listagem

**Branch:** `feat/ds-4-home-listagem`

### Home (`app/(public)/page.tsx`)

**Hero section:** fundo `bg-surface` + classe `.grao` em overlay 8% opacidade. Heading `font-display font-bold text-[42px] text-tinto-700 tracking-tight`. Badge de contagem em `bg-mostarda-100 text-mostarda-700 font-mono text-[12px]`. Botão "Ver botecos" `<Button variant="primary">`. Mapa mantido sem alteração de lógica.

### Listagem (`app/(public)/butecos/page.tsx`)

- Chips de filtro por cidade/bairro substituem o `<FilterForm>` no header (FilterForm continua para busca textual)
- Grid de cards: `<ButecoCard variant="photo">` se `fotoUrl`, `<ButecoCard variant="flat">` se não
- Estado vazio: linguagem botequeira — "Nenhum buteco encontrado por aqui. Tente outro bairro ou limpa os filtros."
- Contagem em `font-mono text-[11px] text-ink-muted uppercase tracking-wide`

---

## Sub-issue 5 — Detalhe do buteco

**Branch:** `feat/ds-5-detalhe-buteco`

### `app/(public)/butecos/[slug]/page.tsx`

- Hero: `<Image>` com `aspect-[4/2.6] rounded-[14px]`, fallback color block em `bg-terracota-100`
- Nome: `font-display font-bold text-[34px] text-ink tracking-tight`
- Localização: `font-mono text-[13px] text-ink-muted` (bairro · cidade)
- PetiscoNome: `font-display font-semibold text-[20px] text-tinto-700`
- PetiscoDesc: `font-body text-[15px] text-ink-soft`
- Metadados (endereço, telefone, horário): lista com separadores `·` em `font-mono text-[13px] text-ink-muted`
- Ações (`ButecoActionPanel`): botões via `<Button variant="primary">` (Carimbar) e `<Button variant="secondary">` (Favoritar)
- Link de volta: `← Butecos` em `font-body text-[13px] text-ink-muted hover:text-ink`

---

## Sub-issue 6 — Login + Minha Conta

**Branch:** `feat/ds-6-conta`

### Login (`app/(auth)/login/page.tsx`)

Mantém estrutura de card único (já bem desenhada). Atualizações:
- Fontes trocadas para o design system
- Copy ajustado para tom botequeiro: `"Entre e continue o rolê"`, `"Salve seus butecos favoritos"`, `"Colecione carimbos dos lugares que você conheceu"`
- Botão Google usa `<Button variant="primary" size="lg" className="w-full">`
- Gradiente de fundo mantido (dark, tinto-900 → terracota)

### Minha Conta (`app/(private)/minha-conta/page.tsx`)

- Heading: `font-display font-bold text-[28px] text-ink`
- Seção "Favoritos" — mantém o nome; cada item ganha `<Carimbo size="xs" color="mostarda">` ao lado do nome do buteco
- Seção "Visitados" → renomeada para "Butecos que você conheceu"; cada item ganha `<Carimbo size="xs" color="tinto">` + data da visita em `font-mono text-[11px] text-ink-muted`; o carimbo aqui representa o check-in, que é o sentido correto do termo no domínio
- Estado vazio (cada seção): `"Nenhum favorito ainda — bora explorar?"` / `"Nenhum carimbo ainda — bora conhecer um buteco?"` com `<Button variant="primary">` para `/butecos`

---

## Fora de escopo

- Novas páginas (Rotas, Montar rota, Descobrir, Rota em andamento) — ficam para issues futuras
- Componentes `<Prosa>` (review) e `<RotaCard>` — não há página que os consuma ainda
- Foto-placeholder SVGs do design bundle — não usados (butecos têm `fotoUrl` real ou fallback de cor)

---

## Critérios de conclusão da issue #88

- [ ] Todas as 6 sub-issues mergeadas em `main`
- [ ] `npm run lint`, `npm run build` e `npm run test` passando em cada PR
- [ ] Nenhuma classe zinc/slate/geist remanescente nas páginas redesenhadas
- [ ] Dark mode funcional em todas as páginas
- [ ] Mobile bottom nav visível em viewport < 768px
