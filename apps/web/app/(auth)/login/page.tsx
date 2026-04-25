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
