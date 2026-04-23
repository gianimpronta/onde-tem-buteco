import { POST } from "@/app/api/butecos/route";

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    favorito: { upsert: jest.fn(), deleteMany: jest.fn() },
    visita: { upsert: jest.fn() },
  },
}));

const { auth } = jest.requireMock("@/lib/auth") as { auth: jest.Mock };
const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    user: { findUnique: jest.Mock };
    favorito: { upsert: jest.Mock; deleteMany: jest.Mock };
    visita: { upsert: jest.Mock };
  };
};

describe("POST /api/butecos", () => {
  const originalFixtureMode = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.E2E_USE_FIXTURES;
  });

  afterEach(() => {
    if (originalFixtureMode === undefined) {
      delete process.env.E2E_USE_FIXTURES;
      return;
    }

    process.env.E2E_USE_FIXTURES = originalFixtureMode;
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);

    const response = await POST(new Request("https://localhost/api/butecos", { method: "POST" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Não autorizado" });
  });

  it("returns 400 when the request body is not valid JSON", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "not json",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Requisição inválida" });
  });

  it("returns 400 for invalid action", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "1", action: "invalid" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ação inválida" });
  });

  it("returns 400 when butecoId is missing", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "", action: "favoritar" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Buteco inválido" });
  });

  it("returns 404 when user is not found", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "1", action: "favoritar" }),
      })
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Usuário não encontrado" });
  });

  it("upserts favorite when action=favoritar", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "buteco-1", action: "favoritar" }),
      })
    );

    expect(response.status).toBe(200);
    expect(prisma.favorito.upsert).toHaveBeenCalledWith({
      where: { userId_butecoId: { userId: "user-1", butecoId: "buteco-1" } },
      update: {},
      create: { userId: "user-1", butecoId: "buteco-1" },
    });
  });

  it("deletes favorite when action=desfavoritar", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "buteco-1", action: "desfavoritar" }),
      })
    );

    expect(prisma.favorito.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-1", butecoId: "buteco-1" },
    });
  });

  it("upserts visit when action=visitar", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "buteco-1", action: "visitar" }),
      })
    );

    expect(prisma.visita.upsert).toHaveBeenCalledWith({
      where: { userId_butecoId: { userId: "user-1", butecoId: "buteco-1" } },
      update: {},
      create: { userId: "user-1", butecoId: "buteco-1" },
    });
  });

  it("uses fixture auth cookies when e2e fixture mode is enabled", async () => {
    process.env.E2E_USE_FIXTURES = "true";

    const response = await POST(
      new Request("https://localhost/api/butecos", {
        method: "POST",
        headers: {
          cookie:
            "onde-tem-buteco-e2e-auth=authenticated; onde-tem-buteco-e2e-favoritos=%5B%5D; onde-tem-buteco-e2e-visitas=%5B%5D",
        },
        body: JSON.stringify({ butecoId: "fixture-bar-do-zeca", action: "favoritar" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      isFavorito: true,
      isVisitado: false,
    });
    expect(response.headers.get("set-cookie")).toContain("onde-tem-buteco-e2e-favoritos=");
    expect(auth).not.toHaveBeenCalled();
    expect(prisma.favorito.upsert).not.toHaveBeenCalled();
  });
});
