/** @jest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useGeolocalizacao } from "@/lib/use-geolocalizacao";

const originalGeolocation = navigator.geolocation;
const originalPermissions = navigator.permissions;

function setNavigatorProperty<K extends keyof Navigator>(key: K, value: Navigator[K] | undefined) {
  Object.defineProperty(navigator, key, {
    configurable: true,
    value,
  });
}

function makePosition(latitude: number, longitude: number): GeolocationPosition {
  return {
    coords: {
      accuracy: 1,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      latitude,
      longitude,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

function makePositionError(code: number): GeolocationPositionError {
  return {
    code,
    message: "Erro de geolocalizacao",
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  };
}

function mockPermissions(state: PermissionState) {
  const query = jest.fn<ReturnType<Permissions["query"]>, Parameters<Permissions["query"]>>(() =>
    Promise.resolve({ state } as PermissionStatus)
  );

  setNavigatorProperty("permissions", { query } as Permissions);

  return query;
}

function mockGeolocation() {
  const getCurrentPosition = jest.fn<
    ReturnType<Geolocation["getCurrentPosition"]>,
    Parameters<Geolocation["getCurrentPosition"]>
  >();
  const watchPosition = jest.fn<
    ReturnType<Geolocation["watchPosition"]>,
    Parameters<Geolocation["watchPosition"]>
  >(() => 1);
  const clearWatch = jest.fn<
    ReturnType<Geolocation["clearWatch"]>,
    Parameters<Geolocation["clearWatch"]>
  >();

  setNavigatorProperty("geolocation", {
    clearWatch,
    getCurrentPosition,
    watchPosition,
  } as Geolocation);

  return getCurrentPosition;
}

describe("useGeolocalizacao", () => {
  afterEach(() => {
    jest.clearAllMocks();
    setNavigatorProperty("geolocation", originalGeolocation);
    setNavigatorProperty("permissions", originalPermissions);
  });

  it("requests the position on startup when permission is prompt and stores coordinates", async () => {
    const getCurrentPosition = mockGeolocation();
    mockPermissions("prompt");

    getCurrentPosition.mockImplementation((onSuccess) => {
      onSuccess(makePosition(-19.93, -43.94));
    });

    const { result } = renderHook(() => useGeolocalizacao());

    await waitFor(() => expect(result.current.coords).toEqual({ lat: -19.93, lng: -43.94 }));
    expect(result.current.erro).toBeNull();
    expect(result.current.carregando).toBe(false);
  });

  it("shows a startup message when geolocation is unsupported", async () => {
    setNavigatorProperty("geolocation", undefined);
    setNavigatorProperty("permissions", undefined);

    const { result } = renderHook(() => useGeolocalizacao());

    await waitFor(() =>
      expect(result.current.erro).toBe(
        "Geolocaliza\u00e7\u00e3o n\u00e3o \u00e9 suportada pelo seu navegador."
      )
    );
  });

  it("does not request the position when permission is denied", async () => {
    const getCurrentPosition = mockGeolocation();
    mockPermissions("denied");

    const { result } = renderHook(() => useGeolocalizacao());

    await waitFor(() =>
      expect(result.current.erro).toBe(
        "Localiza\u00e7\u00e3o indispon\u00edvel. Voc\u00ea ainda pode explorar o mapa manualmente."
      )
    );
    expect(getCurrentPosition).not.toHaveBeenCalled();
  });

  it("maps manual lookup failures to a clear error message", async () => {
    const getCurrentPosition = mockGeolocation();
    mockPermissions("denied");

    getCurrentPosition.mockImplementation((_onSuccess, onError) => {
      onError?.(makePositionError(3));
    });

    const { result } = renderHook(() => useGeolocalizacao());

    await waitFor(() => expect(result.current.erro).not.toBeNull());

    act(() => {
      result.current.buscar();
    });

    await waitFor(() =>
      expect(result.current.erro).toBe(
        "Tempo esgotado ao obter localiza\u00e7\u00e3o. Tente novamente."
      )
    );
  });
});
