/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import Header from "@/components/ui/header";
import { auth } from "@/lib/auth";
import { isE2EFixtureMode } from "@/lib/public-butecos";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <button type="button">Tema</button>,
}));

jest.mock("@/lib/public-butecos", () => ({
  isE2EFixtureMode: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  signOut: jest.fn(),
}));

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isE2EFixtureMode as jest.Mock).mockReturnValue(false);
    (auth as jest.Mock).mockResolvedValue(null);
  });

  it("renderiza navegação pública quando não há sessão", async () => {
    render(await Header());

    expect(screen.getAllByRole("img", { name: "Onde tem buteco" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Ver botecos" })).toHaveAttribute("href", "/butecos");
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("button", { name: "Tema" })).toBeInTheDocument();
  });

  it("renderiza links de conta quando há sessão", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { email: "giani@example.com" } });

    render(await Header());

    expect(screen.getByRole("link", { name: "Minha Conta" })).toHaveAttribute(
      "href",
      "/minha-conta"
    );
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument();
  });

  it("não chama auth em fixture mode", async () => {
    (isE2EFixtureMode as jest.Mock).mockReturnValue(true);

    render(await Header());

    expect(auth).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });
});
