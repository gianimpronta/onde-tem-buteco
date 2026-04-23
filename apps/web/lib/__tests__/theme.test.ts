import { resolveInitialTheme } from "@/lib/theme";

describe("resolveInitialTheme", () => {
  it("prioritizes a persisted dark preference over a light system preference", () => {
    expect(
      resolveInitialTheme({
        storedTheme: "dark",
        systemPrefersDark: false,
      })
    ).toBe("dark");
  });

  it("falls back to the system preference when there is no persisted theme", () => {
    expect(
      resolveInitialTheme({
        storedTheme: null,
        systemPrefersDark: true,
      })
    ).toBe("dark");

    expect(
      resolveInitialTheme({
        storedTheme: null,
        systemPrefersDark: false,
      })
    ).toBe("light");
  });
});
