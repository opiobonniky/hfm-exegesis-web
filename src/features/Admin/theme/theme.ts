// Admin feature theme tokens — dashboard, user management, study tools
import type { CSSProperties } from "react";

export const adminTheme = {
  // Feature-specific accent colors (extends base palette)
  colors: {
    accent: {
      dashboard: "hsl(var(--primary))",
      users: "hsl(var(--accent))",
      study: "hsl(142 76% 36%)",
      warning: "hsl(var(--warning))",
    },
    status: {
      active: "hsl(142 76% 36%)",
      inactive: "hsl(var(--muted-foreground))",
      banned: "hsl(var(--destructive))",
      pending: "hsl(var(--warning))",
    chart: {
      blue: "hsl(212 63% 56%)",
      gold: "hsl(38 80% 45%)",
      green: "hsl(142 76% 36%)",
      red: "hsl(0 84% 60%)",
  },
  // Typography presets
  typography: {
    heading: "font-heading",
    body: "font-body",
    sizes: {
      stat: "text-2xl sm:text-3xl font-bold",
      title: "text-xl sm:text-2xl font-bold",
      subtitle: "text-sm sm:text-base font-medium",
      caption: "text-xs text-muted-foreground",
  // Spacing scale (consistent across admin pages)
  spacing: {
    page: "p-4 sm:p-6 lg:p-8",
    section: "space-y-6",
    card: "p-4 sm:p-6",
    grid: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  // Elevation tokens
  shadows: {
    card: "shadow-sm border border-border",
    elevated: "shadow-lg border border-border",
    dropdown: "shadow-xl border border-border",
  // Component-specific styles
  components: {
    statCard: "bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-border",
    tableRow: "border-b border-border hover:bg-muted/50 transition-colors",
    sidebar: "bg-card border-r border-border",
  // Transition timing
  transition: {
    fast: "duration-150",
    normal: "duration-200",
    slow: "duration-300",
} as const;
export type AdminTheme = typeof adminTheme;
