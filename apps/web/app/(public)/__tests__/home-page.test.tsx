/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import Home from "@/app/(public)/page";
import { getHomeData } from "@/lib/public-butecos";

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

jest.mock("@/components/mapa/mapa-butecos-shell", () => ({
  MapaButecosShell: ({ butecos }: { butecos: Array<{ nome: string }> }) => (
    <div data-testid="mapa-shell">{butecos.map((buteco) => buteco.nome).join(", ")}</div>
  ),
}));

jest.mock("@/lib/public-butecos", () => ({
  getHomeData: jest.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza total, CTA e mapa com dados", async () => {
    (getHomeData as jest.Mock).mockResolvedValue({
      total: 2,
      butecosComMapa: [{ nome: "Bar do Zeca" }, { nome: "Cantin do João" }],
    });

    render(await Home());

    expect(
      screen.getByRole("heading", { name: "Descubra os botecos no mapa" })
    ).toBeInTheDocument();
    expect(screen.getByText("2 botecos participando")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver botecos" })).toHaveAttribute("href", "/butecos");
    expect(screen.getByTestId("mapa-shell")).toHaveTextContent("Bar do Zeca, Cantin do João");
  });

  it("renderiza fallback quando dados da home falham", async () => {
    (getHomeData as jest.Mock).mockRejectedValue(new Error("falha"));

    render(await Home());

    expect(screen.queryByText(/botecos participando/)).not.toBeInTheDocument();
    expect(screen.getByTestId("mapa-shell")).toHaveTextContent("");
  });
});
