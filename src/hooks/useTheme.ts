import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "theme_mode";

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "light";
}

function applyThemeClass(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredTheme);

  const handleThemeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(STORAGE_KEY, mode);
    applyThemeClass(mode);
  }, []);

  // Apply theme on mount
  useEffect(() => {
    applyThemeClass(themeMode);
  }, [themeMode]);

  return {
    themeMode,
    setThemeMode: handleThemeChange,
    isDark: themeMode === "dark",
    isLight: themeMode === "light",
  };
}
