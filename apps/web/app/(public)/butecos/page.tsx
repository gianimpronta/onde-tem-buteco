import { prisma } from "@/lib/prisma";

export default async function ButecosPage({
  searchParams,
}: {
  searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }>;
}) {
  const { cidade, bairro, q } = await searchParams;

  const butecos = await prisma.buteco.findMany({
    where: {
      ...(cidade ? { cidade } : {}),
      ...(bairro ? { bairro } : {}),
      ...(q ? { nome: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { nome: "asc" },
    select: {
      slug: true,
      nome: true,
      cidade: true,
      bairro: true,
      petiscoNome: true,
      fotoUrl: true,
    },
  });

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Botecos</h1>
      {butecos.length === 0 ? (
        <p className="text-zinc-500">Nenhum buteco encontrado.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {butecos.map((b) => (
            <li key={b.slug}>
              <a
                href={`/butecos/${b.slug}`}
                className="block p-4 rounded-xl border border-zinc-200 hover:border-amber-400 transition-colors"
              >
                <p className="font-semibold">{b.nome}</p>
                <p className="text-sm text-zinc-500">
                  {b.bairro ? `${b.bairro}, ` : ""}
                  {b.cidade}
                </p>
                {b.petiscoNome && <p className="text-sm text-amber-600 mt-1">{b.petiscoNome}</p>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
