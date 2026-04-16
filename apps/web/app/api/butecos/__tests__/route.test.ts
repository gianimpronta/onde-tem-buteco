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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    auth.mockResolvedValue(null);

    const response = await POST(new Request("http://localhost/api/butecos", { method: "POST" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Não autorizado" });
  });

  it("returns 400 for invalid action", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });

    const response = await POST(
      new Request("http://localhost/api/butecos", {
        method: "POST",
        body: JSON.stringify({ butecoId: "1", action: "invalid" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Ação inválida" });
  });

  it("returns 404 when user is not found", async () => {
    auth.mockResolvedValue({ user: { email: "test@example.com" } });
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/butecos", {
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
      new Request("http://localhost/api/butecos", {
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
      new Request("http://localhost/api/butecos", {
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
      new Request("http://localhost/api/butecos", {
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
});
