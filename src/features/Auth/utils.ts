import type { Translations } from "@/components/languages/type";

export const hexToRgba = (hex: string, alpha = 1) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const bigint = parseInt(full, 16);
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
};

export const landingCopy = (t: Translations | undefined, key: string, fallback: string): string => {
  const value = (t?.landing as Record<string, string | undefined> | undefined)?.[key];
  return value ?? fallback;
};

export const scrollToSectionId = (sectionId: string): boolean => {
  if (typeof document === "undefined") return false;
  const element = document.getElementById(sectionId);
  if (!element) return false;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
};