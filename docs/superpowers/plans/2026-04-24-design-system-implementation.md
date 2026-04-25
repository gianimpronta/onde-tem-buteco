# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the warm earthy design system (palette, typography, icons, components, page redesigns) across the onde-tem-buteco Next.js 16 app in 6 sequential sub-issues, each delivered via its own branch and PR.

**Architecture:** Foundation tokens and fonts ship first (Sub-issue 1), followed by shared UI components (Sub-issue 2), navigation chrome (Sub-issue 3), then public pages (Sub-issues 4–5), and auth/account pages (Sub-issue 6). Each sub-issue depends on the previous one being merged to `main` before starting.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, Tailwind v4 CSS-based config (`@theme inline`), `next/font/google`, Jest + @testing-library/react (jsdom), all commands run from `apps/web/`

---

## File Map

| File | Action | Sub-issue |
|---|---|---|
| `app/globals.css` | Replace | 1 |
| `app/layout.tsx` | Replace | 1 |
| `components/ui/chip.tsx` | Create | 2 |
| `components/ui/button.tsx` | Create | 2 |
| `components/ui/carimbo.tsx` | Create | 2 |
| `components/butecos/buteco-card.tsx` | Create | 2 |
| `components/butecos/filter-form.tsx` | Modify | 2 |
| `next.config.ts` | Modify | 2 |
| `lib/public-butecos.ts` | Modify | 4 |
| `components/ui/header.tsx` | Modify | 3 |
| `components/ui/bottom-nav.tsx` | Create | 3 |
| `app/(public)/layout.tsx` | Replace | 3 |
| `app/(public)/page.tsx` | Replace | 4 |
| `app/(public)/butecos/page.tsx` | Replace | 4 |
| `app/(public)/butecos/[slug]/page.tsx` | Modify return block | 5 |
| `app/(public)/butecos/[slug]/__tests__/page.test.tsx` | Update test | 5 |
| `app/(auth)/login/page.tsx` | Replace | 6 |
| `app/(private)/minha-conta/page.tsx` | Replace | 6 |

Test files created alongside new components:
- `components/ui/__tests__/chip.test.tsx`
- `components/ui/__tests__/button.test.tsx`
- `components/ui/__tests__/carimbo.test.tsx`
- `components/butecos/__tests__/buteco-card.test.tsx`
- `components/ui/__tests__/bottom-nav.test.tsx`

---

## Sub-issue 1 — Foundation

**Branch:** `feat/ds-1-foundation`

Replaces the placeholder zinc/slate tokens in `globals.css` and swaps Geist fonts in `layout.tsx` for the warm earthy palette and the three project typefaces. Verified by TypeScript compilation and `next build`.

### Task 1: Replace CSS tokens in globals.css

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Overwrite globals.css with the warm earthy token set**

Replace the entire file content with:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));

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

/* Textura kraft — uso com overlay semi-opaco sobre superfície */
.grao {
  background-image:
    radial-gradient(rgba(74,20,15,.08) 1px, transparent 1px),
    radial-gradient(rgba(74,20,15,.05) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
}

.dark .leaflet-tile-pane {
  filter: invert(90%) hue-rotate(180deg);
}
```

- [ ] **Step 2: Verify old tokens are gone**

Run: `grep "geist\|Geist\|--background\|--foreground\|zinc\|slate" apps/web/app/globals.css`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(ds-1): substitui tokens CSS por paleta warm earthy

Troca tokens zinc/slate e vars --background/--foreground pelo design
system warm earthy: cream, terracota, mostarda, tinto, breu, mata e vars
semânticas (bg, surface, ink, line, primary, accent). Mapeia tudo para
classes Tailwind via @theme inline. Adiciona .grao, mantém filtro Leaflet.

Refs #88-1"
```

### Task 2: Replace fonts in layout.tsx

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Update layout.tsx to use the three design system fonts**

Replace the entire file content with:

```tsx
import type { Metadata } from "next";
import { Familjen_Grotesk, Inter_Tight, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://onde-tem-buteco.vercel.app"),
  title: {
    default: "Onde Tem Buteco",
    template: "%s | Onde Tem Buteco",
  },
  description:
    "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Onde Tem Buteco",
    description:
      "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
    url: "/",
    siteName: "Onde Tem Buteco",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Onde Tem Buteco",
    description:
      "Encontre os butecos participantes do Comida di Buteco em um mapa interativo, com filtros por cidade e bairro.",
  },
};

const themeScript = `
  try {
    var t = localStorage.getItem('theme');
    var p = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (!t && p)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${familjenGrotesk.variable} ${interTight.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink font-body">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify Geist is completely removed**

Run: `grep -r "Geist\|geist-sans\|geist-mono" apps/web/app --include="*.tsx" --include="*.ts"`
Expected: no output

- [ ] **Step 3: Run build to confirm TypeScript and font loading**

Run: `cd apps/web && npm run build`
Expected: Build succeeds. On first run, `next/font` downloads the three font families.

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat(ds-1): troca fontes Geist por Familjen Grotesk, Inter Tight e DM Mono

Remove Geist e Geist_Mono. Carrega Familjen_Grotesk (display),
Inter_Tight (body) e DM_Mono (mono) via next/font/google com variáveis
CSS correspondentes. Aplica font-body e bg-bg no body.

Refs #88-1"
```

---

## Sub-issue 2 — Componentes UI

**Branch:** `feat/ds-2-componentes`

Creates four new shared components (Chip, Button, Carimbo, ButecoCard), updates FilterForm, and adds image domain config to next.config.ts. All new components are test-driven.

### Task 3: Create Chip component

**Files:**
- Create: `apps/web/components/ui/__tests__/chip.test.tsx`
- Create: `apps/web/components/ui/chip.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/components/ui/__tests__/chip.test.tsx`:

```tsx
/** @jest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "@/components/ui/chip";

describe("Chip", () => {
  it("renders children text", () => {
    render(<Chip>São Paulo</Chip>);
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
  });

  it("renders as a button element", () => {
    render(<Chip>São Paulo</Chip>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies active classes when active is true", () => {
    render(<Chip active>São Paulo</Chip>);
    expect(screen.getByRole("button").className).toContain("bg-tinto-700");
  });

  it("does not apply active classes when active is false", () => {
    render(<Chip active={false}>São Paulo</Chip>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toContain("bg-tinto-700");
    expect(btn.className).toContain("bg-surface-alt");
  });

  it("shows indicator dot when active", () => {
    render(<Chip active>São Paulo</Chip>);
    const dot = screen.getByRole("button").querySelector("[aria-hidden]");
    expect(dot).not.toBeNull();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Chip onClick={onClick}>São Paulo</Chip>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to confirm tests fail**

Run: `cd apps/web && npm run test -- components/ui/__tests__/chip.test.tsx`
Expected: FAIL — "Cannot find module '@/components/ui/chip'"

- [ ] **Step 3: Implement Chip**

Create `apps/web/components/ui/chip.tsx`:

```tsx
type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Chip({ active, children, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
        active
          ? "border-tinto-700 bg-tinto-700 text-primary-ink"
          : "border-line bg-surface-alt text-ink-soft hover:border-tinto-700 hover:text-ink",
      ].join(" ")}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-ink" aria-hidden />}
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- components/ui/__tests__/chip.test.tsx`
Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/chip.tsx apps/web/components/ui/__tests__/chip.test.tsx
git commit -m "feat(ds-2): adiciona componente Chip para filtros pill

Chip renderiza como button com variante active (bg-tinto-700 + dot
indicador) e inativa (bg-surface-alt). Testado com 6 casos.

Refs #88-2"
```

### Task 4: Create Button component

**Files:**
- Create: `apps/web/components/ui/__tests__/button.test.tsx`
- Create: `apps/web/components/ui/button.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/components/ui/__tests__/button.test.tsx`:

```tsx
/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Confirmar</Button>);
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  it("primary variant includes bg-primary", () => {
    render(<Button variant="primary">Submit</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });

  it("secondary variant includes border-tinto-700", () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(screen.getByRole("button").className).toContain("border-tinto-700");
  });

  it("ghost variant includes text-ink-soft", () => {
    render(<Button variant="ghost">Sair</Button>);
    expect(screen.getByRole("button").className).toContain("text-ink-soft");
  });

  it("passes through native button props", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges className prop", () => {
    render(<Button className="w-full">Submit</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
```

- [ ] **Step 2: Run to confirm tests fail**

Run: `cd apps/web && npm run test -- components/ui/__tests__/button.test.tsx`
Expected: FAIL — "Cannot find module '@/components/ui/button'"

- [ ] **Step 3: Implement Button**

Create `apps/web/components/ui/button.tsx`:

```tsx
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:   "bg-primary text-primary-ink hover:bg-terracota-600",
  secondary: "border border-tinto-700 text-tinto-700 hover:bg-terracota-100",
  ghost:     "text-ink-soft hover:text-ink",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-2.5 text-[14px]",
  lg: "px-6 py-3 text-[15px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={[
        "inline-flex items-center justify-center rounded-full font-medium transition",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 4: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- components/ui/__tests__/button.test.tsx`
Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/button.tsx apps/web/components/ui/__tests__/button.test.tsx
git commit -m "feat(ds-2): adiciona componente Button com variantes primary/secondary/ghost

Button renderiza button nativo com variant (primary/secondary/ghost)
e size (sm/md/lg). Variantes mapeadas para tokens warm earthy.
Testado com 6 casos.

Refs #88-2"
```

### Task 5: Create Carimbo component

**Files:**
- Create: `apps/web/components/ui/__tests__/carimbo.test.tsx`
- Create: `apps/web/components/ui/carimbo.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/components/ui/__tests__/carimbo.test.tsx`:

```tsx
/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Carimbo } from "@/components/ui/carimbo";

describe("Carimbo", () => {
  it("renders the buteco name", () => {
    render(<Carimbo nome="Bar do Zeca" />);
    expect(screen.getByText("Bar do Zeca")).toBeInTheDocument();
  });

  it("shows bairro and numero in lg size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="lg" />);
    expect(screen.getByText("Pinheiros")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("hides bairro and numero in sm size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="sm" />);
    expect(screen.queryByText("Pinheiros")).not.toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("hides bairro and numero in xs size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="xs" />);
    expect(screen.queryByText("Pinheiros")).not.toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("has aria-label with buteco name", () => {
    render(<Carimbo nome="Bar do Zeca" />);
    expect(screen.getByLabelText("Carimbo: Bar do Zeca")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to confirm tests fail**

Run: `cd apps/web && npm run test -- components/ui/__tests__/carimbo.test.tsx`
Expected: FAIL — "Cannot find module '@/components/ui/carimbo'"

- [ ] **Step 3: Implement Carimbo**

Create `apps/web/components/ui/carimbo.tsx`:

```tsx
type CarimboProps = {
  nome: string;
  bairro?: string;
  numero?: string;
  size?: "lg" | "sm" | "xs";
  color?: "tinto" | "mostarda" | "mata";
};

const sizeConfig = {
  lg: { dim: "w-24 h-24", text: "text-[11px]", rotate: "-rotate-6" },
  sm: { dim: "w-14 h-14", text: "text-[9px]",  rotate: "-rotate-3" },
  xs: { dim: "w-8 h-8",   text: "text-[6px]",  rotate: "" },
};

const colorConfig = {
  tinto:    "border-tinto-700 text-tinto-700",
  mostarda: "border-mostarda-700 text-mostarda-700",
  mata:     "border-mata-700 text-mata-700",
};

export function Carimbo({ nome, bairro, numero, size = "lg", color = "tinto" }: CarimboProps) {
  const { dim, text, rotate } = sizeConfig[size];
  const showDetails = size === "lg";

  return (
    <div
      className={[
        "relative flex flex-col items-center justify-center rounded-full border-2 font-mono text-center leading-tight",
        dim,
        text,
        rotate,
        colorConfig[color],
      ].join(" ")}
      aria-label={`Carimbo: ${nome}`}
    >
      {showDetails && numero && <span className="font-bold">{numero}</span>}
      <span className="font-semibold">{nome}</span>
      {showDetails && bairro && <span className="opacity-70">{bairro}</span>}
    </div>
  );
}
```

- [ ] **Step 4: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- components/ui/__tests__/carimbo.test.tsx`
Expected: PASS — 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/carimbo.tsx apps/web/components/ui/__tests__/carimbo.test.tsx
git commit -m "feat(ds-2): adiciona componente Carimbo badge circular

Carimbo renderiza badge circular DM Mono com variantes de size (lg/sm/xs)
e color (tinto/mostarda/mata). Sizes sm e xs ocultam bairro e número.
Testado com 5 casos.

Refs #88-2"
```

### Task 6: Create ButecoCard component and configure image domains

**Files:**
- Create: `apps/web/components/butecos/__tests__/buteco-card.test.tsx`
- Create: `apps/web/components/butecos/buteco-card.tsx`
- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Add image remotePatterns to next.config.ts**

The scraper fetches images from comidadibuteco.com.br. `next/image` requires the host to be allowlisted.

Replace `apps/web/next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "*": ["./app/generated/prisma/**/*"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "comidadibuteco.com.br",
      },
      {
        protocol: "https",
        hostname: "*.comidadibuteco.com.br",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Write the failing tests**

Create `apps/web/components/butecos/__tests__/buteco-card.test.tsx`:

```tsx
/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { ButecoCard } from "@/components/butecos/buteco-card";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/image", () => {
  return function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  };
});

const mockButeco = {
  nome: "Bar do Zeca",
  bairro: "Pinheiros",
  cidade: "São Paulo",
  petiscoNome: "Coxinha de frango com requeijão",
  fotoUrl: "https://comidadibuteco.com.br/foto.jpg",
  slug: "bar-do-zeca",
};

describe("ButecoCard", () => {
  it("renders buteco name", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText("Bar do Zeca")).toBeInTheDocument();
  });

  it("links to the buteco detail page", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/butecos/bar-do-zeca");
  });

  it("photo variant renders img when fotoUrl is provided", () => {
    render(<ButecoCard buteco={mockButeco} variant="photo" />);
    expect(screen.getByRole("img", { name: "Bar do Zeca" })).toBeInTheDocument();
  });

  it("flat variant renders no img", () => {
    render(<ButecoCard buteco={{ ...mockButeco, fotoUrl: null }} variant="flat" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("defaults to photo variant when fotoUrl is present", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("defaults to flat variant when fotoUrl is null", () => {
    render(<ButecoCard buteco={{ ...mockButeco, fotoUrl: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders petiscoNome when provided", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText("Coxinha de frango com requeijão")).toBeInTheDocument();
  });

  it("renders cidade and bairro", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText(/Pinheiros/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run to confirm tests fail**

Run: `cd apps/web && npm run test -- components/butecos/__tests__/buteco-card.test.tsx`
Expected: FAIL — "Cannot find module '@/components/butecos/buteco-card'"

- [ ] **Step 4: Implement ButecoCard**

Create `apps/web/components/butecos/buteco-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

type Buteco = {
  nome: string;
  bairro: string | null;
  cidade: string;
  petiscoNome: string | null;
  fotoUrl: string | null;
  slug: string;
};

type ButecoCardProps = {
  buteco: Buteco;
  variant?: "photo" | "flat";
};

export function ButecoCard({ buteco, variant }: ButecoCardProps) {
  const resolvedVariant = variant ?? (buteco.fotoUrl ? "photo" : "flat");

  if (resolvedVariant === "photo" && buteco.fotoUrl) {
    return (
      <Link
        href={`/butecos/${buteco.slug}`}
        className="block overflow-hidden rounded-[14px] border border-line-soft bg-white shadow-warm-sm transition hover:-translate-y-0.5 hover:shadow-warm"
      >
        <div className="relative aspect-[4/2.6] w-full overflow-hidden">
          <Image src={buteco.fotoUrl} alt={buteco.nome} fill className="object-cover" />
        </div>
        <div className="p-4">
          <p className="font-body text-[12px] font-medium uppercase tracking-wide text-ink-muted">
            {buteco.bairro ? `${buteco.bairro} · ` : ""}
            {buteco.cidade}
          </p>
          <h2 className="mt-1 font-display text-[18px] font-semibold leading-tight text-ink">
            {buteco.nome}
          </h2>
          {buteco.petiscoNome && (
            <p className="mt-2 font-display text-[14px] font-medium text-tinto-700">
              {buteco.petiscoNome}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/butecos/${buteco.slug}`}
      className="relative block overflow-hidden rounded-[14px] border border-mostarda-300 bg-mostarda-100 transition hover:-translate-y-0.5"
    >
      <div className="grao absolute inset-0" aria-hidden />
      <div className="relative p-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-mostarda-700">
          {buteco.bairro ? `${buteco.bairro} · ` : ""}
          {buteco.cidade}
        </p>
        <h2 className="mt-2 font-display text-[30px] font-bold leading-none text-tinto-700">
          {buteco.nome}
        </h2>
        {buteco.petiscoNome && (
          <p className="mt-3 font-body text-[14px] text-breu-800">{buteco.petiscoNome}</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- components/butecos/__tests__/buteco-card.test.tsx`
Expected: PASS — 8 tests pass

- [ ] **Step 6: Commit**

```bash
git add apps/web/next.config.ts apps/web/components/butecos/buteco-card.tsx apps/web/components/butecos/__tests__/buteco-card.test.tsx
git commit -m "feat(ds-2): adiciona ButecoCard com variantes photo e flat

ButecoCard auto-resolve variante pelo fotoUrl quando não especificado.
Variante photo usa next/image fill + aspect-[4/2.6]. Variante flat usa
.grao overlay e paleta mostarda/tinto-700. next.config.ts recebe
remotePatterns para comidadibuteco.com.br. Testado com 8 casos.

Refs #88-2"
```

### Task 7: Update FilterForm and run final validation

**Files:**
- Modify: `apps/web/components/butecos/filter-form.tsx`

- [ ] **Step 1: Update FilterForm to use design system classes and Button component**

Replace `apps/web/components/butecos/filter-form.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  cidadeOptions: string[];
  bairroOptions: string[];
};

export function ButecosFilterForm({ cidadeOptions, bairroOptions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const cidade = searchParams.get("cidade") ?? "";
  const bairro = searchParams.get("bairro") ?? "";

  function onCidadeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    const newCidade = e.target.value;
    if (newCidade) params.set("cidade", newCidade);
    if (q) params.set("q", q);
    const query = params.toString();
    router.push(`/butecos${query ? `?${query}` : ""}`);
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end">
      <label className="flex min-w-0 flex-col gap-2 sm:col-span-2 lg:col-span-1">
        <span className="font-body text-[13px] font-semibold text-ink">Buscar</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Nome do buteco ou petisco"
          className="w-full rounded-full border border-line px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary"
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="font-body text-[13px] font-semibold text-ink">Cidade</span>
        <select
          name="cidade"
          value={cidade}
          onChange={onCidadeChange}
          className="w-full rounded-full border border-line bg-surface px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary"
        >
          <option value="">Todas as cidades</option>
          {cidadeOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="font-body text-[13px] font-semibold text-ink">Bairro</span>
        <select
          key={cidade}
          name="bairro"
          defaultValue={bairro}
          disabled={bairroOptions.length === 0}
          className="w-full rounded-full border border-line bg-surface px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos os bairros</option>
          {bairroOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" variant="primary" size="sm">
        Aplicar filtros
      </Button>

      <Link
        href="/butecos"
        className="inline-flex items-center justify-center rounded-full border border-tinto-700 px-4 py-2 text-[13px] font-medium text-tinto-700 transition hover:bg-terracota-100"
      >
        Limpar
      </Link>
    </form>
  );
}
```

- [ ] **Step 2: Run all tests**

Run: `cd apps/web && npm run test`
Expected: All tests pass (new component tests + existing buteco-action-panel tests)

- [ ] **Step 3: Run lint and build**

Run: `cd apps/web && npm run lint && npm run build`
Expected: No lint errors, build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/butecos/filter-form.tsx
git commit -m "feat(ds-2): atualiza FilterForm para estilos do design system

Inputs e selects recebem rounded-full, border-line, font-body.
Botão 'Aplicar filtros' usa Button primary. 'Limpar' estilizado como
link secondary inline. Remove classes zinc/amber.

Refs #88-2"
```

---

## Sub-issue 3 — Header + Bottom Nav

**Branch:** `feat/ds-3-header-nav`

Updates the header to use the logo SVG and warm earthy tokens, adds a mobile-only BottomNav, and updates the public layout.

### Task 8: Update Header

**Files:**
- Modify: `apps/web/components/ui/header.tsx`

- [ ] **Step 1: Rewrite header.tsx with logo SVG and design system classes**

Replace `apps/web/components/ui/header.tsx` with:

```tsx
import Link from "next/link";
import { isE2EFixtureMode } from "@/lib/public-butecos";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const session = isE2EFixtureMode()
    ? null
    : await import("@/lib/auth").then(({ auth }) => auth());

  return (
    <header className="w-full border-b border-line-soft bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <img
            src="/logo-wordmark.svg"
            height={32}
            alt="Onde tem buteco"
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/butecos"
            className="hidden font-body text-[14px] font-medium text-ink-soft transition hover:text-primary sm:inline"
          >
            Ver botecos
          </Link>
          {session ? (
            <>
              <Link
                href="/minha-conta"
                className="hidden font-body text-[14px] font-medium text-ink-soft transition hover:text-primary sm:inline"
              >
                Minha Conta
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/lib/auth");
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button type="submit" variant="ghost" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Login
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Verify no zinc/amber classes remain**

Run: `grep "zinc\|amber\|slate" apps/web/components/ui/header.tsx`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/ui/header.tsx
git commit -m "feat(ds-3): atualiza Header com logo SVG e tokens warm earthy

Remove texto e cores zinc/amber. Usa logo-wordmark.svg, bg-surface,
border-line-soft, font-body. Login como link estilizado, Sair como
Button ghost. Mantém ThemeToggle e server action de logout.

Refs #88-3"
```

### Task 9: Create BottomNav

**Files:**
- Create: `apps/web/components/ui/__tests__/bottom-nav.test.tsx`
- Create: `apps/web/components/ui/bottom-nav.tsx`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/components/ui/__tests__/bottom-nav.test.tsx`:

```tsx
/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/ui/bottom-nav";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
}));

describe("BottomNav", () => {
  it("renders 5 navigation links", () => {
    render(<BottomNav />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("renders all tab labels", () => {
    render(<BottomNav />);
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Mapa")).toBeInTheDocument();
    expect(screen.getByText("Rotas")).toBeInTheDocument();
    expect(screen.getByText("Carimbos")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("marks Início as current page when pathname is /", () => {
    render(<BottomNav />);
    const inicioLink = screen.getByText("Início").closest("a");
    expect(inicioLink).toHaveAttribute("aria-current", "page");
  });

  it("marks Rotas tab as aria-disabled", () => {
    render(<BottomNav />);
    const rotasLink = screen.getByText("Rotas").closest("a");
    expect(rotasLink).toHaveAttribute("aria-disabled", "true");
  });

  it("nav element has descriptive aria-label", () => {
    render(<BottomNav />);
    expect(screen.getByRole("navigation")).toHaveAttribute("aria-label", "Navegação principal");
  });
});
```

- [ ] **Step 2: Run to confirm tests fail**

Run: `cd apps/web && npm run test -- components/ui/__tests__/bottom-nav.test.tsx`
Expected: FAIL — "Cannot find module '@/components/ui/bottom-nav'"

- [ ] **Step 3: Implement BottomNav**

Create `apps/web/components/ui/bottom-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Início",   icon: "home",    href: "/",            disabled: false },
  { label: "Mapa",     icon: "map",     href: "/",            disabled: false },
  { label: "Rotas",    icon: "rota",    href: "/rotas",       disabled: true  },
  { label: "Carimbos", icon: "carimbo", href: "/minha-conta", disabled: false },
  { label: "Perfil",   icon: "user",    href: "/minha-conta", disabled: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-line-soft bg-white md:hidden"
      aria-label="Navegação principal"
    >
      {tabs.map(({ label, icon, href, disabled }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={label}
            href={disabled ? "#" : href}
            aria-disabled={disabled}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-3 transition",
              isActive ? "bg-mostarda-100 text-tinto-700" : "text-ink-muted",
              disabled ? "pointer-events-none opacity-40" : "hover:text-tinto-700",
            ].join(" ")}
          >
            <svg className="h-5 w-5" aria-hidden>
              <use href={`/icons.svg#${icon}`} />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- components/ui/__tests__/bottom-nav.test.tsx`
Expected: PASS — 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add apps/web/components/ui/bottom-nav.tsx apps/web/components/ui/__tests__/bottom-nav.test.tsx
git commit -m "feat(ds-3): adiciona BottomNav mobile com 5 tabs

Nav fixo no rodapé, visível apenas em mobile (md:hidden). 5 tabs:
Início, Mapa, Rotas (disabled), Carimbos, Perfil. Ícones do sprite
icons.svg. Active state em mostarda-100/tinto-700. Testado com 5 casos.

Refs #88-3"
```

### Task 10: Update public layout

**Files:**
- Modify: `apps/web/app/(public)/layout.tsx`

- [ ] **Step 1: Add BottomNav and pb-20 to public layout**

Replace `apps/web/app/(public)/layout.tsx` with:

```tsx
import Header from "@/components/ui/header";
import { BottomNav } from "@/components/ui/bottom-nav";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <div className="pb-20 md:pb-0">{children}</div>
      <BottomNav />
    </>
  );
}
```

- [ ] **Step 2: Run all tests**

Run: `cd apps/web && npm run test`
Expected: All tests pass

- [ ] **Step 3: Run lint and build**

Run: `cd apps/web && npm run lint && npm run build`
Expected: No errors, build succeeds

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(public)/layout.tsx"
git commit -m "feat(ds-3): integra BottomNav no layout público

Adiciona BottomNav após o conteúdo. pb-20 em mobile evita sobreposição
com o nav fixo; md:pb-0 no desktop remove o padding.

Refs #88-3"
```

---

## Sub-issue 4 — Home + Listagem

**Branch:** `feat/ds-4-home-listagem`

Adds `fotoUrl` to the listagem data query (required for ButecoCard photo variant), then redesigns Home and Listagem pages.

### Task 11: Add fotoUrl to listagem data

**Files:**
- Modify: `apps/web/lib/public-butecos.ts`

- [ ] **Step 1: Add fotoUrl field to PublicButecoListItem type**

In `apps/web/lib/public-butecos.ts`, find the `PublicButecoListItem` type (lines 7–13) and add `fotoUrl`:

```ts
export type PublicButecoListItem = {
  slug: string;
  nome: string;
  cidade: string;
  bairro: string | null;
  petiscoNome: string | null;
  fotoUrl: string | null;
};
```

- [ ] **Step 2: Add fotoUrl to the E2E fixture mapping**

Find the `butecos: filteredButecos.map(` block inside `getButecosPageData` (around line 201) and update the destructuring and object literal:

```ts
      butecos: filteredButecos.map(
        ({ slug, nome, cidade, bairro, petiscoNome, fotoUrl }) =>
          ({
            slug,
            nome,
            cidade,
            bairro,
            petiscoNome,
            fotoUrl,
          }) satisfies PublicButecoListItem
      ),
```

- [ ] **Step 3: Add fotoUrl to the Prisma select**

Find the `prisma.buteco.findMany` inside `getButecosPageData` (around line 234) and add `fotoUrl: true` to the select:

```ts
      prisma.buteco.findMany({
        where: buildButecoWhere(normalizedFilters),
        orderBy: { nome: "asc" },
        select: {
          slug: true,
          nome: true,
          cidade: true,
          bairro: true,
          petiscoNome: true,
          fotoUrl: true,
        },
      }),
```

- [ ] **Step 4: Run all tests**

Run: `cd apps/web && npm run test`
Expected: All tests pass (TypeScript now satisfies the updated type)

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/public-butecos.ts
git commit -m "feat(ds-4): inclui fotoUrl na listagem de butecos

Adiciona fotoUrl ao tipo PublicButecoListItem, ao select Prisma e ao
mapeamento dos fixtures E2E. Necessário para que ButecoCard resolva
automaticamente entre variante photo e flat.

Refs #88-4"
```

### Task 12: Redesign Home page

**Files:**
- Modify: `apps/web/app/(public)/page.tsx`

- [ ] **Step 1: Rewrite Home page with warm earthy design**

Replace `apps/web/app/(public)/page.tsx` with:

```tsx
import Link from "next/link";
import { MapaButecosShell } from "@/components/mapa/mapa-butecos-shell";
import { getHomeData } from "@/lib/public-butecos";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { total, butecosComMapa } = await getHomeData().catch(() => ({
    total: 0,
    butecosComMapa: [],
  }));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl bg-surface p-5 sm:p-7">
        <div className="grao absolute inset-0" aria-hidden />
        <div className="relative">
          <h1 className="font-display text-[42px] font-bold leading-tight tracking-tight text-tinto-700 sm:text-[52px]">
            Descubra os botecos no mapa
          </h1>
          <p className="mt-3 max-w-2xl font-body text-[15px] leading-relaxed text-ink-soft sm:text-[17px]">
            Explore os participantes do Comida di Buteco, filtre por região e encontre seu próximo
            destino.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {total > 0 && (
              <span className="inline-flex items-center rounded-full bg-mostarda-100 px-4 py-2 font-mono text-[12px] font-bold text-mostarda-700">
                {total} botecos participando
              </span>
            )}
            <Link
              href="/butecos"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[14px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Ver botecos
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Mapa de botecos" className="pb-6">
        <MapaButecosShell butecos={butecosComMapa} />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify no zinc/slate/amber classes remain**

Run: `grep "zinc\|slate\|amber" "apps/web/app/(public)/page.tsx"`
Expected: no output

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(public)/page.tsx"
git commit -m "feat(ds-4): redesenha Home page com paleta warm earthy

Hero com .grao overlay, h1 em font-display tinto-700, badge de contagem
em mostarda-100 font-mono, CTA 'Ver botecos' em terracota. Remove zinc.

Refs #88-4"
```

### Task 13: Redesign Listagem page

**Files:**
- Modify: `apps/web/app/(public)/butecos/page.tsx`

- [ ] **Step 1: Rewrite Listagem page using ButecoCard and warm earthy tokens**

Replace `apps/web/app/(public)/butecos/page.tsx` with:

```tsx
import Link from "next/link";
import { Suspense } from "react";
import { ButecosFilterForm } from "@/components/butecos/filter-form";
import { ButecoCard } from "@/components/butecos/buteco-card";
import { countActiveButecoFilters, normalizeButecoFilters } from "@/lib/buteco-filters";
import { getButecosPageData } from "@/lib/public-butecos";

export default async function ButecosPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }> }>) {
  const filters = normalizeButecoFilters(await searchParams);
  const {
    cidades: cidadeOptions,
    bairros: bairroOptions,
    butecos,
  } = await getButecosPageData(filters);

  const activeFiltersCount = countActiveButecoFilters(filters);
  const activeFiltersSuffix = activeFiltersCount === 1 ? "" : "s";
  const activeFiltersLabel =
    activeFiltersCount > 0 ? ` com ${activeFiltersCount} filtro${activeFiltersSuffix}` : "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-line-soft bg-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
              Explorar botecos
            </p>
            <h1 className="mt-1 font-display text-[32px] font-bold tracking-tight text-ink">
              Botecos
            </h1>
            <p className="mt-2 max-w-2xl font-body text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
              Refine a lista por cidade, bairro ou busca textual para encontrar um petisco ou boteco
              com mais rapidez.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-surface-alt px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
            {butecos.length} resultado{butecos.length === 1 ? "" : "s"}
            {activeFiltersLabel}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line-soft bg-surface p-6">
        <Suspense>
          <ButecosFilterForm cidadeOptions={cidadeOptions} bairroOptions={bairroOptions} />
        </Suspense>

        {filters.cidade && bairroOptions.length === 0 ? (
          <p className="mt-4 font-body text-[14px] text-ink-muted">
            Ainda não existem bairros cadastrados para a cidade selecionada.
          </p>
        ) : null}
      </section>

      {butecos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
          <h2 className="font-display text-[22px] font-bold text-ink">
            Nenhum buteco encontrado por aqui
          </h2>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-soft">
            Tente outro bairro ou limpa os filtros.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/butecos"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Limpar filtros
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-tinto-700 px-5 py-2.5 font-body text-[13px] font-medium text-tinto-700 transition hover:bg-terracota-100"
            >
              Voltar para a home
            </Link>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {butecos.map((b) => (
            <li key={b.slug}>
              <ButecoCard buteco={b} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify no zinc/slate/amber classes remain**

Run: `grep "zinc\|slate\|amber" "apps/web/app/(public)/butecos/page.tsx"`
Expected: no output

- [ ] **Step 3: Run all tests, lint, and build**

Run: `cd apps/web && npm run test && npm run lint && npm run build`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(public)/butecos/page.tsx"
git commit -m "feat(ds-4): redesenha Listagem com ButecoCard e tokens warm earthy

Grid de cards usa ButecoCard (auto-resolve variante por fotoUrl).
Header da listagem em font-display/ink. Contagem em font-mono.
Estado vazio com copy botequeiro. Remove zinc/slate/amber.

Refs #88-4"
```

---

## Sub-issue 5 — Detalhe do buteco

**Branch:** `feat/ds-5-detalhe-buteco`

Updates the detail page test first (the bairro separator changes from `, ` to ` · `), then redesigns the page.

### Task 14: Update detail page test and redesign

**Files:**
- Modify: `apps/web/app/(public)/butecos/[slug]/__tests__/page.test.tsx`
- Modify: `apps/web/app/(public)/butecos/[slug]/page.tsx`

- [ ] **Step 1: Update the test to expect the new separator and link text**

In `apps/web/app/(public)/butecos/[slug]/__tests__/page.test.tsx`, find the assertion:

```ts
    expect(screen.getByText("Savassi, Belo Horizonte")).toBeVisible();
```

Replace it with:

```ts
    expect(screen.getByText("Savassi · Belo Horizonte")).toBeVisible();
```

- [ ] **Step 2: Run to confirm the updated test fails**

Run: `cd apps/web && npm run test -- "app/(public)/butecos/\[slug\]/__tests__/page.test.tsx"`
Expected: FAIL — the heading and address assertions pass but `"Savassi · Belo Horizonte"` is not found (page still has `, ` separator)

- [ ] **Step 3: Replace the ButecoPage return block**

In `apps/web/app/(public)/butecos/[slug]/page.tsx`, keep everything before the `return (` statement inside `ButecoPage` unchanged. Replace only the return block (from `return (` to the closing `);`) with:

```tsx
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/butecos"
        className="mb-6 block font-body text-[13px] text-ink-muted transition hover:text-ink"
      >
        ← Botecos
      </Link>

      {buteco.fotoUrl ? (
        <div className="relative mb-6 aspect-[4/2.6] w-full overflow-hidden rounded-[14px]">
          <Image src={buteco.fotoUrl} alt={buteco.nome} fill className="object-cover" />
        </div>
      ) : (
        <div className="mb-6 aspect-[4/2.6] w-full rounded-[14px] bg-terracota-100" />
      )}

      <h1 className="font-display text-[34px] font-bold leading-tight tracking-tight text-ink">
        {buteco.nome}
      </h1>
      <p className="mt-1 font-mono text-[13px] text-ink-muted">
        {buteco.bairro ? `${buteco.bairro} · ` : ""}
        {buteco.cidade}
      </p>

      {buteco.petiscoNome && (
        <div className="mt-6">
          <h2 className="font-display text-[20px] font-semibold text-tinto-700">
            {buteco.petiscoNome}
          </h2>
          {buteco.petiscoDesc && (
            <p className="mt-1 font-body text-[15px] leading-relaxed text-ink-soft">
              {buteco.petiscoDesc}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-1 font-mono text-[13px] text-ink-muted">
        {buteco.endereco && <p>{buteco.endereco}</p>}
        {buteco.telefone && <p>{buteco.telefone}</p>}
        {buteco.horario && <p>{buteco.horario}</p>}
      </div>

      <ButecoActionPanel
        butecoId={buteco.id}
        loginHref={actionState.loginHref}
        isAuthenticated={actionState.isAuthenticated}
        initialIsFavorito={actionState.isFavorito}
        initialIsVisitado={actionState.isVisitado}
      />
    </main>
  );
```

- [ ] **Step 4: Run to confirm tests pass**

Run: `cd apps/web && npm run test -- "app/(public)/butecos/\[slug\]/__tests__/page.test.tsx"`
Expected: PASS — both test cases pass

- [ ] **Step 5: Verify no zinc/slate/amber classes remain in the file**

Run: `grep "zinc\|slate\|amber" "apps/web/app/(public)/butecos/[slug]/page.tsx"`
Expected: no output

- [ ] **Step 6: Run all tests, lint, and build**

Run: `cd apps/web && npm run test && npm run lint && npm run build`
Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add "apps/web/app/(public)/butecos/[slug]/page.tsx" "apps/web/app/(public)/butecos/[slug]/__tests__/page.test.tsx"
git commit -m "feat(ds-5): redesenha Detalhe do buteco com tokens warm earthy

Hero image em aspect-[4/2.6] rounded-[14px], fallback terracota-100.
Nome em font-display ink, localização em font-mono ink-muted (· sep),
petisco em font-display tinto-700, metadata em font-mono. Remove zinc.

Refs #88-5"
```

---

## Sub-issue 6 — Login + Minha Conta

**Branch:** `feat/ds-6-conta`

Updates Login copy/fonts and redesigns Minha Conta with Carimbo badges.

### Task 15: Update Login page

**Files:**
- Modify: `apps/web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace login page with updated copy, logo mark, and font classes**

Replace `apps/web/app/(auth)/login/page.tsx` with:

```tsx
import { signIn } from "@/lib/auth";

const loginBenefits = [
  {
    title: "Favoritos",
    description: "Salve os butecos que entraram no seu rolê.",
  },
  {
    title: "Carimbos",
    description: "Colecione os lugares que você já conheceu.",
  },
] as const;

const loginSupportCards = [
  {
    title: "Roteiro salvo",
    description: "Retome sua seleção sem começar do zero.",
  },
  {
    title: "Sem senha",
    description: "Login simples com Google, sem burocracia.",
  },
  {
    title: "Pronto para mobile",
    description: "Acesse seu mapa de botecos de qualquer lugar.",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#140b07_0%,#3b1d10_42%,#7e3f18_76%,#d97706_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(251,191,36,0.14),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(217,119,6,0.26),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(14,8,5,0.42)] backdrop-blur-xl">
          <section className="px-6 pb-4 pt-8 text-center sm:px-8 sm:pt-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100/90">
              Conta Onde Tem Buteco
            </span>

            <h1 className="mx-auto mt-5 max-w-[12ch] font-display text-4xl font-black leading-[0.95] tracking-[-0.04em] text-amber-50 sm:text-5xl">
              Entre e continue o rolê.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl font-body text-sm leading-7 text-amber-50/85 sm:text-base">
              Salve seus butecos favoritos e colecione carimbos dos lugares que você conheceu.
            </p>
          </section>

          <section className="px-3 pb-3 sm:px-4">
            <div className="mx-auto w-full max-w-[29rem] rounded-[2rem] bg-[#fff8f1]/95 p-6 text-zinc-950 shadow-[0_26px_60px_rgba(20,11,7,0.24)] sm:p-8">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#fbbf24,#f97316)]">
                <img src="/logo-mark.svg" alt="OTB" className="h-10 w-10" />
              </div>

              <div className="mt-5 text-center font-mono text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ad5317]">
                Entrar
              </div>

              <h2 className="mt-3 text-center font-display text-3xl font-black leading-none tracking-[-0.04em] text-[#2c1409]">
                Acesse sua conta
              </h2>

              <p className="mx-auto mt-3 max-w-[34ch] text-center font-body text-sm leading-6 text-[#7b5036] sm:text-[0.95rem]">
                Use o Google para sincronizar seu histórico e manter seus botecos sempre por perto.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {loginBenefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.25rem] border border-[#f1d7c0] bg-[#fffdf9] p-4 text-left"
                  >
                    <h3 className="font-display text-sm font-bold text-[#2c1409]">{item.title}</h3>
                    <p className="mt-2 font-body text-sm leading-6 text-[#7b5036]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>

              <form
                className="mt-6"
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] px-6 font-body text-base font-extrabold text-[#2d1408] shadow-[0_18px_30px_rgba(245,158,11,0.28)] transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f1]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 font-mono text-xs font-black text-[#341708]">
                    G
                  </span>
                  Entrar com Google
                </button>
              </form>

              <p className="mt-4 text-center font-body text-sm text-[#8d6042]">
                Login simples, sem senha para criar.
              </p>
            </div>
          </section>

          <section className="grid gap-3 px-4 pb-6 pt-4 sm:px-6 sm:pb-7 lg:grid-cols-3">
            {loginSupportCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.4rem] border border-white/10 bg-white/10 p-4"
              >
                <h3 className="font-display text-sm font-bold text-amber-50">{item.title}</h3>
                <p className="mt-2 font-body text-sm leading-6 text-amber-50/80">
                  {item.description}
                </p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify font classes are applied**

Run: `grep -c "font-display\|font-body\|font-mono" "apps/web/app/(auth)/login/page.tsx"`
Expected: a number ≥ 6

- [ ] **Step 3: Commit**

```bash
git add "apps/web/app/(auth)/login/page.tsx"
git commit -m "feat(ds-6): atualiza Login com copy botequeiro e fontes do design system

Título 'Entre e continue o rolê', benefícios atualizados (Favoritos +
Carimbos), logo-mark.svg no ícone. Aplica font-display/font-body/font-mono.
Mantém gradiente e estrutura de card existentes.

Refs #88-6"
```

### Task 16: Redesign Minha Conta page

**Files:**
- Modify: `apps/web/app/(private)/minha-conta/page.tsx`

- [ ] **Step 1: Rewrite Minha Conta with Carimbo badges and warm earthy tokens**

Replace `apps/web/app/(private)/minha-conta/page.tsx` with:

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Carimbo } from "@/components/ui/carimbo";

export default async function MinhaContaPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favoritos: { include: { buteco: true }, orderBy: { createdAt: "desc" } },
      visitas: { include: { buteco: true }, orderBy: { visitadoEm: "desc" } },
    },
  });

  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-4 py-8">
      <h1 className="font-display text-[28px] font-bold text-ink">Minha Conta</h1>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold text-ink">Favoritos</h2>
        {user.favoritos.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-[14px] text-ink-muted">
              Nenhum favorito ainda — bora explorar?
            </p>
            <Link
              href="/butecos"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Ver botecos
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {user.favoritos.map(({ buteco }) => (
              <li key={buteco.slug} className="flex items-center gap-3">
                <Carimbo
                  nome={buteco.nome}
                  bairro={buteco.bairro ?? undefined}
                  size="xs"
                  color="mostarda"
                />
                <div>
                  <Link
                    href={`/butecos/${buteco.slug}`}
                    className="font-body font-medium text-ink transition hover:text-primary"
                  >
                    {buteco.nome}
                  </Link>
                  <p className="font-mono text-[11px] text-ink-muted">{buteco.cidade}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold text-ink">
          Butecos que você conheceu
        </h2>
        {user.visitas.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-[14px] text-ink-muted">
              Nenhum carimbo ainda — bora conhecer um buteco?
            </p>
            <Link
              href="/butecos"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Ver botecos
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {user.visitas.map(({ buteco, visitadoEm }) => (
              <li key={buteco.slug} className="flex items-center gap-3">
                <Carimbo
                  nome={buteco.nome}
                  bairro={buteco.bairro ?? undefined}
                  size="xs"
                  color="tinto"
                />
                <div>
                  <Link
                    href={`/butecos/${buteco.slug}`}
                    className="font-body font-medium text-ink transition hover:text-primary"
                  >
                    {buteco.nome}
                  </Link>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {visitadoEm.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Verify no zinc/slate classes remain**

Run: `grep "zinc\|slate" "apps/web/app/(private)/minha-conta/page.tsx"`
Expected: no output

- [ ] **Step 3: Run all tests, lint, and build**

Run: `cd apps/web && npm run test && npm run lint && npm run build`
Expected: All pass

- [ ] **Step 4: Commit**

```bash
git add "apps/web/app/(private)/minha-conta/page.tsx"
git commit -m "feat(ds-6): redesenha Minha Conta com Carimbo badges e tokens warm earthy

Favoritos com Carimbo xs mostarda. Visitados renomeado para 'Butecos que
você conheceu' com Carimbo xs tinto + data em font-mono. Estados vazios
com copy botequeiro e CTA para /butecos. Remove zinc/slate.

Refs #88-6"
```

---

## PR Checklist (run before opening each PR)

```bash
cd apps/web
npm run test    # all pass
npm run lint    # no errors
npm run build   # succeeds
```

Confirm no old classes remain in changed files:
```bash
grep -r "zinc\|slate\|geist" apps/web/app --include="*.tsx" --include="*.css"
```
Expected: files not touched in this sub-issue may still appear; the ones you changed should show no matches.
