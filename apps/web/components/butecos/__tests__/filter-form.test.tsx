/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButecosFilterForm } from "@/components/butecos/filter-form";

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
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const pushMock = jest.fn();

describe("ButecosFilterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it("renderiza campos, opções e link para limpar filtros", () => {
    render(
      <ButecosFilterForm
        cidadeOptions={["Belo Horizonte", "Contagem"]}
        bairroOptions={["Savassi"]}
      />
    );

    expect(screen.getByLabelText("Buscar")).toHaveAttribute(
      "placeholder",
      "Nome do buteco ou petisco"
    );
    expect(screen.getByLabelText("Cidade")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Belo Horizonte" })).toBeInTheDocument();
    expect(screen.getByLabelText("Bairro")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Aplicar filtros" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Limpar" })).toHaveAttribute("href", "/butecos");
  });

  it("preserva busca textual ao trocar cidade", () => {
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams("q=torresmo"));
    render(<ButecosFilterForm cidadeOptions={["Belo Horizonte"]} bairroOptions={[]} />);

    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "Belo Horizonte" },
    });

    expect(pushMock).toHaveBeenCalledWith("/butecos?cidade=Belo+Horizonte&q=torresmo");
  });

  it("desabilita bairro quando não há opções disponíveis", () => {
    render(<ButecosFilterForm cidadeOptions={["Belo Horizonte"]} bairroOptions={[]} />);

    expect(screen.getByLabelText("Bairro")).toBeDisabled();
  });
});
