# 🌐 Exegesis Bible — Translation Progress

> **Last updated**: 2026-05-27  
> **Total sections**: 10 (common, landing, auth, dashboard, bibleReader, dailyVerse, devotions, journal, verseExplanations, readingPlan, userActivity, userManagement, error, sidebar)

---

## Legend

- ✅ **100%** — All keys translated
- 🟡 **< 100%** — Partial translation (see notes)
- ❌ **0%** — Not started (English fallback used)

---

## Language Progress

| #  | Language       | Code  | Progress | Notes |
|----|---------------|:-----:|:--------:|-------|
| 1  | English        | `en`  | ✅ 100%  | Reference language — complete |
| 2  | العربية (Arabic)| `ar` | ❌ 0%    | RTL language — needs full translation |
| 3  | Deutsch (German)| `de` | ❌ 0%    | Needs translation |
| 4  | Français (French)| `fr`| ❌ 0%    | Needs translation |
| 5  | Español (Spanish)| `es`| ❌ 0%    | Needs translation |
| 6  | Português      | `pt`  | ❌ 0%    | Needs translation |
| 7  | हिन्दी (Hindi)  | `hi`  | ❌ 0%    | Needs translation |
| 8  | বাংলা (Bengali) | `bn`  | ❌ 0%    | Needs translation |
| 9  | தமிழ் (Tamil)   | `ta`  | ❌ 0%    | Needs translation |
| 10 | తెలుగు (Telugu) | `te`  | ❌ 0%    | Needs translation |
| 11 | मराठी (Marathi) | `mr`  | ❌ 0%    | Needs translation |
| 12 | ગુજરાતી (Gujarati) | `gu` | ❌ 0% | Needs translation |
| 13 | ಕನ್ನಡ (Kannada) | `kn`  | ❌ 0%    | Needs translation |
| 14 | മലയാളം (Malayalam) | `ml` | ❌ 0% | Needs translation |
| 15 | ਪੰਜਾਬੀ (Punjabi) | `pa` | ❌ 0%    | Needs translation |
| 16 | اردو (Urdu)    | `ur`  | ❌ 0%    | RTL language — needs full translation |
| 17 | Kiswahili      | `sw`  | ❌ 0%    | Needs translation |
| 18 | Italiano (Italian) | `it` | ❌ 0%  | Needs translation |
| 19 | Ελληνικά (Greek) | `el` | ❌ 0%   | Needs translation |
| 20 | Русский (Russian) | `ru` | ❌ 0%  | Needs translation |
| 21 | नेपाली (Nepali) | `ne`  | ❌ 0%    | Needs translation |
| 22 | Filipino        | `fil` | ❌ 0%   | Needs translation |

---

## Content Sections

Each language file has the following sections that need translating:

| Section             | Key Count | Description |
|--------------------|:---------:|-------------|
| `common`           | 48        | Shared strings (buttons, labels, statuses) |
| `landing`          | 12        | Home/landing page content |
| `auth`             | 20        | Login, register, password reset, verification |
| `dashboard`        | 12        | Dashboard & user dashboard |
| `bibleReader`      | 17        | Bible reading interface |
| `dailyVerse`       | 20        | Verse of the day pages |
| `devotions`        | 13        | Devotion pages (daily & user) |
| `journal`          | 26        | Journal entries, templates, prompts |
| `verseExplanations`| 9         | Verse explanations |
| `readingPlan`      | 28        | Reading plan pages |
| `userActivity`     | 9         | User activity |
| `userManagement`   | 7         | User management (admin) |
| `error`            | 5         | Error pages (404, etc.) |
| `sidebar`          | 11        | Navigation sidebar |
| **Total**          | **237**   | |

---

## ✅ Completed

- [x] TypeScript type definitions (`type.ts`)
- [x] English reference file (`en.json`) — 237 keys across 14 sections
- [x] React context provider (`languageProvider.ts`)
- [x] Locale utilities (`localeUtils.ts`)
- [x] RTL support for Arabic & Urdu
- [x] Auto-detection of browser language
- [x] Persistent language selection (localStorage)
- [x] Dynamic JSON loading with English fallback
- [x] Date / number / relative-time formatting via `Intl`

## 📋 Todo

- [ ] Translate each language file (see table above)
- [ ] Add RTL CSS adjustments for Arabic and Urdu
- [ ] Test each language in the UI
- [ ] Add language switcher to Settings page
- [ ] Consider adding locale-specific date/time formats

---

## Development Notes

- **Fallback Strategy**: Missing keys fall back gracefully to English via `deepMerge` in the provider.
- **Adding a new language**: Add its code to `SUPPORTED_LANGUAGES` in `type.ts`, add a locale entry in `localeUtils.ts`, create `{code}.json`, and update this progress file.
- **RTL**: Arabic (`ar`) and Urdu (`ur`) are flagged as RTL. The `<html>` `dir` attribute switches automatically.
