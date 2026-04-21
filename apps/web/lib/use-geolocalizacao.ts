"use client";

import { useCallback, useState } from "react";

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
      { timeout: 10000, maximumAge: 60000 },
    );
  }, []);

  return { coords, carregando, erro, buscar };
}
