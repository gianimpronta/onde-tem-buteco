import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import {
  E2E_AUTH_COOKIE,
  E2E_FAVORITOS_COOKIE,
  E2E_VISITAS_COOKIE,
  parseE2ECookieList,
} from "@/lib/e2e-fixture-cookies";
import { isE2EFixtureMode } from "@/lib/public-butecos";
import { prisma } from "@/lib/prisma";

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

export function buildButecoLoginHref(slug: string): string {
  const callbackUrl = `/butecos/${slug}`;

  return `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
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

    const favoritos = parseE2ECookieList(cookieStore.get(E2E_FAVORITOS_COOKIE)?.value);
    const visitas = parseE2ECookieList(cookieStore.get(E2E_VISITAS_COOKIE)?.value);

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
