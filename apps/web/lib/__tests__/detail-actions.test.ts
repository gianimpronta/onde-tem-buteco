jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    favorito: { findUnique: jest.fn() },
    visita: { findUnique: jest.fn() },
  },
}));

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildButecoLoginHref, getButecoActionState } from "@/lib/detail-actions";

const cookiesMock = cookies as jest.Mock;
const authMock = auth as jest.Mock;
const prismaMock = prisma as {
  user: { findUnique: jest.Mock };
  favorito: { findUnique: jest.Mock };
  visita: { findUnique: jest.Mock };
};

describe("detail-actions", () => {
  const originalFixtureMode = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.E2E_USE_FIXTURES;
    cookiesMock.mockResolvedValue({
      get: jest.fn(() => undefined),
    });
  });

  afterEach(() => {
    if (originalFixtureMode === undefined) {
      delete process.env.E2E_USE_FIXTURES;
      return;
    }

    process.env.E2E_USE_FIXTURES = originalFixtureMode;
  });

  it("builds the login href with callbackUrl to the detail page", () => {
    expect(buildButecoLoginHref("bar-do-zeca")).toBe("/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca");
  });

  it("returns anonymous state in fixture mode when no auth cookie is present", async () => {
    process.env.E2E_USE_FIXTURES = "true";

    await expect(
      getButecoActionState({ butecoId: "buteco-1", slug: "bar-do-zeca" })
    ).resolves.toEqual({
      isAuthenticated: false,
      isFavorito: false,
      isVisitado: false,
      loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
    });
  });

  it("returns fixture auth state from cookies when the e2e auth cookie is present", async () => {
    process.env.E2E_USE_FIXTURES = "true";

    cookiesMock.mockResolvedValue({
      get: jest.fn((name: string) => {
        if (name === "onde-tem-buteco-e2e-auth") {
          return { value: "authenticated" };
        }

        if (name === "onde-tem-buteco-e2e-favoritos") {
          return { value: JSON.stringify(["buteco-1"]) };
        }

        if (name === "onde-tem-buteco-e2e-visitas") {
          return { value: JSON.stringify(["buteco-1", "buteco-2"]) };
        }

        return undefined;
      }),
    });

    await expect(
      getButecoActionState({ butecoId: "buteco-1", slug: "bar-do-zeca" })
    ).resolves.toEqual({
      isAuthenticated: true,
      isFavorito: true,
      isVisitado: true,
      loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
    });
  });

  it("returns anonymous state when the real session is missing", async () => {
    authMock.mockResolvedValue(null);

    await expect(
      getButecoActionState({ butecoId: "buteco-1", slug: "bar-do-zeca" })
    ).resolves.toEqual({
      isAuthenticated: false,
      isFavorito: false,
      isVisitado: false,
      loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
    });
  });

  it("returns persisted favorite and visit state for authenticated users", async () => {
    authMock.mockResolvedValue({ user: { email: "test@example.com" } });
    prismaMock.user.findUnique.mockResolvedValue({ id: "user-1" });
    prismaMock.favorito.findUnique.mockResolvedValue({ id: "fav-1" });
    prismaMock.visita.findUnique.mockResolvedValue(null);

    await expect(
      getButecoActionState({ butecoId: "buteco-1", slug: "bar-do-zeca" })
    ).resolves.toEqual({
      isAuthenticated: true,
      isFavorito: true,
      isVisitado: false,
      loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
    });

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      select: { id: true },
    });
    expect(prismaMock.favorito.findUnique).toHaveBeenCalledWith({
      where: { userId_butecoId: { userId: "user-1", butecoId: "buteco-1" } },
      select: { id: true },
    });
    expect(prismaMock.visita.findUnique).toHaveBeenCalledWith({
      where: { userId_butecoId: { userId: "user-1", butecoId: "buteco-1" } },
      select: { id: true },
    });
  });
});
