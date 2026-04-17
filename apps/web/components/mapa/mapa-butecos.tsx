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
      <div className="h-[70vh] w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center text-zinc-500">
        Ainda não existem botecos com geolocalização disponível.
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      className="h-[70vh] w-full rounded-2xl"
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
  );
}
