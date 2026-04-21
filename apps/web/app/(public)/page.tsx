import { MapaButecosShell } from "@/components/mapa/mapa-butecos-shell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type ButecoComCoordenada = {
  slug: string;
  nome: string;
  bairro: string | null;
  lat: number;
  lng: number;
};

async function getHomeData(): Promise<{ total: number; butecosComMapa: ButecoComCoordenada[] }> {
  try {
    const [total, butecos] = await Promise.all([
      prisma.buteco.count(),
      prisma.buteco.findMany({
        where: {
          lat: { not: null },
          lng: { not: null },
        },
        orderBy: { nome: "asc" },
        select: {
          slug: true,
          nome: true,
          bairro: true,
          lat: true,
          lng: true,
        },
      }),
    ]);

    const butecosComMapa = butecos.flatMap((buteco) => {
      if (buteco.lat === null || buteco.lng === null) {
        return [];
      }

      return [{ ...buteco, lat: buteco.lat, lng: buteco.lng }];
    });

    return { total, butecosComMapa };
  } catch {
    return { total: 0, butecosComMapa: [] };
  }
}

export default async function Home() {
  const { total, butecosComMapa } = await getHomeData();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-3xl font-black leading-tight tracking-tight text-zinc-900 sm:text-4xl">
          Descubra os botecos no mapa
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
          Explore os participantes do Comida di Buteco, filtre por região e encontre seu próximo
          destino.
        </p>

        <div className="mt-5 inline-flex items-center rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-800">
          {total > 0 ? `${total} botecos participando` : "Em breve: botecos participantes no mapa"}
        </div>
      </section>

      <section aria-label="Mapa de botecos" className="pb-6">
        <MapaButecosShell butecos={butecosComMapa} />
      </section>
    </main>
  );
}
