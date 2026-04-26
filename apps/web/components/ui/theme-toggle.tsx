"use client";

import { useEffect, useSyncExternalStore } from "react";
import { resolveInitialTheme, type ThemePreference } from "@/lib/theme";

function subscribeToThemeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("theme-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-changed", callback);
  };
}

function getThemeSnapshot(): ThemePreference {
  return resolveInitialTheme({
    storedTheme: (localStorage.getItem("theme") as ThemePreference | null) ?? null,
    systemPrefersDark: window.matchMedia("(prefers-color-scheme: dark)").matches,
  });
}

function getServerThemeSnapshot(): ThemePreference {
  return "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggle() {
    const nextTheme: ThemePreference = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");

    try {
      localStorage.setItem("theme", nextTheme);
      window.dispatchEvent(new CustomEvent("theme-changed"));
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="rounded-full border border-line p-2 text-ink-soft transition hover:border-tinto-700 hover:bg-mostarda-100 hover:text-tinto-700"
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
