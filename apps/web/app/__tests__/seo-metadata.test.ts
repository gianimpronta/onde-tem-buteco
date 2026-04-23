jest.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

jest.mock("@vercel/analytics/next", () => ({
  Analytics: () => null,
}));

jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}));

jest.mock("@/lib/public-butecos", () => ({
  getButecoBySlug: jest.fn(),
}));

jest.mock("@/lib/detail-actions", () => ({
  getButecoActionState: jest.fn().mockResolvedValue({
    isAuthenticated: false,
    isFavorito: false,
    isVisitado: false,
    loginHref: "/login",
  }),
}));

jest.mock("@/components/butecos/buteco-action-panel", () => () => null);

describe("SEO metadata", () => {
  const originalNextAuthUrl = process.env.NEXTAUTH_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXTAUTH_URL = "https://www.ondetembuteco.com.br";
  });

  afterEach(() => {
    if (originalNextAuthUrl === undefined) {
      delete process.env.NEXTAUTH_URL;
      return;
    }

    process.env.NEXTAUTH_URL = originalNextAuthUrl;
  });

  it("configures global metadata with canonical and social defaults", async () => {
    const layoutModule = await import("@/app/layout");

    expect(layoutModule.metadata).toMatchObject({
      title: {
        default: "Onde Tem Buteco",
        template: "%s | Onde Tem Buteco",
      },
      description: expect.stringContaining("Comida di Buteco"),
      alternates: {
        canonical: "/",
      },
      openGraph: expect.objectContaining({
        title: "Onde Tem Buteco",
        url: "/",
        siteName: "Onde Tem Buteco",
        locale: "pt_BR",
        type: "website",
      }),
      twitter: expect.objectContaining({
        card: "summary",
        title: "Onde Tem Buteco",
      }),
    });

    expect(layoutModule.metadata.metadataBase?.toString()).toBe(
      "https://www.ondetembuteco.com.br/"
    );
  });

  it("generates detail metadata from the current buteco", async () => {
    const { getButecoBySlug } = jest.requireMock("@/lib/public-butecos") as {
      getButecoBySlug: jest.Mock;
    };

    getButecoBySlug.mockResolvedValue({
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      cidade: "Belo Horizonte",
      bairro: "Savassi",
      endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
      telefone: "(31) 3333-1111",
      horario: "Seg a Sab, 18h as 23h",
      petiscoNome: "Bolinho da Casa",
      petiscoDesc: "Bolinho crocante de carne com molho da casa.",
      fotoUrl: null,
    });

    const detailPageModule = (await import("@/app/(public)/butecos/[slug]/page")) as {
      generateMetadata?: (input: { params: Promise<{ slug: string }> }) => Promise<unknown>;
    };

    expect(detailPageModule.generateMetadata).toEqual(expect.any(Function));

    const metadata = await detailPageModule.generateMetadata?.({
      params: Promise.resolve({ slug: "bar-do-zeca" }),
    });

    expect(metadata).toMatchObject({
      title: "Bar do Zeca",
      description: expect.stringContaining("Bolinho da Casa"),
      alternates: {
        canonical: "/butecos/bar-do-zeca",
      },
      openGraph: expect.objectContaining({
        title: "Bar do Zeca",
        url: "/butecos/bar-do-zeca",
      }),
      twitter: expect.objectContaining({
        title: "Bar do Zeca",
      }),
    });
  });

  it("marks missing buteco pages as non-indexable", async () => {
    const { getButecoBySlug } = jest.requireMock("@/lib/public-butecos") as {
      getButecoBySlug: jest.Mock;
    };

    getButecoBySlug.mockResolvedValue(null);

    const detailPageModule = (await import("@/app/(public)/butecos/[slug]/page")) as {
      generateMetadata?: (input: { params: Promise<{ slug: string }> }) => Promise<unknown>;
    };

    const metadata = await detailPageModule.generateMetadata?.({
      params: Promise.resolve({ slug: "inexistente" }),
    });

    expect(metadata).toMatchObject({
      title: "Buteco não encontrado",
      robots: {
        index: false,
        follow: false,
      },
    });
  });
});
