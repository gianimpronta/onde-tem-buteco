/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

function mockSystemTheme(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: jest.fn(() => ({
      matches: prefersDark,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    mockSystemTheme(false);
  });

  it("alterna de tema claro para escuro e persiste a preferência", () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Mudar para tema escuro" }));

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Mudar para tema claro" })).toBeInTheDocument();
  });

  it("respeita preferência escura salva no localStorage", () => {
    localStorage.setItem("theme", "dark");

    render(<ThemeToggle />);

    expect(screen.getByRole("button", { name: "Mudar para tema claro" })).toBeInTheDocument();
    expect(document.documentElement).toHaveClass("dark");
  });
});
