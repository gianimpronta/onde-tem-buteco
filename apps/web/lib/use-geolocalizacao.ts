"use client";

import { useCallback, useEffect, useState } from "react";
import { resolveGeolocationStartup } from "@/lib/geolocalizacao";

type Coordenadas = { lat: number; lng: number };

type GeolocalizacaoState = {
  coords: Coordenadas | null;
  carregando: boolean;
  erro: string | null;
  buscar: () => void;
};

export function useGeolocalizacao(): GeolocalizacaoState {
  const [coords, setCoords] = useState<Coordenadas | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(() => {
    if (!navigator.geolocation) {
      setErro("Geolocalização não é suportada pelo seu navegador.");
      return;
    }

    setCarregando(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setCarregando(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setErro("Permissão negada. Verifique as configurações do seu navegador.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErro("Localização indisponível. Verifique se o GPS está ativado.");
        } else if (error.code === error.TIMEOUT) {
          setErro("Tempo esgotado ao obter localização. Tente novamente.");
        } else {
          setErro("Não foi possível obter sua localização.");
        }
        setCarregando(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    let active = true;

    async function startup() {
      const geolocationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;
      const permissionsApi = navigator.permissions?.query;

      if (!permissionsApi) {
        const fallback = resolveGeolocationStartup({
          geolocationSupported,
          permissionState: geolocationSupported ? "prompt" : null,
        });

        if (!active) return;
        if (fallback.errorMessage) setErro(fallback.errorMessage);
        if (fallback.shouldRequestLocation) buscar();
        return;
      }

      try {
        const permission = await permissionsApi({ name: "geolocation" });
        if (!active) return;

        const decision = resolveGeolocationStartup({
          geolocationSupported,
          permissionState: permission.state,
        });

        if (decision.errorMessage) setErro(decision.errorMessage);
        if (decision.shouldRequestLocation) buscar();
      } catch {
        if (!active) return;
        const fallback = resolveGeolocationStartup({
          geolocationSupported,
          permissionState: geolocationSupported ? "prompt" : null,
        });
        if (fallback.errorMessage) setErro(fallback.errorMessage);
        if (fallback.shouldRequestLocation) buscar();
      }
    }

    void startup();

    return () => {
      active = false;
    };
  }, [buscar]);

  return { coords, carregando, erro, buscar };
}
