import { NextResponse } from "next/server";
import { isValidAction } from "@/lib/buteco-actions";
import { auth } from "@/lib/auth";
import { E2E_AUTH_COOKIE, E2E_FAVORITOS_COOKIE, E2E_VISITAS_COOKIE } from "@/lib/detail-actions";
import { prisma } from "@/lib/prisma";
import { isE2EFixtureMode } from "@/lib/public-butecos";

function parseCookieHeader(cookieHeader: string | null): Map<string, string> {
  const cookies = new Map<string, string>();

  if (!cookieHeader) {
    return cookies;
  }

  for (const segment of cookieHeader.split(";")) {
    const [name, ...valueParts] = segment.trim().split("=");

    if (!name) {
      continue;
    }

    cookies.set(name, valueParts.join("="));
  }

  return cookies;
}

function parseCookieList(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return [];
  }

  const candidates = [rawValue];

  try {
    candidates.push(decodeURIComponent(rawValue));
  } catch {}

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {}
  }

  return [];
}

function toCookieValue(values: string[]): string {
  return encodeURIComponent(JSON.stringify(values));
}

async function parseActionRequest(request: Request): Promise<{
  butecoId: string;
  action: string;
} | null> {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    const { butecoId, action } = body as Record<string, unknown>;

    return {
      butecoId: typeof butecoId === "string" ? butecoId : "",
      action: typeof action === "string" ? action : "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (isE2EFixtureMode()) {
    const requestCookies = parseCookieHeader(request.headers.get("cookie"));

    if (requestCookies.get(E2E_AUTH_COOKIE) !== "authenticated") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await parseActionRequest(request);

    if (!body) {
      return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
    }

    const { butecoId, action } = body;

    if (!isValidAction(action)) {
      return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
    }

    if (!butecoId.trim()) {
      return NextResponse.json({ error: "Buteco inválido" }, { status: 400 });
    }

    const favoritos = parseCookieList(requestCookies.get(E2E_FAVORITOS_COOKIE));
    const visitas = parseCookieList(requestCookies.get(E2E_VISITAS_COOKIE));

    const nextFavoritos = new Set(favoritos);
    const nextVisitas = new Set(visitas);

    if (action === "favoritar") {
      nextFavoritos.add(butecoId);
    } else if (action === "desfavoritar") {
      nextFavoritos.delete(butecoId);
    } else if (action === "visitar") {
      nextVisitas.add(butecoId);
    }

    const response = NextResponse.json({
      ok: true,
      isFavorito: nextFavoritos.has(butecoId),
      isVisitado: nextVisitas.has(butecoId),
    });

    response.cookies.set(E2E_FAVORITOS_COOKIE, toCookieValue([...nextFavoritos]), { path: "/" });
    response.cookies.set(E2E_VISITAS_COOKIE, toCookieValue([...nextVisitas]), { path: "/" });

    return response;
  }

  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await parseActionRequest(request);

  if (!body) {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { butecoId, action } = body;

  if (!isValidAction(action)) {
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  }

  if (!butecoId.trim()) {
    return NextResponse.json({ error: "Buteco inválido" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  let isFavorito = false;
  let isVisitado = false;

  if (action === "favoritar") {
    await prisma.favorito.upsert({
      where: { userId_butecoId: { userId: user.id, butecoId } },
      update: {},
      create: { userId: user.id, butecoId },
    });
    isFavorito = true;
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
    isVisitado = true;
  }

  return NextResponse.json({ ok: true, isFavorito, isVisitado });
}
