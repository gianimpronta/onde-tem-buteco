/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import ButecoPage from "@/app/(public)/butecos/[slug]/page";
import { getButecoActionState } from "@/lib/detail-actions";
import { getButecoBySlug } from "@/lib/public-butecos";
import { notFound } from "next/navigation";

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

jest.mock("next/image", () => {
  return function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  };
});

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/lib/public-butecos", () => ({
  getButecoBySlug: jest.fn(),
}));

jest.mock("@/lib/detail-actions", () => ({
  getButecoActionState: jest.fn(),
}));

jest.mock("@/components/butecos/buteco-action-panel", () => ({
  __esModule: true,
  default: function MockButecoActionPanel(props: Record<string, unknown>) {
    return <pre data-testid="buteco-action-panel">{JSON.stringify(props)}</pre>;
  },
}));

const getButecoBySlugMock = getButecoBySlug as jest.Mock;
const getButecoActionStateMock = getButecoActionState as jest.Mock;
const notFoundMock = notFound as jest.Mock;

describe("ButecoPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the detail page and passes the auth-aware state to the action panel", async () => {
    getButecoBySlugMock.mockResolvedValue({
      id: "fixture-bar-do-zeca",
      slug: "bar-do-zeca",
      nome: "Bar do Zeca",
      cidade: "Belo Horizonte",
      bairro: "Savassi",
      endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
      telefone: "(31) 3333-1111",
      horario: "Seg a Sáb, 18h às 23h",
      petiscoNome: "Bolinho da Casa",
      petiscoDesc: "Bolinho crocante de carne com molho da casa.",
      fotoUrl: null,
    });
    getButecoActionStateMock.mockResolvedValue({
      isAuthenticated: false,
      isFavorito: false,
      isVisitado: false,
      loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
    });

    render(await ButecoPage({ params: Promise.resolve({ slug: "bar-do-zeca" }) }));

    expect(screen.getByRole("heading", { name: "Bar do Zeca" })).toBeVisible();
    expect(screen.getByText("Savassi, Belo Horizonte")).toBeVisible();
    expect(screen.getByText("Rua dos Testes, 123 - Savassi, Belo Horizonte - MG")).toBeVisible();
    expect(screen.getByTestId("buteco-action-panel")).toHaveTextContent(
      JSON.stringify({
        butecoId: "fixture-bar-do-zeca",
        loginHref: "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca",
        isAuthenticated: false,
        initialIsFavorito: false,
        initialIsVisitado: false,
      })
    );
    expect(getButecoActionStateMock).toHaveBeenCalledWith({
      butecoId: "fixture-bar-do-zeca",
      slug: "bar-do-zeca",
    });
  });

  it("delegates to notFound when the buteco does not exist", async () => {
    getButecoBySlugMock.mockResolvedValue(null);

    await ButecoPage({ params: Promise.resolve({ slug: "inexistente" }) });

    expect(notFoundMock).toHaveBeenCalled();
    expect(getButecoActionStateMock).not.toHaveBeenCalled();
  });
});
