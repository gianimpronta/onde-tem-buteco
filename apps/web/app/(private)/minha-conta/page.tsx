import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold dark:text-zinc-50">Minha Conta</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-zinc-100">Favoritos</h2>
        {user.favoritos.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">Nenhum favorito ainda.</p>
        ) : (
          <ul className="space-y-2">
            {user.favoritos.map(({ buteco }) => (
              <li key={buteco.slug}>
                <a
                  href={`/butecos/${buteco.slug}`}
                  className="font-medium hover:underline dark:text-zinc-200"
                >
                  {buteco.nome}
                </a>
                <span className="text-zinc-500 text-sm ml-2 dark:text-zinc-400">
                  {buteco.cidade}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 dark:text-zinc-100">Visitados</h2>
        {user.visitas.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">Nenhuma visita registrada.</p>
        ) : (
          <ul className="space-y-2">
            {user.visitas.map(({ buteco, visitadoEm }) => (
              <li key={buteco.slug}>
                <a
                  href={`/butecos/${buteco.slug}`}
                  className="font-medium hover:underline dark:text-zinc-200"
                >
                  {buteco.nome}
                </a>
                <span className="text-zinc-500 text-sm ml-2 dark:text-zinc-400">
                  {visitadoEm.toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
