import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ButecoPage({
  params,
}: Readonly<{ params: Promise<{ slug: string }> }>) {
  const { slug } = await params;

  const buteco = await prisma.buteco.findUnique({
    where: { slug },
  });

  if (!buteco) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/butecos"
        className="text-sm text-zinc-500 hover:underline mb-4 block dark:text-zinc-400"
      >
        ← Voltar
      </Link>
      {buteco.fotoUrl && (
        <Image
          src={buteco.fotoUrl}
          alt={buteco.nome}
          width={800}
          height={224}
          className="w-full h-56 object-cover rounded-xl mb-6"
        />
      )}
      <h1 className="text-3xl font-bold dark:text-zinc-50">{buteco.nome}</h1>
      <p className="text-zinc-500 mt-1 dark:text-zinc-400">
        {buteco.bairro ? `${buteco.bairro}, ` : ""}
        {buteco.cidade}
      </p>
      {buteco.petiscoNome && (
        <div className="mt-6">
          <h2 className="font-semibold text-amber-600 dark:text-amber-400">{buteco.petiscoNome}</h2>
          {buteco.petiscoDesc && (
            <p className="text-zinc-600 mt-1 dark:text-zinc-400">{buteco.petiscoDesc}</p>
          )}
        </div>
      )}
      <div className="mt-6 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
        {buteco.endereco && <p>{buteco.endereco}</p>}
        {buteco.telefone && <p>{buteco.telefone}</p>}
        {buteco.horario && <p>{buteco.horario}</p>}
      </div>
    </main>
  );
}
