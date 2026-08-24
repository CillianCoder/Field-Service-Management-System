"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

const THEME_STORAGE_KEY = "fieldflow-theme";
type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  const nextThemeLabel = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextThemeLabel} mode`}
      className="text-muted hover:bg-surface hover:text-foreground grid size-10 place-items-center transition-colors"
      onClick={toggleTheme}
      suppressHydrationWarning
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
