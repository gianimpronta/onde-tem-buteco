"use client";

import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  if (butecos.length === 0) {
    return (
      <div className="flex min-h-[42vh] w-full flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm sm:min-h-[48vh]">
        <p className="text-xl font-bold text-zinc-900 sm:text-2xl">Mapa em atualização</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
          Ainda não existem botecos com geolocalização disponível. Enquanto isso, você já pode conferir a lista
          completa dos participantes.
        </p>
        <Link
          href="/butecos"
          className="mt-6 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600"
        >
          Ver lista de botecos
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
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
                <p className="font-semibold">{buteco.nome}</p>
                <p className="text-sm text-zinc-600">{buteco.bairro ?? "Bairro não informado"}</p>
                <Link href={`/butecos/${buteco.slug}`} className="text-sm text-amber-700 hover:underline">
                  Ver detalhes
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
