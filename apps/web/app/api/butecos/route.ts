import { NextResponse } from "next/server";
import { isValidAction } from "@/lib/buteco-actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { butecoId, action } = (await request.json()) as {
    butecoId: string;
    action: string;
  };

  if (!isValidAction(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  if (action === "favoritar") {
    await prisma.favorito.upsert({
      where: { userId_butecoId: { userId: user.id, butecoId } },
      update: {},
      create: { userId: user.id, butecoId },
    });
  } else if (action === "desfavoritar") {
    await prisma.favorito.deleteMany({
      where: { userId: user.id, butecoId },
    });
  } else if (action === "visitar") {
    await prisma.visita.upsert({
      where: { userId_butecoId: { userId: user.id, butecoId } },
      update: {},
      create: { userId: user.id, butecoId },
    });
  }

  return NextResponse.json({ ok: true });
}
