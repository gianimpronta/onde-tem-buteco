import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Carimbo } from "@/components/ui/carimbo";

export default async function MinhaContaPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      favoritos: { include: { buteco: true }, orderBy: { createdAt: "desc" } },
      visitas: { include: { buteco: true }, orderBy: { visitadoEm: "desc" } },
    },
  });

  if (!user) redirect("/login");

  return (
    <main className="mx-auto max-w-2xl space-y-10 px-4 py-8">
      <h1 className="font-display text-[28px] font-bold text-ink">Minha Conta</h1>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold text-ink">Favoritos</h2>
        {user.favoritos.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-[14px] text-ink-muted">
              Nenhum favorito ainda — bora explorar?
            </p>
            <Link
              href="/butecos"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Ver botecos
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {user.favoritos.map(({ buteco }) => (
              <li key={buteco.slug} className="flex items-center gap-3">
                <Carimbo
                  nome={buteco.nome}
                  bairro={buteco.bairro ?? undefined}
                  size="xs"
                  color="mostarda"
                />
                <div>
                  <Link
                    href={`/butecos/${buteco.slug}`}
                    className="font-body font-medium text-ink transition hover:text-primary"
                  >
                    {buteco.nome}
                  </Link>
                  <p className="font-mono text-[11px] text-ink-muted">{buteco.cidade}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold text-ink">
          Butecos que você conheceu
        </h2>
        {user.visitas.length === 0 ? (
          <div className="text-center">
            <p className="font-body text-[14px] text-ink-muted">
              Nenhum carimbo ainda — bora conhecer um buteco?
            </p>
            <Link
              href="/butecos"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[13px] font-medium text-primary-ink transition hover:bg-terracota-600"
            >
              Ver botecos
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {user.visitas.map(({ buteco, visitadoEm }) => (
              <li key={buteco.slug} className="flex items-center gap-3">
                <Carimbo
                  nome={buteco.nome}
                  bairro={buteco.bairro ?? undefined}
                  size="xs"
                  color="tinto"
                />
                <div>
                  <Link
                    href={`/butecos/${buteco.slug}`}
                    className="font-body font-medium text-ink transition hover:text-primary"
                  >
                    {buteco.nome}
                  </Link>
                  <p className="font-mono text-[11px] text-ink-muted">
                    {visitadoEm.toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
