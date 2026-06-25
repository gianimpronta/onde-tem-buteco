import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Carimbo } from "@/components/ui/carimbo";
import { buttonClassName } from "@/components/ui/button";
import {
  E2E_AUTH_COOKIE,
  E2E_FAVORITOS_COOKIE,
  E2E_VISITAS_COOKIE,
  parseE2ECookieList,
} from "@/lib/e2e-fixture-cookies";
import { isE2EFixtureMode, listE2EFixtureButecosByIds } from "@/lib/public-butecos";

type MinhaContaButeco = {
  nome: string;
  slug: string;
  cidade: string;
  bairro: string | null;
};

type FavoritoItem = {
  createdAt: Date;
  buteco: MinhaContaButeco;
};

type VisitaItem = {
  visitadoEm: Date;
  buteco: MinhaContaButeco;
};

type AccountSectionItem = {
  buteco: MinhaContaButeco;
  color: "tinto" | "mostarda";
  metadata: string;
};

type MinhaContaUser = {
  name: string | null;
  favoritos: FavoritoItem[];
  visitas: VisitaItem[];
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
});

function formatLocalidade(buteco: MinhaContaButeco) {
  return [buteco.bairro, buteco.cidade].filter(Boolean).join(", ");
}

function formatFavoritos(count: number) {
  return `${count} ${count === 1 ? "favorito" : "favoritos"}`;
}

function formatVisitados(count: number) {
  return `${count} ${count === 1 ? "visitado" : "visitados"}`;
}

async function getFixtureUser(): Promise<MinhaContaUser> {
  const cookieStore = await cookies();

  if (cookieStore.get(E2E_AUTH_COOKIE)?.value !== "authenticated") {
    redirect("/login");
  }

  const favoritosIds = parseE2ECookieList(cookieStore.get(E2E_FAVORITOS_COOKIE)?.value);
  const visitasIds = parseE2ECookieList(cookieStore.get(E2E_VISITAS_COOKIE)?.value);
  const favoritos = listE2EFixtureButecosByIds(favoritosIds).map((buteco, index) => ({
    buteco,
    createdAt: new Date(Date.UTC(2026, 0, index + 1, 12)),
  }));
  const visitas = listE2EFixtureButecosByIds(visitasIds).map((buteco, index) => ({
    buteco,
    visitadoEm: new Date(Date.UTC(2026, 1, index + 1, 12)),
  }));

  return {
    name: "Visitante",
    favoritos,
    visitas,
  };
}

async function getPersistedUser(): Promise<MinhaContaUser | null> {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favoritos: { include: { buteco: true }, orderBy: { createdAt: "desc" } },
      visitas: { include: { buteco: true }, orderBy: { visitadoEm: "desc" } },
    },
  });

  if (!user) {
    return null;
  }

  return {
    name: user.name,
    favoritos: user.favoritos,
    visitas: user.visitas,
  };
}

export default async function MinhaContaPage() {
  const user = isE2EFixtureMode() ? await getFixtureUser() : await getPersistedUser();

  if (!user) redirect("/login");

  const nome = user.name ?? "buteco lover";
  const favoritos = user.favoritos;
  const visitas = user.visitas;
  const favoritosItems = favoritos.map(({ buteco, createdAt }) => ({
    buteco,
    color: "mostarda" as const,
    metadata: `Favoritado em ${dateFormatter.format(createdAt)}`,
  }));
  const visitasItems = visitas.map(({ buteco, visitadoEm }) => ({
    buteco,
    color: "tinto" as const,
    metadata: `Visitado em ${dateFormatter.format(visitadoEm)}`,
  }));

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 pb-24">
      <header className="space-y-5">
        <div className="space-y-2">
          <p className="font-body text-[14px] font-medium text-brand">Olá, {nome}</p>
          <h1 className="font-display text-[32px] font-bold leading-tight text-ink">Minha Conta</h1>
          <p className="max-w-2xl font-body text-[15px] leading-relaxed text-ink-soft">
            Acompanhe os butecos que você salvou, relembre os carimbos do rolê e volte rápido para
            descobrir o próximo endereço.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/butecos" className={buttonClassName({ variant: "primary", size: "sm" })}>
            Explorar butecos
          </Link>
          <Link href="/" className={buttonClassName({ variant: "secondary", size: "sm" })}>
            Abrir mapa
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ResumoItem label="Favoritos salvos" value={formatFavoritos(favoritos.length)} />
          <ResumoItem label="Carimbos registrados" value={formatVisitados(visitas.length)} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccountButecosSection
          title="Favoritos"
          description="Butecos guardados para visitar, comparar ou transformar em roteiro."
          emptyTitle="Sua lista de favoritos está vazia"
          emptyDescription="Comece salvando os butecos que parecem bons para o seu roteiro."
          items={favoritosItems}
        />

        <AccountButecosSection
          title="Butecos que você conheceu"
          description="Histórico dos lugares que já ganharam seu carimbo no concurso."
          emptyTitle="Você ainda não marcou nenhum buteco como visitado"
          emptyDescription="Use o mapa para escolher o próximo carimbo do rolê."
          items={visitasItems}
        />
      </div>
    </main>
  );
}

function ResumoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-line-soft bg-surface-alt p-4">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-[24px] font-bold text-ink">{value}</p>
    </div>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-display text-[20px] font-semibold text-ink">{title}</h2>
      <p className="mt-1 font-body text-[14px] leading-relaxed text-ink-soft">{description}</p>
    </div>
  );
}

function AccountButecosSection({
  title,
  description,
  emptyTitle,
  emptyDescription,
  items,
}: {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  items: AccountSectionItem[];
}) {
  return (
    <section className="rounded-[14px] border border-line-soft bg-surface-alt p-5 shadow-warm-sm">
      <SectionHeader title={title} description={description} />
      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          href="/butecos"
          action="Encontrar butecos"
        />
      ) : (
        <ul className="mt-5 space-y-3">
          {items.map(({ buteco, color, metadata }) => (
            <ButecoAccountItem
              key={buteco.slug}
              buteco={buteco}
              color={color}
              metadata={metadata}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="mt-5 rounded-[12px] border border-dashed border-line bg-surface px-4 py-5">
      <p className="font-display text-[18px] font-semibold text-ink">{title}</p>
      <p className="mt-2 font-body text-[14px] leading-relaxed text-ink-soft">{description}</p>
      <Link href={href} className={`mt-4 ${buttonClassName({ variant: "primary", size: "sm" })}`}>
        {action}
      </Link>
    </div>
  );
}

function ButecoAccountItem({
  buteco,
  color,
  metadata,
}: {
  buteco: MinhaContaButeco;
  color: "tinto" | "mostarda";
  metadata: string;
}) {
  return (
    <li className="flex gap-3 rounded-[12px] border border-line-soft bg-surface p-3">
      <div className="shrink-0 pt-1">
        <Carimbo nome={buteco.nome} bairro={buteco.bairro ?? undefined} size="xs" color={color} />
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/butecos/${buteco.slug}`}
          className="font-body text-[15px] font-semibold text-ink transition hover:text-primary"
        >
          {buteco.nome}
        </Link>
        <p className="mt-1 font-body text-[13px] text-ink-soft">{formatLocalidade(buteco)}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-ink-muted">
          {metadata}
        </p>
      </div>
    </li>
  );
}
