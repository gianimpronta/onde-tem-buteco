import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ButecoActionPanel from "@/components/butecos/buteco-action-panel";
import { ButecoDetailImage } from "@/components/butecos/buteco-detail-image";
import { getButecoActionState } from "@/lib/detail-actions";
import { getButecoBySlug } from "@/lib/public-butecos";

export async function generateMetadata({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>): Promise<Metadata> {
  const { slug } = await params;
  const buteco = await getButecoBySlug(slug);

  if (!buteco) {
    return {
      title: "Buteco não encontrado",
      description: "O buteco procurado não foi encontrado.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = buteco.petiscoNome
    ? `${buteco.petiscoNome} no ${buteco.nome}, em ${buteco.bairro ? `${buteco.bairro}, ` : ""}${buteco.cidade}.`
    : `${buteco.nome} em ${buteco.bairro ? `${buteco.bairro}, ` : ""}${buteco.cidade}.`;
  const url = `/butecos/${buteco.slug}`;

  return {
    title: buteco.nome,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: buteco.nome,
      description,
      url,
      type: "article",
      images: buteco.fotoUrl ? [{ url: buteco.fotoUrl, alt: buteco.nome }] : undefined,
    },
    twitter: {
      title: buteco.nome,
      description,
      card: buteco.fotoUrl ? "summary_large_image" : "summary",
      images: buteco.fotoUrl ? [buteco.fotoUrl] : undefined,
    },
  };
}

export default async function ButecoPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;

  const buteco = await getButecoBySlug(slug);

  if (!buteco) {
    notFound();
    return null;
  }

  const actionState = await getButecoActionState({
    butecoId: buteco.id,
    slug: buteco.slug,
  });

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/butecos"
        className="mb-6 block font-body text-[13px] text-ink-muted transition hover:text-ink"
      >
        ← Botecos
      </Link>

      {buteco.fotoUrl ? (
        <ButecoDetailImage src={buteco.fotoUrl} alt={buteco.nome} />
      ) : (
        <div className="mb-6 aspect-[4/2.6] w-full rounded-[14px] bg-terracota-100" />
      )}

      <h1 className="font-display text-[34px] font-bold leading-tight tracking-tight text-ink">
        {buteco.nome}
      </h1>
      <p className="mt-1 font-mono text-[13px] text-ink-muted">
        {buteco.bairro ? `${buteco.bairro} · ` : ""}
        {buteco.cidade}
      </p>

      {buteco.petiscoNome && (
        <div className="mt-6">
          <h2 className="font-display text-[20px] font-semibold text-tinto-700">
            {buteco.petiscoNome}
          </h2>
          {buteco.petiscoDesc && (
            <p className="mt-1 font-body text-[15px] leading-relaxed text-ink-soft">
              {buteco.petiscoDesc}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 space-y-1 font-mono text-[13px] text-ink-muted">
        {buteco.endereco && <p>{buteco.endereco}</p>}
        {buteco.telefone && <p>{buteco.telefone}</p>}
        {buteco.horario && <p>{buteco.horario}</p>}
      </div>

      <ButecoActionPanel
        butecoId={buteco.id}
        loginHref={actionState.loginHref}
        isAuthenticated={actionState.isAuthenticated}
        initialIsFavorito={actionState.isFavorito}
        initialIsVisitado={actionState.isVisitado}
      />
    </main>
  );
}
