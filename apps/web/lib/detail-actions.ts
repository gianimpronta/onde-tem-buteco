import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { isE2EFixtureMode } from "@/lib/public-butecos";
import { prisma } from "@/lib/prisma";

export const E2E_AUTH_COOKIE = "onde-tem-buteco-e2e-auth";
export const E2E_FAVORITOS_COOKIE = "onde-tem-buteco-e2e-favoritos";
export const E2E_VISITAS_COOKIE = "onde-tem-buteco-e2e-visitas";

type GetButecoActionStateParams = {
  butecoId: string;
  slug: string;
};

export type ButecoActionState = {
  isAuthenticated: boolean;
  isFavorito: boolean;
  isVisitado: boolean;
  loginHref: string;
};

function buildDefaultState(slug: string): ButecoActionState {
  return {
    isAuthenticated: false,
    isFavorito: false,
    isVisitado: false,
    loginHref: buildButecoLoginHref(slug),
  };
}

function parseCookieList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const candidates = [value];

  try {
    candidates.push(decodeURIComponent(value));
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

export function buildButecoLoginHref(slug: string): string {
  return `/login?callbackUrl=${encodeURIComponent(`/butecos/${slug}`)}`;
}

export async function getButecoActionState({
  butecoId,
  slug,
}: GetButecoActionStateParams): Promise<ButecoActionState> {
  const defaultState = buildDefaultState(slug);

  if (isE2EFixtureMode()) {
    const cookieStore = await cookies();
    const isAuthenticated = cookieStore.get(E2E_AUTH_COOKIE)?.value === "authenticated";

    if (!isAuthenticated) {
      return defaultState;
    }

    const favoritos = parseCookieList(cookieStore.get(E2E_FAVORITOS_COOKIE)?.value);
    const visitas = parseCookieList(cookieStore.get(E2E_VISITAS_COOKIE)?.value);

    return {
      ...defaultState,
      isAuthenticated: true,
      isFavorito: favoritos.includes(butecoId),
      isVisitado: visitas.includes(butecoId),
    };
  }

  const session = await auth();

  if (!session?.user?.email) {
    return defaultState;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return defaultState;
  }

  const [favorito, visita] = await Promise.all([
    prisma.favorito.findUnique({
      where: { userId_butecoId: { userId: user.id, butecoId } },
      select: { id: true },
    }),
    prisma.visita.findUnique({
      where: { userId_butecoId: { userId: user.id, butecoId } },
      select: { id: true },
    }),
  ]);

  return {
    ...defaultState,
    isAuthenticated: true,
    isFavorito: Boolean(favorito),
    isVisitado: Boolean(visita),
  };
}
