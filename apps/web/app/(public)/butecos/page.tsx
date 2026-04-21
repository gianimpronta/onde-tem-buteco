import Link from "next/link";
import { Suspense } from "react";
import {
  buildButecoWhere,
  countActiveButecoFilters,
  normalizeButecoFilters,
} from "@/lib/buteco-filters";
import { ButecosFilterForm } from "@/components/butecos/filter-form";
import { prisma } from "@/lib/prisma";
import { ButecosFilterForm } from "@/components/butecos/filter-form";

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
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Explorar botecos
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Botecos</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-base">
              Refine a lista por cidade, bairro ou busca textual para encontrar um petisco ou boteco
              com mais rapidez.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {butecos.length} resultado{butecos.length === 1 ? "" : "s"}
            {activeFiltersLabel}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Suspense>
          <ButecosFilterForm cidadeOptions={cidadeOptions} bairroOptions={bairroOptions} />
        </Suspense>

        {filters.cidade && bairroOptions.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Ainda não existem bairros cadastrados para a cidade selecionada.
          </p>
        ) : null}
      </section>

      {butecos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Nenhum boteco encontrado</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
              className="rounded-full border border-zinc-200 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/20"
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
                className="block rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-amber-500"
              >
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{b.nome}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {b.bairro ? `${b.bairro}, ` : ""}
                  {b.cidade}
                </p>
                {b.petiscoNome ? (
                  <p className="mt-3 text-sm font-medium text-amber-700 dark:text-amber-400">{b.petiscoNome}</p>
                ) : (
                  <p className="mt-3 text-sm text-zinc-400 dark:text-zinc-500">Petisco ainda não informado</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
