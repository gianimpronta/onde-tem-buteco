"use client";

import L from "leaflet";
import { useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";

const iconeUsuario = L.divIcon({
  className: "",
  html: '<div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(37,99,235,0.5)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type MarcadorUsuarioProps = {
  coords: { lat: number; lng: number };
};

export function MarcadorUsuario({ coords }: Readonly<MarcadorUsuarioProps>) {
  const map = useMap();

  useEffect(() => {
    map.setView([coords.lat, coords.lng], 15);
  }, [map, coords]);

  return (
    <Marker position={[coords.lat, coords.lng]} icon={iconeUsuario}>
      <Popup>
        <p className="text-sm font-semibold">Você está aqui</p>
      </Popup>
    </Marker>
  );
}
