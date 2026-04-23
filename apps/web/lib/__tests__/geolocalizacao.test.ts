import { resolveGeolocationStartup } from "@/lib/geolocalizacao";

describe("resolveGeolocationStartup", () => {
  it("requests the current position immediately when permission is granted", () => {
    expect(
      resolveGeolocationStartup({
        geolocationSupported: true,
        permissionState: "granted",
      })
    ).toEqual({
      shouldRequestLocation: true,
      errorMessage: null,
    });
  });

  it("requests the current position when the browser still needs to prompt the user", () => {
    expect(
      resolveGeolocationStartup({
        geolocationSupported: true,
        permissionState: "prompt",
      })
    ).toEqual({
      shouldRequestLocation: true,
      errorMessage: null,
    });
  });

  it("keeps the site usable and returns a clear message when permission is denied", () => {
    expect(
      resolveGeolocationStartup({
        geolocationSupported: true,
        permissionState: "denied",
      })
    ).toEqual({
      shouldRequestLocation: false,
      errorMessage: "Localização indisponível. Você ainda pode explorar o mapa manualmente.",
    });
  });

  it("keeps the site usable when geolocation is unavailable", () => {
    expect(
      resolveGeolocationStartup({
        geolocationSupported: false,
        permissionState: null,
      })
    ).toEqual({
      shouldRequestLocation: false,
      errorMessage: "Geolocalização não é suportada pelo seu navegador.",
    });
  });
});
