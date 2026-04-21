"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

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
        <span className="text-sm font-semibold text-zinc-800">Buscar</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Nome do buteco ou petisco"
          className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400"
        />
      </label>

      <label className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-zinc-800">Cidade</span>
        <select
          name="cidade"
          value={cidade}
          onChange={onCidadeChange}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400"
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
        <span className="text-sm font-semibold text-zinc-800">Bairro</span>
        <select
          key={cidade}
          name="bairro"
          defaultValue={bairro}
          disabled={bairroOptions.length === 0}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
        >
          <option value="">Todos os bairros</option>
          {bairroOptions.map((b) => (
            <option key={b} value={b}>
              {b}
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
  );
}
