"use client";

import dynamic from "next/dynamic";

const MapaButecos = dynamic(
  () => import("@/components/mapa/mapa-butecos").then((module) => module.MapaButecos),
  {
    ssr: false,
  }
);

type ButecoMapa = {
  slug: string;
  nome: string;
  bairro: string | null;
  lat: number;
  lng: number;
};

type MapaButecosShellProps = {
  butecos: ButecoMapa[];
};

export function MapaButecosShell({ butecos }: Readonly<MapaButecosShellProps>) {
  return <MapaButecos butecos={butecos} />;
}
