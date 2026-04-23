import { NextResponse } from "next/server";
import { isValidAction } from "@/lib/buteco-actions";
import { auth } from "@/lib/auth";
import { E2E_AUTH_COOKIE, E2E_FAVORITOS_COOKIE, E2E_VISITAS_COOKIE } from "@/lib/detail-actions";
import { prisma } from "@/lib/prisma";
import { isE2EFixtureMode } from "@/lib/public-butecos";

type ActionRequestBody = {
  butecoId: string;
  action: string;
};

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

function buildErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function parseActionRequest(request: Request): Promise<ActionRequestBody | null> {
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

function validateActionRequest(body: ActionRequestBody | null): ActionRequestBody | NextResponse {
  if (!body) {
    return buildErrorResponse("Requisição inválida", 400);
  }

  if (!isValidAction(body.action)) {
    return buildErrorResponse("Ação inválida", 400);
  }

  if (!body.butecoId.trim()) {
    return buildErrorResponse("Buteco inválido", 400);
  }

  return body;
}

function applyFixtureAction(
  action: string,
  butecoId: string,
  favoritos: string[],
  visitas: string[]
) {
  const nextFavoritos = new Set(favoritos);
  const nextVisitas = new Set(visitas);

  if (action === "favoritar") {
    nextFavoritos.add(butecoId);
  } else if (action === "desfavoritar") {
    nextFavoritos.delete(butecoId);
  } else if (action === "visitar") {
    nextVisitas.add(butecoId);
  }

  return {
    isFavorito: nextFavoritos.has(butecoId),
    isVisitado: nextVisitas.has(butecoId),
    favoritos: [...nextFavoritos],
    visitas: [...nextVisitas],
  };
}

function buildFixtureResponse(result: {
  isFavorito: boolean;
  isVisitado: boolean;
  favoritos: string[];
  visitas: string[];
}) {
  const response = NextResponse.json({
    ok: true,
    isFavorito: result.isFavorito,
    isVisitado: result.isVisitado,
  });

  response.cookies.set(E2E_FAVORITOS_COOKIE, toCookieValue(result.favoritos), { path: "/" });
  response.cookies.set(E2E_VISITAS_COOKIE, toCookieValue(result.visitas), { path: "/" });

  return response;
}

async function handleFixtureRequest(request: Request, body: ActionRequestBody) {
  const requestCookies = parseCookieHeader(request.headers.get("cookie"));

  if (requestCookies.get(E2E_AUTH_COOKIE) !== "authenticated") {
    return buildErrorResponse("Não autorizado", 401);
  }

  const favoritos = parseCookieList(requestCookies.get(E2E_FAVORITOS_COOKIE));
  const visitas = parseCookieList(requestCookies.get(E2E_VISITAS_COOKIE));

  return buildFixtureResponse(applyFixtureAction(body.action, body.butecoId, favoritos, visitas));
}

async function loadUserId(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return user.id;
}

async function persistAction(userId: string, body: ActionRequestBody) {
  if (body.action === "favoritar") {
    await prisma.favorito.upsert({
      where: { userId_butecoId: { userId, butecoId: body.butecoId } },
      update: {},
      create: { userId, butecoId: body.butecoId },
    });

    return { isFavorito: true, isVisitado: false };
  }

  if (body.action === "desfavoritar") {
    await prisma.favorito.deleteMany({
      where: { userId, butecoId: body.butecoId },
    });

    return { isFavorito: false, isVisitado: false };
  }

  await prisma.visita.upsert({
    where: { userId_butecoId: { userId, butecoId: body.butecoId } },
    update: {},
    create: { userId, butecoId: body.butecoId },
  });

  return { isFavorito: false, isVisitado: true };
}

async function handlePersistedRequest(body: ActionRequestBody, userEmail: string) {
  const userId = await loadUserId(userEmail);

  if (!userId) {
    return buildErrorResponse("Usuário não encontrado", 404);
  }

  const result = await persistAction(userId, body);

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(request: Request) {
  if (isE2EFixtureMode()) {
    const parsedBody = validateActionRequest(await parseActionRequest(request));

    if (parsedBody instanceof NextResponse) {
      return parsedBody;
    }

    return handleFixtureRequest(request, parsedBody);
  }

  const session = await auth();

  if (!session?.user?.email) {
    return buildErrorResponse("Não autorizado", 401);
  }

  const parsedBody = validateActionRequest(await parseActionRequest(request));

  if (parsedBody instanceof NextResponse) {
    return parsedBody;
  }

  return handlePersistedRequest(parsedBody, session.user.email);
}
