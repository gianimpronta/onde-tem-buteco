export type GeolocationPermissionState = PermissionState | null;

export function resolveGeolocationStartup(input: {
  geolocationSupported: boolean;
  permissionState: GeolocationPermissionState;
}) {
  if (!input.geolocationSupported) {
    return {
      shouldRequestLocation: false,
      errorMessage: "Geolocalização não é suportada pelo seu navegador.",
    };
  }

  if (input.permissionState === "denied") {
    return {
      shouldRequestLocation: false,
      errorMessage: "Localização indisponível. Você ainda pode explorar o mapa manualmente.",
    };
  }

  return {
    shouldRequestLocation: true,
    errorMessage: null,
  };
}
