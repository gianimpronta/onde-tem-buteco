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

type GeolocationDecision = ReturnType<typeof resolveGeolocationStartup>;

function getPositionErrorMessage(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) {
    return "Permiss\u00e3o negada. Verifique as configura\u00e7\u00f5es do seu navegador.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Localiza\u00e7\u00e3o indispon\u00edvel. Verifique se o GPS est\u00e1 ativado.";
  }

  if (error.code === error.TIMEOUT) {
    return "Tempo esgotado ao obter localiza\u00e7\u00e3o. Tente novamente.";
  }

  return "N\u00e3o foi poss\u00edvel obter sua localiza\u00e7\u00e3o.";
}

function resolveFallbackDecision(geolocationSupported: boolean): GeolocationDecision {
  return resolveGeolocationStartup({
    geolocationSupported,
    permissionState: geolocationSupported ? "prompt" : null,
  });
}

async function resolveStartupDecision(geolocationSupported: boolean): Promise<GeolocationDecision> {
  if (!navigator.permissions?.query) {
    return resolveFallbackDecision(geolocationSupported);
  }

  try {
    const permission = await navigator.permissions.query({ name: "geolocation" });

    return resolveGeolocationStartup({
      geolocationSupported,
      permissionState: permission.state,
    });
  } catch {
    return resolveFallbackDecision(geolocationSupported);
  }
}

export function useGeolocalizacao(): GeolocalizacaoState {
  const [coords, setCoords] = useState<Coordenadas | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const buscar = useCallback(() => {
    if (!navigator.geolocation) {
      setErro("Geolocaliza\u00e7\u00e3o n\u00e3o \u00e9 suportada pelo seu navegador.");
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
        setErro(getPositionErrorMessage(error));
        setCarregando(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    let active = true;

    async function startup() {
      const geolocationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;
      const decision = await resolveStartupDecision(geolocationSupported);

      if (!active) return;
      if (decision.errorMessage) setErro(decision.errorMessage);
      if (decision.shouldRequestLocation) buscar();
    }

    void startup();

    return () => {
      active = false;
    };
  }, [buscar]);

  return { coords, carregando, erro, buscar };
}
