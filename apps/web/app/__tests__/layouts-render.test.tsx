/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";
import PublicLayout from "@/app/(public)/layout";
import PrivateLayout from "@/app/(private)/layout";

jest.mock("next/font/google", () => ({
  Familjen_Grotesk: () => ({ variable: "--font-familjen-grotesk" }),
  Inter_Tight: () => ({ variable: "--font-inter-tight" }),
  DM_Mono: () => ({ variable: "--font-dm-mono" }),
}));

jest.mock("@vercel/analytics/next", () => ({
  Analytics: () => <div data-testid="analytics" />,
}));

jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => <div data-testid="speed-insights" />,
}));

jest.mock("@/components/ui/header", () => ({
  __esModule: true,
  default: () => <header>Header mock</header>,
}));

jest.mock("@/components/ui/bottom-nav", () => ({
  BottomNav: () => <nav>Bottom nav mock</nav>,
}));

describe("layouts", () => {
  it("RootLayout renderiza children e scripts de instrumentação", () => {
    const element = RootLayout({
      children: <main>Conteúdo</main>,
    }) as React.ReactElement<{
      lang: string;
      className: string;
      children: React.ReactElement[];
    }>;

    expect(element.type).toBe("html");
    expect(element.props.lang).toBe("pt-BR");
    expect(element.props.className).toContain("--font-familjen-grotesk");
    expect(element.props.children[0].type).toBe("head");
    expect(element.props.children[1].type).toBe("body");
  });

  it("PublicLayout renderiza header, conteúdo e navegação inferior", () => {
    render(
      <PublicLayout>
        <main>Área pública</main>
      </PublicLayout>
    );

    expect(screen.getByText("Header mock")).toBeInTheDocument();
    expect(screen.getByText("Área pública")).toBeInTheDocument();
    expect(screen.getByText("Bottom nav mock")).toBeInTheDocument();
  });

  it("PrivateLayout renderiza header e conteúdo privado", () => {
    render(
      <PrivateLayout>
        <main>Área privada</main>
      </PrivateLayout>
    );

    expect(screen.getByText("Header mock")).toBeInTheDocument();
    expect(screen.getByText("Área privada")).toBeInTheDocument();
  });
});
