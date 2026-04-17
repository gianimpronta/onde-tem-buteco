import dynamicImport from "next/dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MapaButecos = dynamicImport(
  () => import("@/components/mapa/mapa-butecos").then((module) => module.MapaButecos),
  {
    ssr: false,
  }
);

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-6 sm:py-8 lg:px-8">
      <header className="rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Comida di Buteco
            </p>
            <p className="text-2xl font-black tracking-tight text-zinc-900">Onde Tem Buteco</p>
          </div>

          <nav className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Link
              href="/butecos"
              className="rounded-full border border-zinc-200 px-4 py-2 text-center text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Ver botecos
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

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
        <MapaButecos butecos={butecosComMapa} />
      </section>
    </main>
  );
}
