/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MinhaContaPage from "@/app/(private)/minha-conta/page";

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

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
  },
}));

const prismaMock = prisma as unknown as {
  user: { findUnique: jest.Mock };
};

const authMock = auth as jest.Mock;
const cookiesMock = cookies as jest.Mock;

function buteco(
  overrides: Partial<{
    nome: string;
    slug: string;
    cidade: string;
    bairro: string | null;
  }> = {}
) {
  return {
    nome: "Bar do Zeca",
    slug: "bar-do-zeca",
    cidade: "São Paulo",
    bairro: "Pinheiros",
    ...overrides,
  };
}

describe("MinhaContaPage", () => {
  const originalFixtureMode = process.env.E2E_USE_FIXTURES;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.E2E_USE_FIXTURES;
    authMock.mockResolvedValue({ user: { email: "giani@example.com" } });
    cookiesMock.mockResolvedValue({ get: jest.fn(() => undefined) });
    (redirect as unknown as jest.Mock).mockImplementation((path: string) => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });
  });

  afterEach(() => {
    if (originalFixtureMode === undefined) {
      delete process.env.E2E_USE_FIXTURES;
      return;
    }

    process.env.E2E_USE_FIXTURES = originalFixtureMode;
  });

  it("renderiza resumo, atalhos e listas escaneáveis quando há favoritos e visitas", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      name: "Giani",
      favoritos: [
        { createdAt: new Date("2026-06-10T12:00:00.000Z"), buteco: buteco() },
        {
          createdAt: new Date("2026-06-09T12:00:00.000Z"),
          buteco: buteco({ nome: "Tasca da Ana", slug: "tasca-da-ana", bairro: "Centro" }),
        },
      ],
      visitas: [
        {
          visitadoEm: new Date("2026-05-03T12:00:00.000Z"),
          buteco: buteco({
            nome: "Boteco da Lapa",
            slug: "boteco-da-lapa",
            cidade: "Rio de Janeiro",
            bairro: "Lapa",
          }),
        },
      ],
    });

    render(await MinhaContaPage());

    expect(screen.getByRole("heading", { name: "Minha Conta" })).toBeInTheDocument();
    expect(screen.getByText("Olá, Giani")).toBeInTheDocument();
    expect(screen.getByText("2 favoritos")).toBeInTheDocument();
    expect(screen.getByText("1 visitado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar butecos" })).toHaveAttribute(
      "href",
      "/butecos"
    );
    expect(screen.getByRole("link", { name: "Abrir mapa" })).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: "Bar do Zeca" })).toHaveAttribute(
      "href",
      "/butecos/bar-do-zeca"
    );
    expect(screen.getByText("Pinheiros, São Paulo")).toBeInTheDocument();
    expect(screen.getByText("Favoritado em 10/06/2026")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Boteco da Lapa" })).toHaveAttribute(
      "href",
      "/butecos/boteco-da-lapa"
    );
    expect(screen.getByText("Lapa, Rio de Janeiro")).toBeInTheDocument();
    expect(screen.getByText("Visitado em 03/05/2026")).toBeInTheDocument();
  });

  it("renderiza estados vazios com próximos passos claros", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      name: null,
      favoritos: [],
      visitas: [],
    });

    render(await MinhaContaPage());

    expect(screen.getByText("Sua lista de favoritos está vazia")).toBeInTheDocument();
    expect(
      screen.getByText("Comece salvando os butecos que parecem bons para o seu roteiro.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Você ainda não marcou nenhum buteco como visitado")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Use o mapa para escolher o próximo carimbo do rolê.")
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Encontrar butecos" })).toHaveLength(2);
  });

  it("renderiza dados privados a partir dos cookies em fixture mode", async () => {
    process.env.E2E_USE_FIXTURES = "true";
    cookiesMock.mockResolvedValue({
      get: jest.fn((name: string) => {
        const values = new Map([
          ["onde-tem-buteco-e2e-auth", "authenticated"],
          [
            "onde-tem-buteco-e2e-favoritos",
            encodeURIComponent(JSON.stringify(["fixture-bar-do-zeca"])),
          ],
          [
            "onde-tem-buteco-e2e-visitas",
            encodeURIComponent(JSON.stringify(["fixture-cantin-do-joao"])),
          ],
        ]);
        const value = values.get(name);

        return value ? { value } : undefined;
      }),
    });

    render(await MinhaContaPage());

    expect(auth).not.toHaveBeenCalled();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(screen.getByText("1 favorito")).toBeInTheDocument();
    expect(screen.getByText("1 visitado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bar do Zeca" })).toHaveAttribute(
      "href",
      "/butecos/bar-do-zeca"
    );
    expect(screen.getByRole("link", { name: "Cantin do João" })).toHaveAttribute(
      "href",
      "/butecos/cantin-do-joao"
    );
  });

  it("redireciona para login sem sessão", async () => {
    authMock.mockResolvedValue(null);

    await expect(MinhaContaPage()).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
