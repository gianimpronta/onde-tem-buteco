/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import ButecosPage from "@/app/(public)/butecos/page";
import { getButecosPageData } from "@/lib/public-butecos";

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

jest.mock("@/components/butecos/filter-form", () => ({
  ButecosFilterForm: ({
    cidadeOptions,
    bairroOptions,
  }: {
    cidadeOptions: string[];
    bairroOptions: string[];
  }) => (
    <div data-testid="filter-form">
      {cidadeOptions.join(",")} / {bairroOptions.join(",")}
    </div>
  ),
}));

jest.mock("@/components/butecos/buteco-card", () => ({
  ButecoCard: ({ buteco }: { buteco: { nome: string; slug: string } }) => (
    <a href={`/butecos/${buteco.slug}`}>{buteco.nome}</a>
  ),
}));

jest.mock("@/lib/public-butecos", () => ({
  getButecosPageData: jest.fn(),
}));

describe("ButecosPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza lista de butecos e resumo de filtros", async () => {
    (getButecosPageData as jest.Mock).mockResolvedValue({
      cidades: ["Belo Horizonte"],
      bairros: ["Savassi"],
      butecos: [
        {
          slug: "bar-do-zeca",
          nome: "Bar do Zeca",
          cidade: "Belo Horizonte",
          bairro: "Savassi",
          petiscoNome: "Bolinho da Casa",
          fotoUrl: null,
        },
      ],
    });

    render(
      await ButecosPage({
        searchParams: Promise.resolve({ cidade: "Belo Horizonte" }),
      })
    );

    expect(screen.getByRole("heading", { name: "Botecos" })).toBeInTheDocument();
    expect(screen.getByText("1 resultado com 1 filtro")).toBeInTheDocument();
    expect(screen.getByTestId("filter-form")).toHaveTextContent("Belo Horizonte / Savassi");
    expect(screen.getByRole("link", { name: "Bar do Zeca" })).toHaveAttribute(
      "href",
      "/butecos/bar-do-zeca"
    );
  });

  it("renderiza estado vazio e aviso de bairro ausente", async () => {
    (getButecosPageData as jest.Mock).mockResolvedValue({
      cidades: ["Belo Horizonte"],
      bairros: [],
      butecos: [],
    });

    render(
      await ButecosPage({
        searchParams: Promise.resolve({ cidade: "Belo Horizonte", q: "x" }),
      })
    );

    expect(screen.getByText("0 resultados com 2 filtros")).toBeInTheDocument();
    expect(
      screen.getByText("Ainda não existem bairros cadastrados para a cidade selecionada.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Nenhum buteco encontrado por aqui" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpar filtros" })).toHaveAttribute(
      "href",
      "/butecos"
    );
    expect(screen.getByRole("link", { name: "Voltar para a home" })).toHaveAttribute("href", "/");
  });
});
