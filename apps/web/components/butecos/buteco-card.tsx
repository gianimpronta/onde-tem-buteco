"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Buteco = {
  nome: string;
  bairro: string | null;
  cidade: string;
  petiscoNome: string | null;
  fotoUrl: string | null;
  slug: string;
};

type ButecoCardProps = {
  buteco: Buteco;
  variant?: "photo" | "flat";
};

export function ButecoCard({ buteco, variant }: ButecoCardProps) {
  const [imageError, setImageError] = useState(false);
  const resolvedVariant = variant ?? (buteco.fotoUrl && !imageError ? "photo" : "flat");

  if (resolvedVariant === "photo" && buteco.fotoUrl && !imageError) {
    return (
      <Link
        href={`/butecos/${buteco.slug}`}
        className="block overflow-hidden rounded-[14px] border border-line-soft bg-surface shadow-warm-sm transition hover:-translate-y-0.5 hover:shadow-warm"
      >
        <div className="relative aspect-[4/2.6] w-full overflow-hidden">
          <Image
            src={buteco.fotoUrl}
            alt={buteco.nome}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImageError(true)}
          />
        </div>
        <div className="p-4">
          <p className="font-body text-[12px] font-medium uppercase tracking-wide text-ink-muted">
            {buteco.bairro ? `${buteco.bairro} · ` : ""}
            {buteco.cidade}
          </p>
          <h2 className="mt-1 font-display text-[18px] font-semibold leading-tight text-ink">
            {buteco.nome}
          </h2>
          {buteco.petiscoNome && (
            <p className="mt-2 font-display text-[14px] font-medium text-brand">
              {buteco.petiscoNome}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/butecos/${buteco.slug}`}
      className="relative block overflow-hidden rounded-[14px] border border-mostarda-300 bg-mostarda-100 transition hover:-translate-y-0.5 dark:border-line dark:bg-surface"
    >
      <div className="grao absolute inset-0" aria-hidden />
      <div className="relative p-5">
        <p className="font-mono text-[11px] uppercase tracking-wide text-mostarda-700 dark:text-accent">
          {buteco.bairro ? `${buteco.bairro} · ` : ""}
          {buteco.cidade}
        </p>
        <h2 className="mt-2 font-display text-[30px] font-bold leading-none text-brand">
          {buteco.nome}
        </h2>
        {buteco.petiscoNome && (
          <p className="mt-3 font-body text-[14px] text-breu-800 dark:text-ink-soft">
            {buteco.petiscoNome}
          </p>
        )}
      </div>
    </Link>
  );
}
