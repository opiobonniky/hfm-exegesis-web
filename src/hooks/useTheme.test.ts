import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme } from "./useTheme";

const STORAGE_KEY = "theme_mode";

function setStoredTheme(mode: string) {
  localStorage.setItem(STORAGE_KEY, mode);
}

function clearStoredTheme() {
  localStorage.removeItem(STORAGE_KEY);
}

function getHtmlClasses(): string[] {
  return Array.from(document.documentElement.classList);
}

describe("useTheme", () => {
  beforeEach(() => {
    clearStoredTheme();
    document.documentElement.className = "";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Initialization ─────────────────────────

  describe("initialization", () => {
    it("defaults to 'light' when nothing is stored", () => {
      const { result } = renderHook(() => useTheme());
      expect(result.current.themeMode).toBe("light");
    });

    it("reads stored dark theme from localStorage", () => {
      setStoredTheme("dark");
      const { result } = renderHook(() => useTheme());
      expect(result.current.themeMode).toBe("dark");
    });

    it("reads stored light theme from localStorage", () => {
      setStoredTheme("light");
      const { result } = renderHook(() => useTheme());
      expect(result.current.themeMode).toBe("light");
    });

    it("falls back to 'light' for invalid stored values", () => {
      localStorage.setItem(STORAGE_KEY, "cathedral");
      const { result } = renderHook(() => useTheme());
      expect(result.current.themeMode).toBe("light");
    });
  });

  // ── applyThemeClass on mount ───────────────

  describe("applyThemeClass on mount", () => {
    it("adds 'dark' class when stored theme is dark", () => {
      setStoredTheme("dark");
      renderHook(() => useTheme());
      expect(getHtmlClasses()).toContain("dark");
    });

    it("does not add 'dark' class when stored theme is light", () => {
      setStoredTheme("light");
      renderHook(() => useTheme());
      expect(getHtmlClasses()).not.toContain("dark");
    });

    it("removes 'dark' when switching from dark to light on mount", () => {
      document.documentElement.classList.add("dark");
      setStoredTheme("light");
      renderHook(() => useTheme());
      expect(getHtmlClasses()).not.toContain("dark");
    });
  });

  // ── localStorage persistence ───────────────

  describe("localStorage persistence", () => {
    it("writes dark to localStorage on switch", () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setThemeMode("dark");
      });
      expect(localStorage.getItem(STORAGE_KEY)).toBe("dark");
    });

    it("writes light to localStorage on switch", () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setThemeMode("light");
      });
      expect(localStorage.getItem(STORAGE_KEY)).toBe("light");
    });
  });

  // ── Theme switching ────────────────────────

  describe("theme switching", () => {
    it("updates themeMode state when switching to dark", () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setThemeMode("dark");
      });
      expect(result.current.themeMode).toBe("dark");
    });

    it("applies 'dark' class when switching to dark", () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setThemeMode("dark");
      });
      expect(getHtmlClasses()).toContain("dark");
    });

    it("removes 'dark' class when switching to light", () => {
      const { result } = renderHook(() => useTheme());
      act(() => {
        result.current.setThemeMode("dark");
      });
      expect(getHtmlClasses()).toContain("dark");
      act(() => {
        result.current.setThemeMode("light");
      });
      expect(getHtmlClasses()).not.toContain("dark");
    });
  });

  // ── Boolean helpers ────────────────────────

  describe("boolean helpers", () => {
    it("isDark is true when theme is dark", () => {
      setStoredTheme("dark");
      const { result } = renderHook(() => useTheme());
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it("isLight is true when theme is light", () => {
      setStoredTheme("light");
      const { result } = renderHook(() => useTheme());
      expect(result.current.isLight).toBe(true);
      expect(result.current.isDark).toBe(false);
    });
  });

  // ── Edge cases ─────────────────────────────

  describe("edge cases", () => {
    it("handles rapid theme switching without errors", () => {
      const { result } = renderHook(() => useTheme());
      expect(() => {
        act(() => {
          result.current.setThemeMode("dark");
          result.current.setThemeMode("light");
          result.current.setThemeMode("dark");
        });
      }).not.toThrow();
    });
  });
});
