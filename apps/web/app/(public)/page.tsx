import { prisma } from "@/lib/prisma";

export default async function Home() {
  const total = await prisma.buteco.count();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-4xl font-bold">Onde Tem Buteco</h1>
      <p className="text-zinc-500">
        {total > 0
          ? `${total} botecos participando`
          : "Em breve: todos os botecos do Comida di Buteco no mapa"}
      </p>
      <a
        href="/butecos"
        className="px-6 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
      >
        Ver botecos
      </a>
    </main>
  );
}
