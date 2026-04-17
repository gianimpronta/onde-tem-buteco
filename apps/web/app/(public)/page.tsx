import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapaButecos } from "@/components/mapa/mapa-butecos";

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3">
        <p className="text-lg font-bold">Onde Tem Buteco</p>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/butecos" className="rounded-full px-4 py-2 text-zinc-700 hover:bg-zinc-100">
            Botecos
          </Link>
          <Link href="/login" className="rounded-full bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
            Login
          </Link>
        </nav>
      </header>

      <section className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Descubra os botecos no mapa</h1>
        <p className="text-zinc-600">
          Explore os participantes do Comida di Buteco, filtre por região e encontre seu próximo destino.
        </p>
        <p className="text-sm font-medium text-amber-700">
          {total > 0 ? `${total} botecos participando` : "Em breve: botecos participantes no mapa"}
        </p>
      </section>

      <section aria-label="Mapa de botecos">
        <MapaButecos butecos={butecosComMapa} />
      </section>
    </main>
  );
}
