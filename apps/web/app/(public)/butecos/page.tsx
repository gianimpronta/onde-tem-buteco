import Link from "next/link";
import {
  buildButecoWhere,
  countActiveButecoFilters,
  normalizeButecoFilters,
} from "@/lib/buteco-filters";
import { prisma } from "@/lib/prisma";

export default async function ButecosPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }> }>) {
  const filters = normalizeButecoFilters(await searchParams);

  const [cidades, bairros, butecos] = await Promise.all([
    prisma.buteco.findMany({
      select: { cidade: true },
      distinct: ["cidade"],
      orderBy: { cidade: "asc" },
    }),
    prisma.buteco.findMany({
      where: {
        bairro: { not: null },
        ...(filters.cidade ? { cidade: filters.cidade } : {}),
      },
      select: { bairro: true },
      distinct: ["bairro"],
      orderBy: { bairro: "asc" },
    }),
    prisma.buteco.findMany({
      where: buildButecoWhere(filters),
      orderBy: { nome: "asc" },
      select: {
        slug: true,
        nome: true,
        cidade: true,
        bairro: true,
        petiscoNome: true,
      },
    }),
  ]);

  const activeFiltersCount = countActiveButecoFilters(filters);
  const cidadeOptions = cidades.map(({ cidade }) => cidade);
  const bairroOptions = bairros.flatMap(({ bairro }) => (bairro ? [bairro] : []));
  const activeFiltersSuffix = activeFiltersCount === 1 ? "" : "s";
  const activeFiltersLabel =
    activeFiltersCount > 0 ? ` com ${activeFiltersCount} filtro${activeFiltersSuffix}` : "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Explorar botecos
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">Botecos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Refine a lista por cidade, bairro ou busca textual para encontrar um petisco ou boteco
              com mais rapidez.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700">
            {butecos.length} resultado{butecos.length === 1 ? "" : "s"}
            {activeFiltersLabel}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end">
          <label className="flex min-w-0 flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <span className="text-sm font-semibold text-zinc-800">Buscar</span>
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Nome do buteco ou petisco"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-800">Cidade</span>
            <select
              name="cidade"
              defaultValue={filters.cidade ?? ""}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400"
            >
              <option value="">Todas as cidades</option>
              {cidadeOptions.map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-2">
            <span className="text-sm font-semibold text-zinc-800">Bairro</span>
            <select
              name="bairro"
              defaultValue={filters.bairro ?? ""}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
              disabled={bairroOptions.length === 0}
            >
              <option value="">Todos os bairros</option>
              {bairroOptions.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Aplicar filtros
          </button>

          <Link
            href="/butecos"
            className="rounded-2xl border border-zinc-200 px-5 py-3 text-center text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50"
          >
            Limpar
          </Link>
        </form>

        {filters.cidade && bairroOptions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            Ainda nÃ£o existem bairros cadastrados para a cidade selecionada.
          </p>
        ) : null}
      </section>

      {butecos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-zinc-900">Nenhum boteco encontrado</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Tente ajustar os filtros ou limpar a busca para ver mais participantes.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/butecos"
              className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
            >
              Limpar filtros
            </Link>
            <Link
              href="/"
              className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              Voltar para a home
            </Link>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {butecos.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/butecos/${b.slug}`}
                className="block rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400"
              >
                <p className="text-lg font-bold text-zinc-900">{b.nome}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {b.bairro ? `${b.bairro}, ` : ""}
                  {b.cidade}
                </p>
                {b.petiscoNome ? (
                  <p className="mt-3 text-sm font-medium text-amber-700">{b.petiscoNome}</p>
                ) : (
                  <p className="mt-3 text-sm text-zinc-400">Petisco ainda nÃ£o informado</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
