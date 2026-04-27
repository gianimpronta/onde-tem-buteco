"use client";

import { useGeolocalizacao } from "@/lib/use-geolocalizacao";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { MarcadorUsuario } from "./marcador-usuario";

const defaultCenter: [number, number] = [-19.9167, -43.9345];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type ButecoMapa = {
  slug: string;
  nome: string;
  bairro: string | null;
  lat: number;
  lng: number;
};

type MapaButecosProps = {
  butecos: ButecoMapa[];
};

export function MapaButecos({ butecos }: Readonly<MapaButecosProps>) {
  const { coords, carregando, erro, buscar } = useGeolocalizacao();

  if (butecos.length === 0) {
    return (
      <div className="flex min-h-[42vh] w-full flex-col items-center justify-center rounded-[14px] border border-line-soft bg-surface-alt px-6 py-12 text-center shadow-warm-sm sm:min-h-[48vh]">
        <p className="font-display text-[22px] font-bold text-ink sm:text-[26px]">
          Mapa em atualização
        </p>
        <p className="mt-3 max-w-xl font-body text-[14px] leading-relaxed text-ink-soft sm:text-[15px]">
          Ainda não existem botecos com geolocalização disponível. Enquanto isso, você já pode
          conferir a lista completa dos participantes.
        </p>
        <Link
          href="/butecos"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[14px] font-medium text-primary-ink transition hover:bg-terracota-600"
        >
          Ver lista de botecos
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[14px] border border-line-soft bg-surface-alt shadow-warm-sm">
      {erro && (
        <div className="flex items-center gap-2 border-b border-line-soft bg-terracota-100 px-4 py-2.5 font-body text-[13px] text-tinto-700 dark:bg-surface-alt dark:text-danger">
          <span aria-hidden="true">⚠</span>
          {erro}
        </div>
      )}
      {coords && !erro && (
        <div className="flex items-center gap-2 border-b border-line-soft bg-mostarda-100 px-4 py-2.5 font-body text-[13px] text-mostarda-700 dark:bg-surface-alt dark:text-accent">
          <span aria-hidden="true">📍</span>
          Usando sua localização para destacar o mapa.
        </div>
      )}
      <div className="relative">
        <button
          onClick={buscar}
          disabled={carregando}
          aria-label="Usar minha localização"
          className="absolute right-3 top-3 z-[1000] flex items-center gap-1.5 rounded-full bg-surface-alt px-3 py-1.5 font-body text-[12px] font-medium text-ink-soft shadow-warm transition hover:bg-cream-100 dark:hover:bg-surface disabled:cursor-wait disabled:opacity-70"
        >
          <span aria-hidden="true">{carregando ? "⏳" : "📍"}</span>
          {carregando ? "Localizando..." : "Usar minha localização"}
        </button>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          className="h-[52vh] w-full sm:h-[65vh]"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {butecos.map((buteco) => (
            <Marker key={buteco.slug} position={[buteco.lat, buteco.lng]}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-display font-semibold text-ink">{buteco.nome}</p>
                  <p className="font-mono text-[12px] text-ink-muted">
                    {buteco.bairro ?? "Bairro não informado"}
                  </p>
                  <Link
                    href={`/butecos/${buteco.slug}`}
                    className="font-body text-[13px] font-medium text-brand hover:underline"
                  >
                    Ver detalhes
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
          {coords && <MarcadorUsuario coords={coords} />}
        </MapContainer>
      </div>
    </div>
  );
}
