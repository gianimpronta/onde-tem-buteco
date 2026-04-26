import Link from "next/link";
import { MapaButecosShell } from "@/components/mapa/mapa-butecos-shell";
import { buttonClassName } from "@/components/ui/button";
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
            <Link href="/butecos" className={buttonClassName({ variant: "primary" })}>
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
