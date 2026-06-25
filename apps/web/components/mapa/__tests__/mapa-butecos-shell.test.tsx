/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { MapaButecosShell } from "@/components/mapa/mapa-butecos-shell";

jest.mock("next/dynamic", () => {
  return function mockDynamic() {
    return function DynamicMapa({ butecos }: { butecos: Array<{ nome: string; slug: string }> }) {
      return (
        <div data-testid="dynamic-mapa">{butecos.map((buteco) => buteco.nome).join(", ")}</div>
      );
    };
  };
});

describe("MapaButecosShell", () => {
  it("encaminha butecos para o mapa dinâmico", () => {
    render(
      <MapaButecosShell
        butecos={[
          { slug: "bar-do-zeca", nome: "Bar do Zeca", bairro: "Savassi", lat: -19.93, lng: -43.93 },
        ]}
      />
    );

    expect(screen.getByTestId("dynamic-mapa")).toHaveTextContent("Bar do Zeca");
  });
});
