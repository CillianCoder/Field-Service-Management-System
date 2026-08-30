"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "fieldflow-theme";
type Theme = "light" | "dark";

const themeSubscribers = new Set<() => void>();

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToTheme(callback: () => void) {
  themeSubscribers.add(callback);
  return () => {
    themeSubscribers.delete(callback);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  themeSubscribers.forEach((callback) => callback());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    () => "light" as Theme,
  );

  function toggleTheme() {
    applyTheme(theme === "dark" ? "light" : "dark");
  }

  const nextThemeLabel = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextThemeLabel} mode`}
      className="text-muted hover:bg-surface hover:text-foreground grid size-10 place-items-center transition-colors"
      onClick={toggleTheme}
      title={`Switch to ${nextThemeLabel} mode`}
      type="button"
    >
      {theme === "dark" ? (
        <Sun aria-hidden="true" className="size-5" />
      ) : (
        <Moon aria-hidden="true" className="size-5" />
      )}
    </button>
  );
}
