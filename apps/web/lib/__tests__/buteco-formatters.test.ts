import { formatAddress, formatPhone, generateSlug, paginate } from "@/lib/buteco-formatters";

describe("buteco-formatters", () => {
  it("generates slug with accent removal", () => {
    expect(generateSlug("Bar do Zé & Filhos!")).toBe("bar-do-ze-filhos");
  });

  it("normalizes separators and trims leading/trailing dashes", () => {
    expect(generateSlug("  !!!São   João---2026***  ")).toBe("sao-joao-2026");
    expect(generateSlug("___")).toBe("");
  });

  it("formats address from optional parts", () => {
    expect(formatAddress(["Rua A, 10", undefined, "Centro", "Belo Horizonte"])).toBe(
      "Rua A, 10, Centro, Belo Horizonte"
    );
  });

  it("formats 10 or 11 digit phones", () => {
    expect(formatPhone("3133334444")).toBe("(31) 3333-4444");
    expect(formatPhone("31999998888")).toBe("(31) 99999-8888");
  });

  it("falls back to trimmed value when number shape is unknown", () => {
    expect(formatPhone("  Ramal 123  ")).toBe("Ramal 123");
    expect(formatPhone(null)).toBeNull();
    expect(formatPhone("")).toBeNull();
    expect(formatPhone("   ")).toBeNull();
  });

  it("paginates ordered items", () => {
    expect(paginate(["a", "b", "c", "d"], 2, 2)).toEqual(["c", "d"]);
  });

  it("clamps invalid pagination params", () => {
    expect(paginate(["a", "b", "c"], 0, 2)).toEqual(["a", "b"]);
    expect(paginate(["a", "b", "c"], 1, 0)).toEqual(["a"]);
  });
});
