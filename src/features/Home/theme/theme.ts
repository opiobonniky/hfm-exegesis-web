// Home feature theme tokens
import type { CSSProperties } from "react";

export const homeTheme = {
  colors: {
    accent: {
      "dashboard": "primary",
      "activity": "accent",
      "stats": "blue"
},
    status: {
      active: "hsl(142 76% 36%)",
      inactive: "hsl(var(--muted-foreground))",
      error: "hsl(var(--destructive))",
      warning: "hsl(var(--warning))",
    },
  },
  typography: {
    heading: "font-heading",
    body: "font-body",
    sizes: {
      stat: "text-2xl sm:text-3xl font-bold",
      title: "text-xl sm:text-2xl font-bold",
      subtitle: "text-sm sm:text-base font-medium",
      caption: "text-xs text-muted-foreground",
    },
  },
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-6",
    card: "p-4 sm:p-6",
    grid: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    },
  },
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    dropdown: "shadow-xl border border-border",
  },
  components: {
    statCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    tableRow: "border-b border-border hover:bg-muted/50 transition-colors",
  },
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
  },
} as const;

export type HomeTheme = typeof homeTheme;
