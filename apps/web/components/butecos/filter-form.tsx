"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  cidadeOptions: string[];
  bairroOptions: string[];
};

export function ButecosFilterForm({ cidadeOptions, bairroOptions }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const cidade = searchParams.get("cidade") ?? "";
  const bairro = searchParams.get("bairro") ?? "";

  function onCidadeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    const newCidade = e.target.value;
    if (newCidade) params.set("cidade", newCidade);
    if (q) params.set("q", q);
    const query = params.toString();
    router.push(`/butecos${query ? `?${query}` : ""}`);
  }

  return (
    <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto] lg:items-end">
      <label className="flex min-w-0 flex-col gap-2 sm:col-span-2 lg:col-span-1">
        <span className="font-body text-[13px] font-semibold text-ink">Buscar</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Nome do buteco ou petisco"
          className="w-full rounded-full border border-line px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary"
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="font-body text-[13px] font-semibold text-ink">Cidade</span>
        <select
          name="cidade"
          value={cidade}
          onChange={onCidadeChange}
          className="w-full rounded-full border border-line bg-surface px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary"
        >
          <option value="">Todas as cidades</option>
          {cidadeOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="font-body text-[13px] font-semibold text-ink">Bairro</span>
        <select
          key={cidade}
          name="bairro"
          defaultValue={bairro}
          disabled={bairroOptions.length === 0}
          className="w-full rounded-full border border-line bg-surface px-4 py-2.5 font-body text-[14px] text-ink outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos os bairros</option>
          {bairroOptions.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>

      <Button type="submit" variant="primary" size="sm">
        Aplicar filtros
      </Button>

      <Link
        href="/butecos"
        className="inline-flex items-center justify-center rounded-full border border-tinto-700 px-4 py-2 text-[13px] font-medium text-tinto-700 transition hover:bg-terracota-100"
      >
        Limpar
      </Link>
    </form>
  );
}
