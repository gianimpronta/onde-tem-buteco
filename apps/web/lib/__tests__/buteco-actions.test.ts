import { isValidAction } from "@/lib/buteco-actions";

describe("isValidAction", () => {
  it("accepts valid actions", () => {
    expect(isValidAction("favoritar")).toBe(true);
    expect(isValidAction("desfavoritar")).toBe(true);
    expect(isValidAction("visitar")).toBe(true);
  });

  it("rejects unknown actions", () => {
    expect(isValidAction("deletar")).toBe(false);
    expect(isValidAction("")).toBe(false);
    expect(isValidAction("FAVORITAR")).toBe(false);
  });
});
