/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ButecoActionPanel from "@/components/butecos/buteco-action-panel";

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

describe("ButecoActionPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it("renders a clear login CTA for anonymous users", () => {
    render(
      <ButecoActionPanel
        butecoId="fixture-bar-do-zeca"
        loginHref="/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca"
        isAuthenticated={false}
        initialIsFavorito={false}
        initialIsVisitado={false}
      />
    );

    expect(
      screen.getByRole("link", { name: "Faça login para favoritar e registrar visita" })
    ).toHaveAttribute("href", "/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca");
    expect(screen.queryByRole("button", { name: "Favoritar" })).not.toBeInTheDocument();
  });

  it("toggles favorite state after a successful mutation", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(
      <ButecoActionPanel
        butecoId="fixture-bar-do-zeca"
        loginHref="/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca"
        isAuthenticated={true}
        initialIsFavorito={false}
        initialIsVisitado={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Favoritar" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/butecos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          butecoId: "fixture-bar-do-zeca",
          action: "favoritar",
        }),
      })
    );

    expect(await screen.findByText("Buteco adicionado aos favoritos.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();
  });

  it("marks the buteco as visited and disables the visit button", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(
      <ButecoActionPanel
        butecoId="fixture-bar-do-zeca"
        loginHref="/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca"
        isAuthenticated={true}
        initialIsFavorito={false}
        initialIsVisitado={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Marcar como visitado" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/butecos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          butecoId: "fixture-bar-do-zeca",
          action: "visitar",
        }),
      })
    );

    expect(await screen.findByText("Visita registrada com sucesso.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Visitado" })).toBeDisabled();
  });

  it("shows an inline error when the mutation fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Não foi possível atualizar a ação." }),
    });

    render(
      <ButecoActionPanel
        butecoId="fixture-bar-do-zeca"
        loginHref="/login?callbackUrl=%2Fbutecos%2Fbar-do-zeca"
        isAuthenticated={true}
        initialIsFavorito={true}
        initialIsVisitado={false}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Remover dos favoritos" }));

    expect(await screen.findByText("Não foi possível atualizar a ação.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Remover dos favoritos" })).toBeVisible();
  });
});
