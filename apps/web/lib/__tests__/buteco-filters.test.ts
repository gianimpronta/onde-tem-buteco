import {
  buildButecoWhere,
  countActiveButecoFilters,
  normalizeButecoFilters,
} from "@/lib/buteco-filters";

describe("buteco-filters", () => {
  it("trims filter values and removes empty ones", () => {
    expect(
      normalizeButecoFilters({
        cidade: "  Belo Horizonte  ",
        bairro: "   ",
        q: "  torresmo ",
      })
    ).toEqual({
      cidade: "Belo Horizonte",
      bairro: undefined,
      q: "torresmo",
    });
  });

  it("builds prisma where clause with text search on buteco and petisco names", () => {
    expect(
      buildButecoWhere({
        cidade: "Belo Horizonte",
        bairro: "Centro",
        q: "torresmo",
      })
    ).toEqual({
      cidade: "Belo Horizonte",
      bairro: "Centro",
      OR: [
        { nome: { contains: "torresmo", mode: "insensitive" } },
        { petiscoNome: { contains: "torresmo", mode: "insensitive" } },
      ],
    });
  });

  it("returns empty where clause when there are no active filters", () => {
    expect(buildButecoWhere({ cidade: "   ", bairro: "", q: undefined })).toEqual({});
  });

  it("counts only active filters", () => {
    expect(
      countActiveButecoFilters({
        cidade: "Belo Horizonte",
        bairro: "",
        q: "feijoada",
      })
    ).toBe(2);
  });
});
