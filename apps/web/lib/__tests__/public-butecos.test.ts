import {
  getButecoBySlug,
  getButecosPageData,
  getHomeData,
  isE2EFixtureMode,
} from "@/lib/public-butecos";

describe("public-butecos fixtures", () => {
  const originalEnv = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    process.env.E2E_USE_FIXTURES = "true";
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
});
