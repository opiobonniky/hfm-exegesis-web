# Theme Audit — Exegesis Web App

> **Last updated:** July 27, 2026
> **Scope:** All pages under `web/src/pages/` and `web/src/components/`

---

## 1. Theme Architecture

### Initialization Chain

```
Browser loads page
       ↓
ThemeInitializer (App.tsx) — calls useTheme()
       ↓
useTheme() reads localStorage('theme_mode')
       ↓
Applies class to <html>: "light" | "dark" | "cathedral" | ""
       ↓
CSS variables in index.css respond to class selector
       ↓
Tailwind utility classes (bg-background, text-foreground, etc.) resolve via hsl(var(--variable))
```

### Component Tree

```
<BrowserRouter>
  <ThemeInitializer />           ← Sets <html> class before anything renders
  <AuthProvider>
    <LanguageProvider>
      <TooltipProvider>
        <AppRoutes>
          ├── Public routes (standalone — no layout wrapper)
          │   ├── /login          → Login.tsx
          │   ├── /register       → Register.tsx
          │   ├── /forgot-password → ForgotPassword.tsx
          │   ├── /verify-account → VerifyAccount.tsx
          │   ├── /onboarding     → Onboarding.tsx
          │   └── /               → Landing.tsx (brand-styled)
          │
          ├── PublicLayout routes (HimFirstMedia — brand-styled)
          │   ├── /who-we-are     → PublicLayout > WhoWeAre.tsx
          │   ├── /our-vision     → PublicLayout > OurVision.tsx
          │   ├── /our-mission    → PublicLayout > OurMission.tsx
          │   ├── /our-goals      → PublicLayout > OurGoals.tsx
          │   ├── /leadership     → PublicLayout > Leadership.tsx
          │   └── /founders       → PublicLayout > Founders.tsx
          │
          ├── Protected routes (with AppLayout = sidebar)
          │   └── [All logged-in pages — Bible, Journal, Dashboard, etc.]
          │
          └── 404 → NotFound.tsx
```

### Theme Class Application

The `useTheme` hook (`web/src/hooks/useTheme.ts`):

- Reads `localStorage.theme_mode` (default: `"system"`)
- `applyThemeClass(theme)`:
  - Removes `"light"`, `"dark"`, `"cathedral"` from `<html>`
  - Adds the chosen theme class
  - If `"system"`: checks `prefers-color-scheme`, defaults to `"cathedral"` for dark, `"light"` otherwise
- Listens to `prefers-color-scheme` changes when in `"system"` mode
- Returns `{ themeMode, setThemeMode, isCathedral, isDark, isLight, isSystem }`

---

## 2. CSS Variable Definitions

All variables are defined in `web/src/index.css` under `@layer base {}`.

### Theme Selectors

| Mode | CSS Selector | Applied When |
|------|-------------|-------------|
| Light | `:root` | Default, or user selects "Light" |
| Dark | `.dark` | User selects "Dark", or system preference on "System" |
| Cathedral | `.cathedral` | User selects "Cathedral", or system dark preference on "System" |

### Full Variable Matrix

| Variable | Light `:root` | Dark `.dark` | Cathedral `.cathedral` |
|----------|:-------------:|:------------:|:----------------------:|
| `--background` | `220 45% 97%` | `222 47% 5%` | `248 30% 5%` |
| `--foreground` | `222 47% 6%` | `214 29% 90%` | `40 30% 88%` |
| `--card` | `0 0% 100%` | `222 35% 9%` | `248 25% 9%` |
| `--card-foreground` | `222 47% 6%` | `214 29% 90%` | `40 30% 88%` |
| `--popover` | `0 0% 100%` | `222 35% 9%` | `248 25% 9%` |
| `--popover-foreground` | `222 47% 6%` | `214 29% 90%` | `40 30% 88%` |
| `--primary` | `203 31% 35%` | `212 63% 56%` | `42 70% 55%` |
| `--primary-foreground` | `0 0% 100%` | `222 47% 5%` | `248 30% 5%` |
| `--secondary` | `220 14% 96%` | `220 26% 14%` | `248 20% 12%` |
| `--secondary-foreground` | `203 31% 35%` | `214 29% 90%` | `40 20% 80%` |
| `--muted` | `220 14% 96%` | `220 26% 14%` | `248 20% 12%` |
| `--muted-foreground` | `220 9% 46%` | `214 29% 63%` | `40 20% 60%` |
| `--accent` | `38 80% 45%` | `40 70% 78%` | `42 70% 55%` |
| `--accent-foreground` | `222 47% 6%` | `222 47% 5%` | `248 30% 5%` |
| `--destructive` | `0 84% 60%` | `0 63% 31%` | `0 63% 40%` |
| `--border` | `220 20% 83%` | `217 33% 17%` | `42 20% 20%` |
| `--input` | `220 20% 83%` | `217 33% 17%` | `42 20% 20%` |
| `--ring` | `203 31% 35%` | `212 63% 56%` | `42 70% 55%` |
| `--sidebar-background` | `220 14% 98%` | `240 6% 10%` | `248 25% 7%` |
| `--sidebar-foreground` | `220 9% 46%` | `240 5% 96%` | `40 20% 80%` |
| `--sidebar-primary` | `203 31% 35%` | `212 63% 56%` | `42 70% 55%` |
| `--sidebar-accent` | `220 14% 96%` | `240 4% 16%` | `248 20% 12%` |
| `--sidebar-border` | `220 20% 83%` | `240 4% 16%` | `42 20% 18%` |
| `--radius` | `0.75rem` | `0.75rem` | `0.75rem` |

### Cathedral Theme Characteristics

- **Hue 248 (purple)** for backgrounds, cards, and sidebars
- **Hue 42 (gold)** for primary elements, accents, borders, and rings
- **5% lightness** on background (nearly black with purple tint)
- **9-12% lightness** on cards and muted areas
- **88% lightness** on foreground (warm gold-cream text)
- Font family for headings in cathedral mode: `'Cinzel'` (serif) → `--font-heading`

---

## 3. Tailwind Class Mapping Guide

Convert hardcoded structural colors to CSS variable classes:

### Backgrounds

| Old Class | Replacement | Notes |
|-----------|-------------|-------|
| `bg-white` | `bg-card` | Card/container backgrounds |
| `bg-slate-50` | `bg-muted` | Subtle section backgrounds |
| `bg-slate-100` | `bg-muted` | Medium subtle backgrounds |
| `bg-slate-200` | `bg-muted` | Used in subtle sections |
| `bg-stone-50` | `bg-muted` | Same as slate variant |
| `bg-stone-100` | `bg-muted` | Same as slate variant |

### Borders

| Old Class | Replacement | Notes |
|-----------|-------------|-------|
| `border-slate-200` | `border-border` | Standard structural borders |
| `border-slate-300` | `border-border` | Stronger borders |
| `border-slate-100` | `border-border/50` | Subtle dividers |
| `border-stone-200` | `border-border` | Same as slate variant |
| `border-stone-300` | `border-border` | Same as slate variant |

### Text

| Old Class | Replacement | Notes |
|-----------|-------------|-------|
| `text-slate-900` / `text-slate-800` | `text-foreground` | Primary headings |
| `text-slate-700` | `text-foreground/80` | Secondary text |
| `text-slate-600` / `text-slate-500` | `text-muted-foreground` | Body/label text |
| `text-slate-400` | `text-muted-foreground/70` | Muted labels |
| `text-slate-300` | `text-muted-foreground/50` | Placeholder text |

### Semantic Colors — DO NOT CONVERT

These colors carry specific meaning and should remain:

| Color | Meaning | Used For |
|-------|---------|----------|
| `bg-emerald-50/100/500` | Success | Completed states, positive indicators |
| `text-emerald-700` | Success text | Completion labels |
| `bg-amber-50` | Warning | Warning backgrounds |
| `text-amber-500` | Warning text | Warning labels |
| `bg-rose-50` / `bg-red-50` | Error | Error backgrounds |
| `text-red-500` | Error | Error text, validation errors |
| `border-red-500` | Error | Error state borders |
| `bg-violet-50/100` | Category accent | StatCards, category tags |
| `bg-indigo-50` | Category accent | StatCards |
| `bg-sky-50` | Category accent | StatCards, info badges |
| `bg-orange-50` | Category accent | StatCards, warning badges |
| All `dark:` prefixed variants | Keep as-is | Dark mode overrides |
| All `hover:` / `focus:` prefixed variants | Keep as-is | Interactive states |

---

## 4. Page-by-Page Audit

### 4.1 Fully Converted to CSS Variables

These pages use theme-aware classes for all structural colors (backgrounds, borders, text):

> **Note on counts:** The hardcoded/CSS-var counts below are from grep line searches. The CSS variable search checks background variables (`bg-background`, `bg-card`, `bg-muted`); the hardcoded search checks structural colors (`bg-white`, `bg-slate-*`, `text-slate-*`, `border-slate-*`, etc.). These are directional indicators, not exact comparison metrics.

| Page | File | Notes |
|------|------|-------|
| **Trivia** | `Trivia.tsx` | 1 hardcoded line remaining (decorative `<style>` block) |
| **BibleReader** | `BibleReader.tsx` | 4 hardcoded lines remaining (decorative `<style>` block) |
| **Search** | `Search.tsx` | All structural colors converted |
| **Journal** | `Journal.tsx` | 55 CSS var classes · 21 hardcoded (mostly decorative `<style>` blocks) |
| **JournalEntry** | `JournalEntry.tsx` | 38 CSS var · 21 hardcoded (decorative/style blocks) |
| **JournalDetail** | `JournalDetail.tsx` | 31 CSS var · 8 hardcoded |
| **ForgotPassword** | `ForgotPassword.tsx` | 3 CSS var · 5 hardcoded (decorative dark panel backgrounds) |

### 4.2 Partially Converted

These pages have structural colors converted but retain intentional decorative dark panels:

| Page | File | Notes |
|------|------|-------|
| **Login** | `Login.tsx` | Left decorative panel uses `bg-slate-800` (intentional dark atmospheric bg) |
| **Register** | `Register.tsx` | Left decorative panel uses `bg-slate-900` (intentional dark atmospheric bg) |
| **Settings** | `Settings.tsx` | Theme toggle buttons retain intentional decorative styling |
| **Dashboard** | `Dashboard.tsx` | ✅ 0 structural issues — all flagged colors are intentional semantic/decorative (KPI accents, status indicators) |
| **UserDashboard** | `UserDashboard.tsx` | ✅ 0 structural issues — all flagged colors were state variants (`dark:hover:`, `focus:`) |

### 4.3 Standalone Brand Design (Intentional Exceptions)

These pages have their own independent design systems and are **not** intended to be theme-dynamic:

| Page | File | Brand Color Hits | Notes |
|------|------|:----------------:|-------|
| **Landing** | `Landing.tsx` | 56 brand + 65 structural | Marketing landing page with `bg-brand-bg`, `bg-brand-primary`, `text-brand-accent` |
| **PublicLayout** | `PublicLayout.tsx` | 23 brand + 33 structural | Wraps all HimFirstMedia pages with fixed brand nav/footer |
| **HimFirstMedia** (6 pages) | `WhoWeAre.tsx`, `OurVision.tsx`, `OurMission.tsx`, `OurGoals.tsx`, `Leadership.tsx`, `Founders.tsx` | ~8-11 each | Brochure pages with their own layout via PublicLayout |

---

## 5. Dark Decorative Panels (Auth Pages)

Three auth pages (Login, Register, ForgotPassword) have a **two-panel layout** on desktop:

- **Left panel**: Dark atmospheric background (`bg-slate-800` or `bg-slate-900`) with logo, verse quote, and animated gradient/blur overlays
- **Right panel**: Light form card on the page background

These dark panels are intentionally **not** converted to CSS variables because:
- They need to remain dark in all themes (including light mode) to maintain visual contrast
- The gradient overlays use `from-primary/30` and `from-accent/20` which DO shift with the theme's primary/accent colors
- Converting to `bg-card` would make the panel white in light mode, losing the two-panel layout contrast

Text on these dark panels uses `text-white/70` for blockquotes and step indicators use `bg-white/20` — these remain light across all themes.

---

## 6. AppLayout Sidebar Theming

The sidebar (`AppSidebar.tsx`) uses the shadcn sidebar component with custom CSS variable overrides.

### Key Fix Applied
The inline `<style>` block in AppSidebar.tsx originally had an **unconditional** override:
```css
[data-sidebar="sidebar"] {
  --sidebar-accent: hsl(var(--accent));  /* Overrode ALL themes */
}
```
This replaced the proper `--sidebar-accent` value with the root `--accent` for every theme, breaking dark mode. Fixed by adding `.cathedral` selector:
```css
.cathedral [data-sidebar="sidebar"] {   /* Only cathedral mode */
  --sidebar-accent: hsl(var(--accent));
}
```

### Sidebar Variable Resolution

| Mode | Sidebar Background | Sidebar Accent | Sidebar Border |
|------|:-----------------:|:--------------:|:--------------:|
| Light | `220 14% 98%` (near-white) | `220 14% 96%` (light gray) | `220 20% 83%` |
| Dark | `240 6% 10%` (near-black) | `240 4% 16%` (dark gray) | `240 4% 16%` |
| Cathedral | `248 25% 7%` (dark purple) | Overridden to gold accent | `42 20% 18%` |

---

## 7. Remaining Work

### Low Priority (decorative/style blocks)
- Search for `<style>` tags in page components that contain hardcoded hex colors
- Trivia.tsx: 1 hardcoded line in `<style>` block
- BibleReader.tsx: 4 hardcoded lines in `<style>` block

### Remaining structural issues (from `npm run lint:colors`)

**41 structural hardcoded color instances** across 11 files still need conversion:

| File | Count | Patterns | Type |
|------|:-----:|----------|------|
| **Journal.tsx** | 19 | `bg-stone-200/800`, `border-stone-*` | Chat bubble styling, decorative elements |
| **JournalDetail.tsx** | 6 | `bg-stone-200/800`, `text-stone-200` | Detail view cards |
| **Plandetail.tsx** | 4 | `text-slate-300` | Muted text labels |
| **JournalExportModal.test.tsx** | 3 | `bg-stone-800` | Test mock styling |
| **JournalEntry.tsx** | 2 | `bg-stone-800` | Entry containers |
| **Settings.tsx** | 2 | `bg-slate-400/450` | Theme selector buttons |
| **ForgotPassword.tsx** | 2 | `bg-slate-900` | Dark decorative panels (intentional — see §5) |
| **Register.tsx** | 4 | `bg-slate-800/900`, `border-slate-900`, `text-slate-300` | Dark decorative panels + text (intentional — see §5) |
| **Login.tsx** | 1 | `bg-slate-800` | Dark decorative panel (intentional — see §5) |
| **Dashboard.tsx** | 2 | `bg-stone-300/400` | Semantic KPI accent + status dot (intentional) |
| Other (5 files) | ~5 | Various `stone-200`, `gray-*`, `slate-*` | Scattered minor patterns |

**Note:** ~7 of the 48 flagged instances are intentional dark decorative panels on auth pages (§5) or semantic colors (§3). The remaining ~41 are true structural issues that should be converted to CSS variables.

### Not Recommended
- **Landing.tsx** — Marketing page with intentional brand design. Converting would break its independent visual identity.
- **PublicLayout.tsx** — Brand nav/footer layout for HimFirstMedia pages. These are standalone brochure pages.
- **HimFirstMedia/** — Same as above; they use PublicLayout and have their own brand styling.

---

## 8. Browser Verification Summary

The following live browser tests were conducted against the development server:

### Auth Pages (Login, Register, ForgotPassword)

| Test | Theme | Result |
|------|-------|:------:|
| Login page — visual layout | Light | ✅ Light bg, readable text, proper contrast |
| Login page — visual layout | Dark | ✅ Dark bg, form inputs visible, readable text |
| Login page — visual layout | Cathedral | ✅ Dark purple bg, gold accent buttons/inputs |
| Login page — form inputs | Cathedral | ✅ Gold focus border on email/password fields |
| Login page — error state | Cathedral | ✅ Browser-native validation on empty submit |
| Login page — CSS variables | Cathedral | ✅ `--background: 248 30% 5%`, `--primary: 42 70% 55%` |
| Register page — visual layout | Cathedral | ✅ Tabs, inputs, continue button styled correctly |
| ForgotPassword — all modes | All | ✅ Correct step indicator, dark panel, form card |

### Journal Pages

| Test | Theme | Result |
|------|-------|:------:|
| Journal list | Dark | ✅ Dark backgrounds, readable cards, no white boxes |
| Journal entry detail | Dark | ✅ Proper dark styling, no console errors |
| Journal list | Cathedral | ✅ Very dark purple bg, gold accents present |
| Journal list | Light | ✅ White/light backgrounds as expected |

### Protected Pages (Sidebar)

| Test | Mode | Result |
|------|------|:------:|
| Sidebar — all themes | Light/Dark/Cathedral | ✅ Fixed `--sidebar-accent` override (gold only in cathedral) |
| Dashboard | Dark/Cathedral | ✅ Verified via E2E tests |
| Reading Plans | Dark/Cathedral | ✅ Verified via E2E tests (CSS var assertions) |

### Console Errors
- **None** related to theme rendering on any tested page
- One unrelated warning: `"A form field element should have an id or name attribute"` on Settings page

---

## 9. Theme Verification Checklist

Use this checklist when adding new pages:

- [ ] Page renders without visual breakage in Light mode
- [ ] Page renders without visual breakage in Dark mode
- [ ] Page renders without visual breakage in Cathedral mode
- [ ] No `bg-white` used for container backgrounds (use `bg-card`)
- [ ] No `text-slate-*` or `text-stone-*` for structural text (use `text-foreground` or `text-muted-foreground`)
- [ ] No `border-slate-*` or `border-stone-*` for structural borders (use `border-border`)
- [ ] Semantic colors (emerald, red, amber, violet, etc.) kept for their specific meaning
- [ ] No console errors related to missing CSS variables
- [ ] Sidebar active/hover items look correct in all three themes
- [ ] Text contrast passes readability check (light text on light bg, dark text on dark bg)

---

## 10. Quick Reference

### Most Common Conversions

```tsx
// ❌ BEFORE (hardcoded)
<div className="bg-white border border-slate-200 text-slate-700 p-4">
  <h2 className="text-slate-900">Title</h2>
  <p className="text-slate-500">Description</p>
</div>

// ✅ AFTER (theme-aware)
<div className="bg-card border border-border text-foreground/80 p-4">
  <h2 className="text-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>
```

### When to Use Each Background Class

| Class | When to Use |
|-------|-------------|
| `bg-background` | Page body, outermost containers |
| `bg-card` | Cards, panels, input backgrounds, modals |
| `bg-muted` | Secondary sections, subtle backgrounds, hover states |
| `bg-popover` | Dropdowns, popovers, tooltips |
| `bg-secondary` | Secondary button backgrounds, alternate sections |
| `bg-primary` | Primary buttons, active states, gold accents |
| `bg-sidebar-background` | Sidebar background |

### When to Use Each Text Class

| Class | When to Use |
|-------|-------------|
| `text-foreground` | Primary headings, main content |
| `text-foreground/80` | Secondary text, less emphasis |
| `text-muted-foreground` | Body text, labels, descriptions |
| `text-muted-foreground/70` | Muted labels, secondary metadata |
| `text-muted-foreground/50` | Placeholders, disabled text |
| `text-primary` | Links, active states, gold highlights |
