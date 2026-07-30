# Cathedral Theme Implementation Plan

## Dynamic Stained Glass / Dark Cathedral Theme for All Pages

### 1. Goal

Apply the stained glass / dark cathedral visual identity (currently only on Trivia.tsx) to **all pages** in a **theme-aware** way that respects light mode, dark mode, and system preference.

---

### 2. Current State

| Aspect | Current | Problem |
|--------|---------|---------|
| **CSS variables** | `:root` (light) + `.dark` (dark) in `index.css` | Only two modes, no "cathedral" variant |
| **Theme switch** | Settings page toggles `dark` class on `<html>` | Ignores `prefers-color-scheme` when set to "system" |
| **Trivia page** | Hardcoded `#0B0B1A`, `#D4AF37`, `#0F0F2E` in inline styles | Ignores light mode entirely; users on light mode see broken colors |
| **Other pages** | Use `bg-background`, `text-foreground` Tailwind classes | Work correctly but have no cathedral styling |

---

### 3. Architecture

#### 3a. Add a `cathedral` Theme Variant

Define three theme modes instead of two in `web/src/index.css`:

```css
/* Light mode — current, unchanged */
:root {
  --background: 220 45% 97%;
  /* ... */
}

/* Dark mode — current, unchanged */  
.dark {
  --background: 222 47% 5%;
  /* ... */
}

/* Cathedral mode — NEW: rich dark background, gold accents */
.cathedral {
  --background: 248 30% 5%;       /* #0B0B1A equivalent */
  --foreground: 40 30% 90%;       /* warm cream #FFF8DC */
  --card: 248 25% 9%;             /* #0F0F2E equivalent */
  --card-foreground: 40 30% 90%;
  --primary: 42 70% 55%;          /* gold #D4AF37 */
  --primary-foreground: 248 30% 5%;
  --accent: 42 70% 55%;           /* gold accent */
  --accent-foreground: 248 30% 5%;
  --border: 42 30% 25%;           /* muted gold border */
  --muted: 248 20% 12%;
  --muted-foreground: 40 20% 70%;
  --sidebar-background: 248 25% 7%;
  --sidebar-foreground: 40 20% 80%;
  --sidebar-border: 42 20% 20%;
  --font-cathedral: 'Cinzel', serif;  /* NEW: decorative heading font */
}
```

**Benefits:**
- All Tailwind classes (`bg-background`, `text-foreground`, `border-border`, etc.) automatically adapt
- No inline color overrides needed in page components
- Trivia page can drop all hardcoded `#0B0B1A` / `#D4AF37` values
- Works with shadcn/ui components (Button, Badge, Card, etc.)

#### 3b. Update the Theme Switch Logic

Current (`Settings.tsx`):
```ts
const handleThemeChange = (mode: string) => {
  if (mode === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else if (mode === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
  } else {
    root.classList.remove("light", "dark");
  }
};
```

New:
```ts
const THEME_MODES = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "cathedral", icon: Sparkles, label: "Cathedral" },
  { value: "system", icon: Monitor, label: "System" },
];

const handleThemeChange = (mode: string) => {
  localStorage.setItem("theme_mode", mode);
  const root = document.documentElement;
  root.classList.remove("light", "dark", "cathedral");
  
  if (mode === "cathedral") {
    root.classList.add("cathedral");
  } else if (mode === "dark") {
    root.classList.add("dark");
  } else if (mode === "light") {
    root.classList.add("light");
  }
  // "system" = no class → uses prefers-color-scheme media query
};
```

#### 3c. Handle System Preference

The CSS already has `prefers-color-scheme` media queries that need to be added. When no theme class is set (system mode), the browser should use the OS preference:

```css
/* If no class on html, use system preference */
@media (prefers-color-scheme: dark) {
  html:not(.light):not(.cathedral) {
    /* Apply dark mode by default, or cathedral if user prefers "system" */
    /* We can detect this in JS and set "dark" or "cathedral" */
  }
}
```

**Simpler approach**: When system is selected, use `matchMedia`:

```ts
function applySystemTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const prefersCathedral = window.matchMedia("(prefers-color-scheme: cathedral)").matches; // custom media query
  // Fallback: just use dark vs light
}

const handleThemeChange = (mode: string) => {
  localStorage.setItem("theme_mode", mode);
  applyTheme();
};

function applyTheme() {
  const saved = localStorage.getItem("theme_mode") || "system";
  const root = document.documentElement;
  root.classList.remove("light", "dark", "cathedral");

  if (saved === "cathedral") {
    root.classList.add("cathedral");
  } else if (saved === "dark") {
    root.classList.add("dark");
  } else if (saved === "light") {
    root.classList.add("light");
  } else {
    // system: detect OS preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add(prefersDark ? "dark" : "light");
  }
}
```

Better: Add an **extra tier** where cathedral is the "enhanced dark" mode, so:
- `light` = light mode (current)
- `dark` = standard dark mode (current)
- `cathedral` = rich dark mode with gold accents (NEW)
- `system` = follows OS; if dark, use cathedral; if light, use light

#### 3d. Extract Theme Logic into a Hook

Create `web/src/hooks/useTheme.ts`:

```ts
import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "cathedral" | "system";

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem("theme_mode") as ThemeMode) || "system";
  });

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "cathedral");

    if (mode === "cathedral") {
      root.classList.add("cathedral");
    } else if (mode === "dark") {
      root.classList.add("dark");
    } else if (mode === "light") {
      root.classList.add("light");
    }
    // system: no class → stays at :root (light) unless we detect otherwise
  }, []);

  const handleThemeChange = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("theme_mode", mode);
    applyTheme(mode);
  }, [applyTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (themeMode !== "system") return;
    
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(themeMode);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode, applyTheme]);

  // Apply on mount
  useEffect(() => {
    applyTheme(themeMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { themeMode, setThemeMode: handleThemeChange, isCathedral: themeMode === "cathedral" };
}
```

---

### 4. Migration Plan — Page by Page

For each page, the work is the same:
1. Remove any hardcoded dark/light-specific inline colors
2. Replace with CSS variable-based Tailwind classes (`bg-background`, `text-foreground`, etc.)
3. Add decorative cathedral elements conditionally using `.cathedral` CSS selectors

#### Phase 1: CSS Variables (index.css)
- [ ] Add `.cathedral` CSS class with all HSL variable overrides
- [ ] Add `.cathedral` font variable for `Cinzel` / `Playfair Display`

#### Phase 2: Theme Infrastructure (web/src/hooks/useTheme.ts)
- [ ] Create `useTheme` hook
- [ ] Update `Settings.tsx` to use the hook and add "Cathedral" option
- [ ] Update `App.tsx` to initialize theme on mount

#### Phase 3: Trivia.tsx — Convert to Theme-Aware
- [ ] Remove all hardcoded `#0B0B1A`, `#D4AF37`, `#0F0F2E`, `#FFF8DC` inline colors
- [ ] Replace with `var(--background)`, `var(--foreground)`, `var(--primary)`, `var(--accent)` via Tailwind classes
- [ ] Keep decorative SVG elements (arch frames, stained glass borders, medallion) but use `text-primary` / `border-primary` instead of hardcoded gold
- [ ] Add `bg-gradient-to-b from-background via-background to-muted` instead of hardcoded linear-gradients

#### Phase 4: Trivia Sub-Components — Update Styling
- [ ] `StarBurst.tsx` — colors are fine (they're particle colors, not theme-dependent)
- [ ] `SanctuarySeal.tsx` — replace `#0B0B1A`, `#D4AF37`, `#FFF8DC`, `#0F0F2E` with `var()` references
- [ ] `StainedGlassQuestion.tsx` — replace `rgba(15,15,46)` with `hsl(var(--card))`, hardcoded gold with `hsl(var(--primary))`
- [ ] `GlassResult.tsx` — replace fixed dark bg with theme-aware classes
- [ ] `ScoreCrest.tsx` — replace `#D4AF37` with `hsl(var(--primary))`, `#FFF8DC` with `hsl(var(--foreground))`

#### Phase 5: Lab Flow Pages — Cathedral Accents
- [ ] `LabHome.tsx` — add decorative arch SVG element (shown only in cathedral mode via `.cathedral` CSS)
- [ ] `LookStage.tsx` — add subtle gold borders to the passage card, separator styling
- [ ] `ListenStage.tsx` — style the "Amen" completion state with gold/amber accents
- [ ] `LearnStage.tsx` — add ornate tab bar styling for cathedral mode
- [ ] `AbideStage.tsx` — style the save/reflect section with illuminated manuscript vibes

Each page change is minimal — just adding `.cathedral`-specific CSS classes for decorative elements and making existing components use the CSS variables.

#### Phase 6: Global Elements — Consistent Touch
- [ ] `BibleReader.tsx` — the chapter heading divider can show gold in cathedral mode
- [ ] `BibleReaderHeader.tsx` — the book/chapter nav can use `font-cathedral` in cathedral mode
- [ ] `Sidebar.tsx` — sidebar items can get subtle gold hover highlights in cathedral mode

---

### 5. Example: StainedGlassQuestion Before/After

**Before** (hardcoded, no theme support):
```tsx
style={{
  background: "linear-gradient(180deg, rgba(15,15,46,0.95), rgba(10,10,26,0.98))",
  border: "1px solid rgba(212, 175, 55, 0.08)",
}}
<span style={{ color: "#D4AF37" }}>Question</span>
<p style={{ color: "#FFF8DC" }}>{question.question}</p>
```

**After** (theme-aware, works in all modes):
```tsx
className="bg-gradient-to-b from-card to-background border border-primary/10"
<span className="text-primary">Question</span>
<p className="text-foreground">{question.question}</p>
```

The `.cathedral` CSS class ensures `--primary` resolves to gold `#D4AF37`, while in light mode `--primary` is the standard blue (`hsl(203 31% 35%)`).

---

### 6. Decorative CSS Additions (Cathedral-Only)

Elements that only show in cathedral mode can use this pattern:

```css
.cathedral .cathedral-arch {
  display: block;
}
.cathedral .cathedral-glow {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.15);
}

/* Or use class-based approach in components */
<div className={cn(
  "rounded-2xl border",
  "border-border",          /* default: standard border */
  "cathedral:border-primary/20"  /* cathedral: gold-tinted border */
)}>
```

Tailwind can be configured to support a `.cathedral` variant:

```js
// tailwind.config.ts
module.exports = {
  darkMode: ["class", ".dark"],
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("cathedral", ".cathedral &");
    }),
  ],
};
```

Then use `cathedral:bg-primary/5` anywhere to apply styles only in cathedral mode.

---

### 7. Implementation Order

| # | File/Area | Effort | Impact |
|---|-----------|--------|--------|
| 1 | `web/src/index.css` — add `.cathedral` CSS class | 20 min | Foundation for everything |
| 2 | `tailwind.config.ts` — add `cathedral:` variant | 5 min | Enables conditional cathedral styling |
| 3 | `web/src/hooks/useTheme.ts` — create hook | 15 min | Centralizes theme logic |
| 4 | `web/src/pages/Settings.tsx` — add Cathedral option | 10 min | Users can pick cathedral mode |
| 5 | `web/src/App.tsx` — initialize theme on mount | 5 min | Ensures theme applies on page load |
| 6 | `web/src/pages/Trivia.tsx` — convert to theme-aware | 30 min | Trivia works in all modes |
| 7 | Trivia sub-components (4 files) — update | 45 min | SanctuarSeal, StainedGlassQuestion, GlassResult, ScoreCrest |
| 8 | Lab flow pages (5 files) — add accents | 30 min | LabHome, LookStage, ListenStage, LearnStage, AbideStage |
| 9 | BibleReaderHeader / Sidebar — subtle touches | 15 min | Global consistency |
| **Total** | | **~3 hours** | |

---

### 8. Files to Create/Modify

**Create:**
- `web/src/hooks/useTheme.ts`

**Modify:**
- `web/src/index.css` — add `.cathedral` CSS variables
- `tailwind.config.ts` — add `cathedral:` variant
- `web/src/App.tsx` — call `applyTheme` on mount
- `web/src/pages/Settings.tsx` — add Cathedral option to theme selector
- `web/src/pages/Trivia.tsx` — replace hardcoded colors with CSS variables
- `web/src/components/trivia/SanctuarySeal.tsx`
- `web/src/components/trivia/StainedGlassQuestion.tsx`
- `web/src/components/trivia/GlassResult.tsx`
- `web/src/components/trivia/ScoreCrest.tsx`
- `web/src/pages/LabHome.tsx`
- `web/src/pages/LookStage.tsx`
- `web/src/pages/ListenStage.tsx`
- `web/src/pages/LearnStage.tsx`
- `web/src/pages/AbideStage.tsx`

---

### 9. Future Considerations

- **User profiles**: Store theme preference on the backend so it syncs across devices
- **Cathedral as default dark**: Make cathedral the default dark mode for new users
- **Accessibility**: Ensure 4.5:1 contrast ratio in cathedral mode (gold text on dark bg)
- **Performance**: The `.cathedral` CSS class adds ~50 HSL variables — negligible impact
- **Export/PDF**: Cathedral mode styling should not affect print exports (use `@media print` to strip decorations)
