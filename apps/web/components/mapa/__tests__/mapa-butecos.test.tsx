/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { MapaButecos } from "@/components/mapa/mapa-butecos";
import { MarcadorUsuario } from "@/components/mapa/marcador-usuario";
import { useGeolocalizacao } from "@/lib/use-geolocalizacao";

const setViewMock = jest.fn();

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

jest.mock("leaflet", () => ({
  Icon: {
    Default: {
      mergeOptions: jest.fn(),
    },
  },
  divIcon: jest.fn((options: unknown) => ({ type: "divIcon", options })),
}));

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: { children: React.ReactNode; position: [number, number] }) => (
    <div data-position={position.join(",")}>{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({ setView: setViewMock }),
}));

jest.mock("@/lib/use-geolocalizacao", () => ({
  useGeolocalizacao: jest.fn(),
}));

const useGeolocalizacaoMock = useGeolocalizacao as jest.Mock;

describe("MapaButecos", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGeolocalizacaoMock.mockReturnValue({
      coords: null,
      carregando: false,
      erro: null,
      buscar: jest.fn(),
    });
  });

  it("renderiza estado vazio com link para listagem", () => {
    render(<MapaButecos butecos={[]} />);

    expect(screen.getByText("Mapa em atualização")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver lista de botecos" })).toHaveAttribute(
      "href",
      "/butecos"
    );
  });

  it("renderiza marcadores e dispara busca de localização", () => {
    const buscar = jest.fn();
    useGeolocalizacaoMock.mockReturnValue({
      coords: null,
      carregando: false,
      erro: "Geolocalização indisponível",
      buscar,
    });

    render(
      <MapaButecos
        butecos={[
          {
            slug: "bar-do-zeca",
            nome: "Bar do Zeca",
            bairro: null,
            lat: -19.93,
            lng: -43.93,
          },
        ]}
      />
    );

    expect(screen.getByText("Geolocalização indisponível")).toBeInTheDocument();
    expect(screen.getByText("Bar do Zeca")).toBeInTheDocument();
    expect(screen.getByText("Bairro não informado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/butecos/bar-do-zeca"
    );

    fireEvent.click(screen.getByRole("button", { name: "Usar minha localização" }));

    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it("renderiza marcador do usuário quando há coordenadas", () => {
    useGeolocalizacaoMock.mockReturnValue({
      coords: { lat: -19.91, lng: -43.94 },
      carregando: true,
      erro: null,
      buscar: jest.fn(),
    });

    render(
      <MapaButecos
        butecos={[
          {
            slug: "bar-do-zeca",
            nome: "Bar do Zeca",
            bairro: "Savassi",
            lat: -19.93,
            lng: -43.93,
          },
        ]}
      />
    );

    expect(screen.getByText("Usando sua localização para destacar o mapa.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Usar minha localização" })).toBeDisabled();
    expect(screen.getByText("Você está aqui")).toBeInTheDocument();
  });
});

describe("MarcadorUsuario", () => {
  it("centraliza mapa na localização do usuário", () => {
    render(<MarcadorUsuario coords={{ lat: -19.91, lng: -43.94 }} />);

    expect(setViewMock).toHaveBeenCalledWith([-19.91, -43.94], 15);
    expect(screen.getByText("Você está aqui")).toBeInTheDocument();
  });
});
