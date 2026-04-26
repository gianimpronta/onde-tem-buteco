import Link from "next/link";
import { Suspense } from "react";
import { ButecosFilterForm } from "@/components/butecos/filter-form";
import { ButecoCard } from "@/components/butecos/buteco-card";
import { buttonClassName } from "@/components/ui/button";
import { countActiveButecoFilters, normalizeButecoFilters } from "@/lib/buteco-filters";
import { getButecosPageData } from "@/lib/public-butecos";

export default async function ButecosPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ cidade?: string; bairro?: string; q?: string }> }>) {
  const filters = normalizeButecoFilters(await searchParams);
  const {
    cidades: cidadeOptions,
    bairros: bairroOptions,
    butecos,
  } = await getButecosPageData(filters);

  const activeFiltersCount = countActiveButecoFilters(filters);
  const activeFiltersSuffix = activeFiltersCount === 1 ? "" : "s";
  const activeFiltersLabel =
    activeFiltersCount > 0 ? ` com ${activeFiltersCount} filtro${activeFiltersSuffix}` : "";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section className="rounded-3xl border border-line-soft bg-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
              Explorar botecos
            </p>
            <h1 className="mt-1 font-display text-[32px] font-bold tracking-tight text-ink">
              Botecos
            </h1>
            <p className="mt-2 max-w-2xl font-body text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
              Refine a lista por cidade, bairro ou busca textual para encontrar um petisco ou boteco
              com mais rapidez.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-surface-alt px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
            {butecos.length} resultado{butecos.length === 1 ? "" : "s"}
            {activeFiltersLabel}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-line-soft bg-surface p-6">
        <Suspense>
          <ButecosFilterForm cidadeOptions={cidadeOptions} bairroOptions={bairroOptions} />
        </Suspense>

        {filters.cidade && bairroOptions.length === 0 ? (
          <p className="mt-4 font-body text-[14px] text-ink-muted">
            Ainda não existem bairros cadastrados para a cidade selecionada.
          </p>
        ) : null}
      </section>

      {butecos.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-line bg-surface-alt px-6 py-12 text-center">
          <h2 className="font-display text-[22px] font-bold text-ink">
            Nenhum buteco encontrado por aqui
          </h2>
          <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-soft">
            Tente outro bairro ou limpa os filtros.
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/butecos" className={buttonClassName({ variant: "primary", size: "sm" })}>
              Limpar filtros
            </Link>
            <Link href="/" className={buttonClassName({ variant: "secondary", size: "sm" })}>
              Voltar para a home
            </Link>
          </div>
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {butecos.map((b) => (
            <li key={b.slug}>
              <ButecoCard buteco={b} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
