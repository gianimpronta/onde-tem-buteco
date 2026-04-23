export type ThemePreference = "dark" | "light";

export function resolveInitialTheme(input: {
  storedTheme: ThemePreference | null;
  systemPrefersDark: boolean;
}): ThemePreference {
  if (input.storedTheme) {
    return input.storedTheme;
  }

  return input.systemPrefersDark ? "dark" : "light";
}
