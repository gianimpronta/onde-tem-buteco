export const E2E_AUTH_COOKIE = "onde-tem-buteco-e2e-auth";
export const E2E_FAVORITOS_COOKIE = "onde-tem-buteco-e2e-favoritos";
export const E2E_VISITAS_COOKIE = "onde-tem-buteco-e2e-visitas";

export function parseE2ECookieList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const candidates = [value];

  try {
    candidates.push(decodeURIComponent(value));
  } catch {}

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;

      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {}
  }

  return [];
}

export function toE2ECookieValue(values: string[]): string {
  return encodeURIComponent(JSON.stringify(values));
}
