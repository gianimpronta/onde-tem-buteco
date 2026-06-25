type NextAuthConfig = {
  providers: unknown[];
  callbacks: {
    signIn: (input: {
      user: { email?: string | null; name?: string | null; image?: string | null };
    }) => Promise<boolean>;
    session: (input: {
      session: { user?: { email?: string | null; id?: string } };
    }) => Promise<{ user?: { email?: string | null; id?: string } }>;
  };
};

let mockCapturedConfig: NextAuthConfig | null = null;

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn((config: NextAuthConfig) => {
    mockCapturedConfig = config;

    return {
      handlers: {
        GET: "GET handler",
        POST: "POST handler",
      },
      signIn: jest.fn(),
      signOut: jest.fn(),
      auth: jest.fn(),
    };
  }),
}));

jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: jest.fn((config: { clientId: string; clientSecret: string }) => ({
    id: "google",
    ...config,
  })),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("auth", () => {
  const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID;
  const originalGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  beforeAll(async () => {
    process.env.GOOGLE_CLIENT_ID = "google-client";
    process.env.GOOGLE_CLIENT_SECRET = "google-secret";

    await import("@/lib/auth");
  });

  beforeEach(() => {
    const { prisma } = jest.requireMock("@/lib/prisma") as {
      prisma: {
        user: {
          upsert: jest.Mock;
          findUnique: jest.Mock;
        };
      };
    };

    prisma.user.upsert.mockClear();
    prisma.user.findUnique.mockClear();
  });

  afterAll(() => {
    if (originalGoogleClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID;
    } else {
      process.env.GOOGLE_CLIENT_ID = originalGoogleClientId;
    }

    if (originalGoogleClientSecret === undefined) {
      delete process.env.GOOGLE_CLIENT_SECRET;
    } else {
      process.env.GOOGLE_CLIENT_SECRET = originalGoogleClientSecret;
    }
  });

  it("configura NextAuth com provider Google", () => {
    const NextAuth = jest.requireMock("next-auth").default as jest.Mock;
    const Google = jest.requireMock("next-auth/providers/google").default as jest.Mock;

    expect(NextAuth).toHaveBeenCalledTimes(1);
    expect(Google).toHaveBeenCalledWith({
      clientId: "google-client",
      clientSecret: "google-secret",
    });
    expect(mockCapturedConfig?.providers).toHaveLength(1);
  });

  it("recusa sign in sem email", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma") as {
      prisma: { user: { upsert: jest.Mock } };
    };

    await expect(mockCapturedConfig?.callbacks.signIn({ user: { email: null } })).resolves.toBe(
      false
    );
    expect(prisma.user.upsert).not.toHaveBeenCalled();
  });

  it("cria ou atualiza usuário no sign in", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma") as {
      prisma: { user: { upsert: jest.Mock } };
    };

    await expect(
      mockCapturedConfig?.callbacks.signIn({
        user: { email: "giani@example.com", name: "Giani", image: "avatar.png" },
      })
    ).resolves.toBe(true);

    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: "giani@example.com" },
      update: { name: "Giani", image: "avatar.png" },
      create: { email: "giani@example.com", name: "Giani", image: "avatar.png" },
    });
  });

  it("anexa id do banco na sessão quando usuário existe", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma") as {
      prisma: { user: { findUnique: jest.Mock } };
    };
    prisma.user.findUnique.mockResolvedValue({ id: "user-1" });

    await expect(
      mockCapturedConfig?.callbacks.session({
        session: { user: { email: "giani@example.com" } },
      })
    ).resolves.toEqual({ user: { email: "giani@example.com", id: "user-1" } });
  });

  it("mantém sessão sem id quando email não existe", async () => {
    const { prisma } = jest.requireMock("@/lib/prisma") as {
      prisma: { user: { findUnique: jest.Mock } };
    };

    await expect(mockCapturedConfig?.callbacks.session({ session: { user: {} } })).resolves.toEqual(
      {
        user: {},
      }
    );
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
