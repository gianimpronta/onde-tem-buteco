# Login Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesenhar a rota `/login` para uma tela de card unico, quente e orientada a utilidade da conta, sem alterar o fluxo existente de autenticacao com Google.

**Architecture:** A implementacao fica concentrada em `apps/web/app/(auth)/login/page.tsx`, mantendo a action server-side atual e substituindo apenas a composicao visual e a hierarquia de conteudo. O layout sera construído com Tailwind, com fundo em gradiente, contexto curto acima do card, dois beneficios compactos, CTA dominante e comportamento responsivo mobile-first.

**Tech Stack:** Next.js App Router, React Server Components, TypeScript, Tailwind CSS, NextAuth sign-in server action

---

## File Structure

- Modify: `apps/web/app/(auth)/login/page.tsx`
  - Responsabilidade: renderizar a pagina de login com novo layout, novo conteudo e CTA principal sem alterar a logica de autenticacao.
- Verify visually: `apps/web/app/(auth)/login/page.tsx`
  - Responsabilidade: confirmar semantica simples, hierarquia do CTA e responsividade.

### Task 1: Rewrite the Login Page Markup

**Files:**
- Modify: `apps/web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Replace the minimal centered layout with the approved single-card structure**

```tsx
import { signIn } from "@/lib/auth";

const loginBenefits = [
  {
    title: "Favoritos",
    description: "Guarde os butecos que entraram na sua lista.",
  },
  {
    title: "Visitas",
    description: "Registre os lugares que voce ja conheceu.",
  },
] as const;

const loginSupportCards = [
  {
    title: "Roteiro salvo",
    description: "Retome sua selecao de bares sem comecar do zero.",
  },
  {
    title: "Conta util",
    description: "O login existe para organizar sua experiencia, nao para atrapalhar.",
  },
  {
    title: "Pronto para mobile",
    description: "A estrutura centralizada funciona bem em telas menores.",
  },
] as const;

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#140b07_0%,#3b1d10_42%,#7e3f18_76%,#d97706_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(251,191,36,0.14),transparent_20%),radial-gradient(circle_at_85%_15%,rgba(249,115,22,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(217,119,6,0.26),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2.5rem] border border-white/10 bg-white/5 shadow-[0_28px_90px_rgba(14,8,5,0.42)] backdrop-blur-xl">
          <section className="px-6 pb-4 pt-8 text-center sm:px-8 sm:pt-10">
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100/90">
              Conta Onde Tem Buteco
            </span>

            <h1 className="mx-auto mt-5 max-w-[12ch] text-4xl font-black leading-[0.95] tracking-[-0.04em] text-amber-50 sm:text-5xl">
              Entre e continue seu mapa de botecos.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-amber-50/85 sm:text-base">
              Salve favoritos, acompanhe visitas e deixe seu proximo roteiro pronto para
              quando bater a vontade de sair.
            </p>
          </section>

          <section className="px-3 pb-3 sm:px-4">
            <div className="mx-auto w-full max-w-[29rem] rounded-[2rem] bg-[#fff8f1]/95 p-6 text-zinc-950 shadow-[0_26px_60px_rgba(20,11,7,0.24)] sm:p-8">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#fbbf24,#f97316)] text-lg font-black tracking-[-0.04em] text-[#361708]">
                OTB
              </div>

              <div className="mt-5 text-center text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#ad5317]">
                Entrar
              </div>

              <h2 className="mt-3 text-center text-3xl font-black leading-none tracking-[-0.04em] text-[#2c1409]">
                Acesse sua conta
              </h2>

              <p className="mx-auto mt-3 max-w-[34ch] text-center text-sm leading-6 text-[#7b5036] sm:text-[0.95rem]">
                Use o Google para sincronizar seu historico e manter seus butecos sempre por perto.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {loginBenefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.25rem] border border-[#f1d7c0] bg-[#fffdf9] p-4 text-left"
                  >
                    <h3 className="text-sm font-bold text-[#2c1409]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#7b5036]">{item.description}</p>
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
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#f59e0b,#f97316)] px-6 text-base font-extrabold text-[#2d1408] shadow-[0_18px_30px_rgba(245,158,11,0.28)] transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff8f1]"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-black text-[#341708]">
                    G
                  </span>
                  Entrar com Google
                </button>
              </form>

              <p className="mt-4 text-center text-sm text-[#8d6042]">
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
                <h3 className="text-sm font-bold text-amber-50">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-amber-50/80">{item.description}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify the file keeps server-side auth behavior intact**

Run:

```powershell
Get-Content 'apps/web/app/(auth)/login/page.tsx'
```

Expected:
- The file still imports `signIn` from `@/lib/auth`
- The form still uses `action={async () => { "use server"; await signIn("google"); }}`
- No client component directive is introduced

- [ ] **Step 3: Commit the markup rewrite**

```bash
git add apps/web/app/(auth)/login/page.tsx
git commit -m "feat: redesign login page"
```

### Task 2: Validate Hierarchy and Responsiveness

**Files:**
- Verify: `apps/web/app/(auth)/login/page.tsx`

- [ ] **Step 1: Check the CTA remains visually dominant in the final markup**

Inspect these details in `apps/web/app/(auth)/login/page.tsx`:

```tsx
className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full ..."
className="mx-auto mt-5 max-w-[12ch] text-4xl font-black ..."
className="mt-6 grid gap-3 sm:grid-cols-2"
```

Expected:
- The button is full width inside the card
- The heading is prominent but secondary to the button's action role
- The benefit cards stay compact and do not outgrow the CTA

- [ ] **Step 2: Check the mobile-first layout constraints**

Inspect these details in `apps/web/app/(auth)/login/page.tsx`:

```tsx
className="relative min-h-screen ... px-4 py-8 sm:px-6 lg:px-8"
className="mx-auto w-full max-w-[29rem] ..."
className="grid gap-3 sm:grid-cols-2"
className="grid gap-3 ... lg:grid-cols-3"
```

Expected:
- Single-column flow by default
- Benefits only split into two columns from `sm` upward
- Support cards remain stacked until larger screens
- Card width stays controlled on desktop

- [ ] **Step 3: Run lint for the touched file's project**

Run:

```powershell
npm run lint --workspace apps/web
```

Expected:
- Exit code `0`
- No lint errors for `app/(auth)/login/page.tsx`

- [ ] **Step 4: Start the web app and visually verify `/login`**

Run:

```powershell
npm run dev --workspace apps/web
```

Then open `/login` and verify:
- The page no longer looks empty or provisional
- The warm background has depth instead of flat black
- The single card is the focal point
- The Google CTA is the strongest visual action
- The page reads well on desktop and mobile widths

- [ ] **Step 5: Commit after validation if any polish was needed**

```bash
git add apps/web/app/(auth)/login/page.tsx
git commit -m "chore: polish login layout validation"
```

---

## Self-Review

- Spec coverage: the plan covers background, top context, main card, compact benefits, optional support cards, accessibility semantics, responsive behavior, and unchanged auth flow.
- Placeholder scan: no TBDs or deferred implementation markers remain.
- Type consistency: the plan keeps the page as a server component and reuses `signIn("google")` consistently.
