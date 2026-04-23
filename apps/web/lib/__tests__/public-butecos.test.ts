jest.mock("@/lib/prisma", () => ({
  prisma: {
    buteco: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

import {
  getButecoBySlug,
  getButecosPageData,
  getHomeData,
  isE2EFixtureMode,
  listPublicButecoEntriesForSitemap,
} from "@/lib/public-butecos";

const { prisma } = jest.requireMock("@/lib/prisma") as {
  prisma: {
    buteco: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };
};

describe("public-butecos fixtures", () => {
  const originalEnv = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    process.env.E2E_USE_FIXTURES = "true";
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.E2E_USE_FIXTURES;
      return;
    }

    process.env.E2E_USE_FIXTURES = originalEnv;
  });

  it("detects fixture mode from environment", () => {
    expect(isE2EFixtureMode()).toBe(true);
  });

  it("returns summary data for the home page", async () => {
    const data = await getHomeData();

    expect(data.total).toBe(3);
    expect(data.butecosComMapa).toHaveLength(3);
    expect(data.butecosComMapa[0]).toEqual({
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      bairro: "Savassi",
      lat: -19.9385,
      lng: -43.9342,
    });
  });

  it("filters butecos by city and neighborhood", async () => {
    const data = await getButecosPageData({
      cidade: "Belo Horizonte",
      bairro: "Savassi",
    });

    expect(data.cidades).toEqual(["Belo Horizonte", "Contagem"]);
    expect(data.bairros).toEqual(["Centro", "Savassi"]);
    expect(data.butecos).toEqual([
      {
        slug: "bar-do-zeca",
        nome: "Bar do Zeca",
        cidade: "Belo Horizonte",
        bairro: "Savassi",
        petiscoNome: "Bolinho da Casa",
      },
    ]);
  });

  it("filters butecos by search term in buteco name or snack name", async () => {
    const byPetisco = await getButecosPageData({ q: "Torresmo" });
    const byButeco = await getButecosPageData({ q: "Célia" });

    expect(byPetisco.butecos.map(({ slug }) => slug)).toEqual(["cantin-do-joao"]);
    expect(byButeco.butecos.map(({ slug }) => slug)).toEqual(["esquina-da-celia"]);
  });

  it("returns detailed data for a known slug and null for an unknown one", async () => {
    await expect(getButecoBySlug("bar-do-zeca")).resolves.toEqual({
      id: "fixture-bar-do-zeca",
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      cidade: "Belo Horizonte",
      bairro: "Savassi",
      endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
      telefone: "(31) 3333-1111",
      horario: "Seg a Sáb, 18h às 23h",
      petiscoNome: "Bolinho da Casa",
      petiscoDesc: "Bolinho crocante de carne com molho da casa.",
      fotoUrl: null,
    });

    await expect(getButecoBySlug("inexistente")).resolves.toBeNull();
  });

  it("lists sitemap entries from fixtures", async () => {
    await expect(listPublicButecoEntriesForSitemap()).resolves.toEqual([
      {
        slug: "bar-do-zeca",
        updatedAt: undefined,
      },
      {
        slug: "cantin-do-joao",
        updatedAt: undefined,
      },
      {
        slug: "esquina-da-celia",
        updatedAt: undefined,
      },
    ]);
  });
});

describe("public-butecos prisma mode", () => {
  const originalEnv = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    delete process.env.E2E_USE_FIXTURES;
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.E2E_USE_FIXTURES;
      return;
    }

    process.env.E2E_USE_FIXTURES = originalEnv;
  });

  it("returns home data from prisma when fixture mode is disabled", async () => {
    prisma.buteco.count.mockResolvedValue(4);
    prisma.buteco.findMany.mockResolvedValue([
      { slug: "zeca", nome: "Zeca", bairro: "Centro", lat: -1, lng: -2 },
      { slug: "sem-mapa", nome: "Sem mapa", bairro: null, lat: null, lng: null },
    ]);

    await expect(getHomeData()).resolves.toEqual({
      total: 4,
      butecosComMapa: [{ slug: "zeca", nome: "Zeca", bairro: "Centro", lat: -1, lng: -2 }],
    });
  });

  it("returns list data from prisma when fixture mode is disabled", async () => {
    prisma.buteco.findMany
      .mockResolvedValueOnce([{ cidade: "Belo Horizonte" }, { cidade: "Contagem" }])
      .mockResolvedValueOnce([{ bairro: "Savassi" }, { bairro: null }])
      .mockResolvedValueOnce([
        {
          slug: "bar-do-zeca",
          nome: "Bar do Zeca",
          cidade: "Belo Horizonte",
          bairro: "Savassi",
          petiscoNome: "Bolinho da Casa",
        },
      ]);

    await expect(getButecosPageData({ cidade: "Belo Horizonte" })).resolves.toEqual({
      cidades: ["Belo Horizonte", "Contagem"],
      bairros: ["Savassi"],
      butecos: [
        {
          slug: "bar-do-zeca",
          nome: "Bar do Zeca",
          cidade: "Belo Horizonte",
          bairro: "Savassi",
          petiscoNome: "Bolinho da Casa",
        },
      ],
    });
  });

  it("returns detail data from prisma when fixture mode is disabled", async () => {
    prisma.buteco.findUnique.mockResolvedValue({
      id: "db-bar-do-zeca",
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      cidade: "Belo Horizonte",
      bairro: "Savassi",
      endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
      telefone: "(31) 3333-1111",
      horario: "Seg a Sáb, 18h às 23h",
      petiscoNome: "Bolinho da Casa",
      petiscoDesc: "Bolinho crocante de carne com molho da casa.",
      fotoUrl: null,
    });

    await expect(getButecoBySlug("bar-do-zeca")).resolves.toEqual({
      id: "db-bar-do-zeca",
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      cidade: "Belo Horizonte",
      bairro: "Savassi",
      endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
      telefone: "(31) 3333-1111",
      horario: "Seg a Sáb, 18h às 23h",
      petiscoNome: "Bolinho da Casa",
      petiscoDesc: "Bolinho crocante de carne com molho da casa.",
      fotoUrl: null,
    });
  });

  it("lists sitemap entries from prisma when fixture mode is disabled", async () => {
    const updatedAt = new Date("2026-04-23T12:00:00.000Z");

    prisma.buteco.findMany.mockResolvedValue([
      { slug: "bar-do-zeca", updatedAt },
      { slug: "cantin-do-joao", updatedAt },
    ]);

    await expect(listPublicButecoEntriesForSitemap()).resolves.toEqual([
      { slug: "bar-do-zeca", updatedAt },
      { slug: "cantin-do-joao", updatedAt },
    ]);
  });
});
