# 🌐 Google Translate Integration Plan — Replace Static JSON Translations

> **Status:** Proposed (not implemented)
> **Owner:** Web Frontend
> **Scope:** `web/` SPA only (does not change `app/` or `backend/`)
> **Goal:** Stop hand-maintaining static UI-string translations and use Google's translation instead of the current JSON locale files, using the Google Website Translate Element (`translate_a/element.js`).

---

## 1. Purpose

Today the SPA ships 22 static locale JSON files (`web/src/components/languages/*.json`), deep-merged over `en.json`, and consumed through `LanguageProvider.t`. Coverage is uneven — some strings are translated, many are English placeholders, and `docs/progress.md` marks most locales as 0%.

The user story: *"I want to change static words translation instead of using JSON to use the Google translation."*

The integration target is the free, client-side **Google Website Translate Element**:

```html
<script type="text/javascript">
  function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      { pageLanguage: 'en', includedLanguages: 'en,ar,de,...' },
      'google_translate_element'
    );
  }
</script>
<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
<script type="text/javascript">document.body.appendChild(script);</script>
```

### In scope
- Translate all **UI chrome** (sidebar, headers, buttons, labels, empty states, toasts, admin UI) for the 22 supported languages.
- Keep the existing language picker UX, persistence (`exegesis-language`), and RTL behavior.
- Graceful fallback to the current JSON whenever Google is unavailable.

### Out of scope / explicit non-goals
- **Scripture text must NOT be machine translated** (BibleReader verses, DailyVerse, Verse Explanations, devotion/exegesis bodies). Scripture stays in the user's chosen Bible translation.
- User-generated content must NOT be translated (journal entries, public stories, comments).
- Offline translation (the widget needs network).
- Changing the backend or the mobile app.

---

## 2. How the Google Website Translate Element Actually Works

Because it is a DOM-mutating third-party gadget, engineering reality matters. When `element.js?cb=googleTranslateElementInit` loads, Google:

1. Runs the global `googleTranslateElementInit` callback and constructs a `google.translate.TranslateElement` bound to a host element (`#google_translate_element`). The host renders a language dropdown (or inline control).
2. When the user picks a language, it writes the cookie `googtrans=/en/<target>` and asynchronously translates the **entire live DOM**:
   - It snapshots the document, exchanges it through a hidden iframe with Google servers, and rewrites text nodes in place.
3. It mutates the page as a side effect:
   - Adds `translated-ltr` / `translated-rtl` classes to `<body>`.
   - Sets `lang` (and `hreflang`) attributes on `<html>`.
   - Injects a `goog-te-banner-frame` iframe stating auto-translation and offsets the page with `body { top: 39px !important }`.
   - Inserts its own UI (`#goog-gt-tt`, `goog-te-balloon-frame`) and CAN inject a Google Translate branding line.
4. Elements with class `notranslate` (or ancestor `translate="no"`) are skipped; class `translate` forces translation.

**Key property:** the widget operates OUTSIDE React's virtual DOM. This is the crux of the whole plan.

---

## 3. Compatibility Analysis (why naive injection breaks the SPA)

| # | Problem | Impact | Mitigation in this plan |
|---|---------|--------|--------------------------|
| 1 | **React re-render reverts text.** Any state change on a translated subtree unmounts/re-mounts English text; the widget does not reliably re-translate it. | Flicker, half-translated screens after any interaction (selection bars, toasts, timers, reader scroll). | `notranslate` on volatile content + re-sync bridge (Phase 3). |
| 2 | **Lazy routes mount post-translation.** `RouteSuspense`/`lazy()` content renders after the widget already translated. | Newly mounted pages stay in English. | Route-changed re-trigger; fallback mode flag. |
| 3 | **Scripture must be excluded.** | Google would translate Bible text away from the chosen Bible translation. | `notranslate` wrapper around all Scripture + user content. |
| 4 | **User content must be excluded.** Journal, testimonials, profile text. | Data corruption/embarrassment; writing translated text back on inputs. | `translate="no"` on inputs + `notranslate` content wrappers. |
| 5 | **Language code mismatch.** Our `Language` uses `fil` (Filipino); the widget uses `tl`. RTL set is `["ar","ur"]` today. | Picker ↔ widget disagreement; `<html dir>` double-handling. | Explicit code map + single source of truth for RTL. |
| 6 | **Banner iframe + `body.top` offset.** Widget reserves vertical space and injects frames. | Layout jump, z-index issues with our sidebar/header. | CSS overrides (see §8) that neutralize banner and body offset. |
| 7 | **Dual persistence.** App writes `exegesis-language` (localStorage); widget uses `googtrans` cookie. | Divergence on cold start, editor/back navigation. | Bridge keeps both in sync; app key stays authoritative. |
| 8 | **Performance.** Whole-DOM translation on every language switch; heavy for a 300+ string admin app. | Multi-second stalls on slower devices. | Debounce, only run on explicit user action, freeze during route transition. |
| 9 | **Google outage / ad-block / region block.** Script may fail to load or be stripped. | Entire app reverts to English silently. | JSON fallback + visible error signal + `VITE_TRANSLATION_MODE` flag. |
| 10 | **ToS / branding.** Hiding the Google attribution is against Google's terms for the free gadget. | Legal risk if we fully CSS-hide the "powered by Google Translate" chrome. | Keep minimal attribution or move to paid API (Plan B, §11). |
| 11 | **Form values.** Widget can attempt to translate text inside `<input value>`/`<textarea>`. | Corrupted input data. | `translate="no"` on all controlled inputs. |
| 12 | **SSR-less SPA first paint.** Initial HTML is empty until React mounts; widget may translate before content exists. | Blank English flash; widget invested in wrong DOM. | Force re-translate after first paint; gate on `id="root"` having children. |

This list is the acceptance contract for Phase 1 (POC). If items 1–2 cannot be held within acceptable limits, we pivot to **Plan B** (§11).

---

## 4. Target Architecture

Keep `LanguageProvider` as the coordinator (not replaced). Add three new pieces:

```
src/
├─ services/
│  └─ googleTranslate.ts        # loader + widget bootstrap + cookie/class watcher
├─ components/
│  ├─ GoogleTranslateBridge.tsx # React provider that wires languageProvider ↔ widget
│  └─ NoTranslate.tsx           # <NoTranslate> helper (className="notranslate" translate="no")
└─ styles/
   └─ google-translate.css      # banner/offset/branding resets (imported in index.css)
```

### 4.1 Config flag

```ts
// src/services/googleTranslate.ts
export type TranslationMode = "widget" | "json"; // | "api" (Plan B)
export const TRANSLATION_MODE: TranslationMode =
  (import.meta.env.VITE_TRANSLATION_MODE as TranslationMode) ?? "json";
```

### 4.2 Loader (`googleTranslate.ts`)

Loads the vendor script once, idempotently, and only in the browser at runtime (never a static `<script>` in `index.html`, so non-participating builds stay lean):

```ts
const WIDGET_SRC =
  "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
const GOOGLE_LANG_MAP: Record<Language, string> = {
  en: "en", ar: "ar", de: "de", fr: "fr", es: "es", pt: "pt", hi: "hi", bn: "bn",
  ta: "ta", te: "te", mr: "mr", gu: "gu", kn: "kn", ml: "ml", pa: "pa", ur: "ur",
  sw: "sw", it: "it", el: "el", ru: "ru", ne: "ne",
  fil: "tl", // Google's widget code for Filipino is tl
};

let scriptPromise: Promise<void> | null = null;
export function loadGoogleTranslate(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    (window as any).googleTranslateElementInit = () => resolve();
    const s = document.createElement("script");
    s.src = WIDGET_SRC;
    s.async = true;
    s.onerror = () => { scriptPromise = null; reject(new Error("Google Translate failed to load")); };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export function initGoogleTranslate(hostId = "google_translate_element") {
  const langs = Object.values(GOOGLE_LANG_MAP).join(",");
  new (window as any).google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: langs,
      autoDisplay: false,          // never auto-detect; always user-initiated
      layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
    },
    hostId,
  );
}
```

Wrap the picker host in a hidden, inert container so existing UI governs the dropdown:

```tsx
{/* GoogleTranslateBridge renders */}
<div id="google_translate_element" className="hidden" aria-hidden="true" />
```

### 4.3 Language bridge (`GoogleTranslateBridge.tsx`)

Single source of truth remains `LanguageProvider`. The bridge:

- Runs once, in `useEffect`, **only when `TRANSLATION_MODE === "widget"` and the user has a non-`en` persisted language** (so we never translate before the user opts in).
- `setLanguage(next)` (wired into the Settings language picker) does:
  1. `await loadGoogleTranslate()`;
  2. `initGoogleTranslate()`;
  3. select the widget language via the public control; if the programmatic API is unavailable, fall back to setting the `googtrans` cookie **then** reload once (see §5).
- Watches two signals and reconciles them into `LanguageProvider`:
  - `googtrans=/en/<lang>` cookie (polled with a 1 s interval or `CookieStore` change event when available);
  - `document.body.classList` `translated-ltr|translated-rtl`.
- Exposes `effectiveLang`, `isActive`, `isRtlActive`, and an `onLanguageChanged` notifier consumed by `AppLayout` (document title stays app-managed).

### 4.4 `NoTranslate` + content sweep

```tsx
export const NoTranslate = ({ children, as: Tag = "span" }: any) => (
  <Tag className="notranslate" translate="no">{children}</Tag>
);
```

Apply `NoTranslate`/`translate="no"` at the surface level, not per-string:

| Surface path | Wrapper |
|---|---|
| `BibleReader` verse text, chapter headings | verse text span |
| `DailyVerse`/`DailyExegesis`/`DailyDevotion` bodies + scripture refs | content container |
| `VerseExplanations`, `strongs` content, Lab passage widgets | content container |
| Journal entries (all views incl. admin), testimonials, prayers | entry container |
| All `<input>`/`<textarea>`/`contentEditable` components | `translate="no"` attribute |

Surfaces NOT wrapped (these live via `t.*` keys and may be translated): sidebar labels, headers, buttons, page titles, empty states, toasts, admin labels.

### 4.5 `html` opt-in guard

Keep the app English by default until the user explicitly chooses a non-`en` language:

```html
<!-- index.html -->
<html lang="en" translate="no" class="notranslate">
```

The bridge removes `translate="no"`/`notranslate` from `<html>` at the moment the user activates translation. This is the "always opt-in" model and avoids surprise whole-page translation on load.

---

## 5. Language Change Flow (widget mode)

```
User picks "العربية" in Settings
  └─ languageProvider.setLanguage("ar")          [persists exegesis-language, sets <html dir>]
      └─ bridge.t("ar")
          ├─ loadGoogleTranslate()                [once]
          ├─ initGoogleTranslate()
          └─ select widget lang = GOOGLE_LANG_MAP["ar"]
              ├─ programmatic select if available
              └─ else: set cookie googtrans=/en/ar → window.location.reload()   [safe path]
```

**Reload-on-change policy:** Because the widget only reliably translates a fully-painted initial DOM, the *reliable* default is one full reload immediately after a language change (cold path), then client-side navigation within that language. Route transitions afterwards are re-synced by §6. This is a deliberate, documented trade-off (one reload per language switch) rather than a permanent page jump on every navigation. If the POC shows the widget re-translating reliably without reloads, we promote the no-reload path.

---

## 6. Re-sync After Route Re-renders (Phase 3 hard problem)

React re-renders and lazy route mounts will leave English islands. Approaches, in order of preference:

1. **`notranslate` boundary strategy (chosen default):** all fast-changing/dynamically-mounted regions (toasts, player react parts, skeletons) are already `notranslate`, so the widget's stable surface is the broadly static chrome. Route mounts are *re-seeded* by re-triggering the widget on the app shell after navigation completes (debounced `MutationObserver` on `#root` scoped to new top-level route nodes, or a `useEffect` in `AppRoutes` that nudges `TranslationProvider` on `location.pathname` change).
2. **MutationObserver re-translate (experimental):** watch `#root` for added nodes inside non-`notranslate` subtrees and re-invoke the widget's internal translate for those containers; measure correctness before enabling broadly. If unstable, keep (1).
3. **No-reload n/a for route transitions:** we do NOT reload per route; that would degrade the SPA UX.

Acceptance gate for Phase 3: after visiting ≥4 distinct routes in a translated language, <2% of visible chrome strings render in English.

---

## 7. RTL Handling

- Keep `RTL_LANGUAGES = ["ar","ur"]` in `type.ts` as authoritative; the bridge maps widget's `translated-rtl` class back to it and leaves `LanguageProvider.isRtl` (drives `dir` on `<html>` and layout) untouched.
- On widget deactivation (switch back to English), remove `translated-rtl` body class and reset `<html dir>` to `ltr`.

---

## 8. CSS Overrides (`google-translate.css`)

```css
/* Neutralize the banner + its body shift. Kept minimal: the widget's own
   control is hidden (we render our picker), the banner and balloon are
   removed to protect our sticky header/stacking context. */
.goog-te-banner-frame,
.goog-te-balloon-frame,
#goog-gt-tt {
  display: none !important;
}
body {
  top: 0 !important;
}
.goog-te-gadget-simple {
  font-size: 0 !important;
  border: 0 !important;
}
```

Import this file in `index.css` behind the widget flag. These overrides must pass the repo's existing `npm run lint:dark` / `check-hardcoded-colors.js` discipline (no hardcoded theme colors; verify dark-mode contrast of any visible widget chrome).

> ⚠️ **ToS note:** fully hiding Google's "Powered by Google Translate" branding violates the free gadget's terms; keep at least a link/attribution in the Settings language section, or move to Plan B (paid Cloud API) where branding is not required.

---

## 9. Testing

### Unit / component (Vitest)
- `googleTranslate.ts`: script injected once; `cb` registered before `appendChild`; loader rejects on `onerror`; promise memoized.
- `googleTranslate.ts` code map: `GOOGLE_LANG_MAP` is bijective over the 22 languages.
- `GoogleTranslateBridge`: cookie detection maps `googtrans=/en/ar` → `ar`; body-class detection; English reset path; `TRANSLATION_MODE !== "widget"` no-ops.

### E2E (Playwright, mirroring `e2e/gating.spec.ts` pattern)
- `e2e/translation.spec.ts`:
  1. Language picker → Arabic → `googtrans=/en/ar` present, `html[dir=rtl]`, body has `translated-rtl`.
  2. Sidebar + a dashboard label render non-English after wait.
  3. BibleReader verse text is byte-identical to expected server verse (proves `notranslate`).
  4. Journal text input untouched while language is non-English.
  5. Switching back to English removes `translated-rtl` and cookie.
- Keep `e2e/cathedral-theme.spec.ts` green — widget must not leak visible frames into the theme audit.

### Manual matrix
| Language | Script | RTL | Sample screens (Landing, Home, Bible, Admin, Settings) |
|:--------:|:------:|:---:|:--------------------------------------------------------|
| ar, ur   | Arabic/Urdu | ✅ RTL | all |
| hi, bn, ta, te, mr, gu, kn, ml, pa, ne | Indic | ❌ LTR | all |
| el, ru, de, fr, es, pt, it | Latin/Cyr/Greek | ❌ LTR | all |
| fil (→ tl) | Tagalog | ❌ LTR | all |

---

## 10. Rollout Plan (phased, with decision gates)

| Phase | Deliverable | Exit criteria |
|----|-------------|---------------|
| **P0 — Audit (0.5 d)** | Surface inventory of `t.*` consumers; list of `notranslate` wrappers to add (§4.4); code-map verification; dark-mode lint baseline. | Inventory checked into the plan; no open mapping doubts. |
| **P1 — POC (1–2 d)** | Feature branch + `VITE_TRANSLATION_MODE=widget` behind an admin-only/staff account or a query param; 1 page (UserDashboard) fully fenced. | §3 items 1,2 (revert/re-mount) and 6 (banner) behave acceptably; TTFB-to-translated ≤ 3 s; Scripture intact. |
| **P2 — Integration (2–4 d)** | `googleTranslate.ts`, `GoogleTranslateBridge`, `NoTranslate`, CSS file, Settings picker wiring, reload-on-change. | P1 criteria hold app-wide; Playwright suite green; `typecheck` clean; no contrast regressions. |
| **P3 — Hardening (2–4 d)** | Route re-sync; debounced MutationObserver experiment; offline/blocked fallback toggles; performance budgets; analytics events. | §6 route gate (≥4 routes, <2% English chrome); Lighthouse translation pass ≥2s budget. |
| **P4 — Decision gate → Rollout or Pivot** | Release to all users OR pivot to Plan B. | Stakeholder demo; A/B pod feedback; ToS review sign-off. |
| **P5 — Monitoring** | Error/usage events (widget loaded vs failed, languages used, English-content score), weekly check. | Sustained widget-failure rate < 1%; no support tickets about language breakage. |

Rollback at all times: `VITE_TRANSLATION_MODE=json` (the default) restores the previous behavior instantly; no data migration involved.

---

## 11. Plan B (recommended alternative, if widget fails acceptance)

If P1–P3 cannot hold the §3 acceptance contract (highly likely for a re-render-heavy SPA), the same goal — "Google translation instead of hand-written JSON" — is reached far more robustly by **generating the JSON locales with Google's Cloud Translation API**:

- **Mechanism:** a one-time/CI script `web/scripts/translate-locales.mjs` walks `en.json`, batches ~128 keys per request, calls `POST /backend/translations/google` (or directly `https://translation.googleapis.com/language/translate/v2`), and writes `ar.json`, …, `fil.json` preserving the exact JSON structure — populating `docs/progress.md` to 100%.
- **Why it wins:** `LanguageProvider` and all of `t.*` usage are untouched (React-safe, deterministic, no re-render issues); translations work after build without runtime Google dependency; RTL and fallback logic stay; cost is trivial (~$20/1M chars; this corpus ≈ 35k strings ≈ one-time cents-to-dollars).
- **Availability:** the backend already hosts a translation endpoint family (used by the mobile app: LibreTranslate first, Google fallback pending); reuse it so key coverage matches mobile.
- **Correctness:** review 10% sample per locale; keep `en` master; only write translated files when the diff ratio is sane; never machine-translate Scripture/user content (those keys are simply excluded from generation, mirroring §4.4).

**Recommendation:** attempt P1 as a spike to validate the user-visible UX, but budget the Plan B pivot as the default engineering answer for production.

### 11.1 Implemented (web-only)

Plan B is implemented in `web/` and does **not** touch the backend:

- `scripts/translate-locales.mjs` — translates `src/components/languages/en.json` into the other 21 locales and rebuilds each file with the exact same structure. Providers: `cloud` (Google Cloud Translation API v2, needs `GOOGLE_TRANSLATE_API_KEY` / `--key`) and `gtx` (public `translate_a/single`, no key; blocked on most datacenter IPs).
  - Dedupes identical strings, batches (~80 keys/request on cloud; 3200-char payload on gtx), protects `{{placeholders}}`/`%s`/newlines with sentinels, retries with backoff, falls back line-by-line on gtx split mismatches.
  - Writes a language file **only if every batch succeeded** (use `--force` to write partial results). Emits `docs/translation-generation-report.json`.
  - `--self-check` validates flatten/rebuild (currently OK: 1781 leaf strings).
- `scripts/find-hardcoded-strings.mjs` — AST-scans `src/features`, `src/components`, `src/pages`, and curated static data for static JSX text (including multiline text), label-ish props, toast messages, JSX conditionals, UI configuration objects, sidebar labels, and canonical Bible book labels. Emits `docs/hardcoded-source.json` (currently **2,260** unique strings), `hardcoded.en.json`, and `docs/hardcoded-strings-report.md`.
- `scripts/apply-hardcoded-tt.mjs` — AST-wires all detected occurrences to the runtime `tt(text)` function. The current scan covers 3,544 occurrences; a clean dry run reports zero remaining edits. Styling tokens and Scripture preview content are explicitly excluded.
- Runtime: `LanguageProvider` keeps module-level `tt(text)` in sync with the selected locale; generated `hardcoded.*.json` dictionaries are loaded via `import.meta.glob`. Language changes reload once so module-level configuration labels also re-evaluate in the selected language.
- `scripts/validate-translations.mjs` — rejects incomplete locale structure, missing hardcoded keys, blank values, broken placeholders, excessive English leftovers, non-Google reports, or any generation failures.

**Runbook (on a network Google does not block):**

```bash
cd web
npm run translate:scan                 # regenerate docs/hardcoded-source.json + report
npm run translate:gen -- --provider gtx --hardcoded docs/hardcoded-source.json
npm run translate:wire                 # idempotent; should report zero after current wiring
npm run translate:validate             # strict coverage + placeholder + provider checks
# or run the entire guarded workflow:
npm run translate:all:gtx
# pilot one language first if desired:
#   npm run translate:gen -- --provider gtx --langs ar --hardcoded docs/hardcoded-source.json
git status                             # review the generated *.{lang}.json + hardcoded.*.json
```

Expected output: `ar.json` … `fil.json` regenerated with Google translations, plus `hardcoded.<lang>.json` for each language and an updated report. Existing partial translations are replaced by Google output (this is the intent). Convert page literals to `tt('…')` guided by `hardcoded-strings-report.md`.

**Cloud alternative (if the free endpoint is blocked):** enable “Cloud Translation API” on a Google Cloud project, then
`GOOGLE_TRANSLATE_API_KEY=<key> npm run translate:gen -- --hardcoded docs/hardcoded-source.json`.

---

## 12. Open Decisions (need owner sign-off)

1. **Widget vs Plan B** — attempt P1, or go straight to API-generated JSON? (Recommended: P1 spike → Plan B default.)
2. **Confirm translation surface** — is restricting machine translation to UI chrome (Scripture + user content stay untranslated) the correct product behavior?
3. **Reload on language switch** — acceptable as the reliable cold path in v1?
4. **Attribution** — keep visible Google-branded attribution, or pay for the API to drop it?
5. **File placement/name** — this plan lives at `web/docs/GOOGLE_TRANSLATE_INTEGRATION_PLAN.md`.

---

## 13. References

- Current: `web/src/components/languages/languageProvider.tsx`, `type.ts`, `localeUtils.ts`, `web/src/components/Routes/routes.ts`, `web/src/features/*/pages`
- Existing docs: `docs/WEB_APP_IMPLEMENTATION_PLAN.md`, `docs/progress.md`, `docs/CATHEDRAL_THEME_PLAN.md`
- Vendor: `https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit`
