# 🌐 Exegesis Web App — Feature Status & Build Plan

> **Last Updated:** 2026-07-09
> **Stack:** Vite + React 18 (TypeScript) · shadcn/ui · Tailwind CSS · Framer Motion
> **Backend API:** Shared Express server (`backend/`) — all endpoints available

---

## 1. Current Feature Status (Updated)

After thorough codebase inspection, the web app is **significantly more complete** than earlier gap analyses suggested. Below is the accurate current state.

### ✅ Features Already Built on Web

| Feature | Status | Files |
|---------|--------|-------|
| **Auth** (Login, Register, Google SSO, Forgot Password, Verify) | ✅ Complete | `Login.tsx`, `Register.tsx`, `GoogleRegister.tsx`, `ForgotPassword.tsx`, `VerifyAccount.tsx` |
| **Landing Page** (Hero, Features, About, Footer) | ✅ Complete | `Landing.tsx` |
| **Bible Reader** (chapter rendering, TTS, highlights, notes, favorites, search, translations, infinite scroll, verse explanations, read history) | ✅ Advanced | `BibleReader.tsx` |
| **User Dashboard** (stats, daily verse, reading plans, recent activity, quick links, trivia card) | ✅ Complete | `UserDashboard.tsx` |
| **Multi-Scope Search** (5 tabs: Bible/Strong's/Journal/Topics/Lemma, cross-translation, history, popular, book/covenant filters, inline actions) | ✅ Complete | `Search.tsx`, `useSearch.ts`, `searchApi.ts` |
| **Bible Trivia** (quiz with difficulty, streak, confetti, milestones, score tracking, stats) | ✅ Complete | `Trivia.tsx`, `useTrivia.ts` |
| **Exegesis Lab** (Full 4-stage: Look/Listen/Learn/Abide, Strong's word detail dialog, book prologue, verse resources, translation comparison, passage selection, timer with audio) | ✅ Complete | `LabFlow.tsx`, `LabHome.tsx`, `LookStage.tsx`, `ListenStage.tsx`, `LearnStage.tsx`, `AbideStage.tsx`, `useLabFlow.ts` |
| **Daily Exegesis** (Today's teaching, series navigation, save to journal, open in bible) | ✅ Complete | `DailyExegesis.tsx` |
| **Journal / Legacy Ledger** (entries, search, filters, stats, favorites, delete, selection mode, bulk export PDF/txt/json, community/discover mode, author badges, exegesis-lab source badges, privacy toggle, advanced filters) | ✅ Complete | `Journal.tsx`, `JournalDetail.tsx`, `JournalEntry.tsx` |
| **Journal CRUD** (create, edit, detail, export, PDF download) | ✅ Complete | `JournalEntry.tsx`, `JournalDetail.tsx` |
| **Reading Plans** (list, detail, daily reading, progress, admin CRUD) | ✅ Complete | `ReadingPlan/` |
| **Settings** (profile, password, language, emergency contact) | ✅ Complete | `Settings.tsx` |
| **Admin Dashboard** (KPIs, users, system settings) | ✅ Complete | `Dashboard.tsx` |
| **Admin: Daily Verse CRUD** | ✅ Complete | `DailyVerse.tsx`, `AddDailyVerse.tsx` |
| **Admin: Daily Devotions CRUD** | ✅ Complete | `DailyDevotions.tsx`, `AddDailyDevotion.tsx` |
| **Admin: Verse Explanations CRUD** | ✅ Complete | `VerseExplanations.tsx`, `AddExplanation.tsx` |
| **Admin: Reading Plans CRUD** | ✅ Complete | `ReadingPlan/` |
| **Admin: Users** | ✅ Complete | `UsersPage.tsx` |
| **Admin: Journal Prompts & Templates** | ✅ Complete | `JournalPrompts.tsx`, `JournalTemplates.tsx` |
| **My Activity** | ✅ Complete | `MyActivity.tsx` |
| **i18n** (22 languages, RTL support) | ✅ Complete | `languages/` |
| **Global Layout** (AppSidebar, AppLayout, ProtectedRoute) | ✅ Complete | `AppSidebar.tsx`, `AppLayout.tsx` |
| **HimFirstMedia pages** | ✅ Complete | `HimFirstMedia/` |
| **Strong's API Service** | ✅ Complete | `strongsApi.ts` |
| **Book Prologues API Service** | ✅ Complete | `bookProloguesApi.ts` |
| **Verse Resources API Service** | ✅ Complete | `verseResourcesApi.ts` |
| **Exegesis API Service** | ✅ Complete | `exegesisApi.ts` |
| **TTS Service** (Web Speech + Edge TTS) | ✅ Complete | `ttsService.ts` |
| **Bible Modals** (Highlight Picker, Note, Search, Range Picker, Book Selector, Chapter Selector) | ✅ Complete | `BibleModals.tsx` |

### ❌ Features Still Missing on Web

| # | Feature | Priority | Est. Effort | Notes |
|---|---------|----------|-------------|-------|
| M1 | **Strong's Concordance in Bible Reader** (tappable words with dotted underline, Word Study dialog on word tap) | 🔴 Critical | 6-10 hrs | API exists (`getVerseWords`/`getStrongsEntry`), used in LabFlow but not BibleReader. Need to load verse words on chapter mount, render words with Strong's markup inline, add click → dialog. |
| M2 | **Reader Study Tools Drawer** (Commands, Promises, Warnings, Repeated Words, Transition Words, Contrasts accordion) | 🔴 Critical | 6-10 hrs | Per improving-features.md §14. Open from Bible Reader. "How Do I Study This?" guided overlay (§15) embedded within. |
| M3 | **"How Do I Study This?"** guided overlay | 🔴 Critical | 3-5 hrs | 5-step guided study (Observe, Ask, Understand, Search, Apply) |
| M4 | **Book Prologue & Study Tools in Bible Reader** | 🟡 High | 2-4 hrs | Book prologue display on context icon tap. API exists. |
| M5 | **Admin: Daily Exegesis Manager** | 🟡 High | 3-5 hrs | CRUD for daily exegesis content |
| M6 | **Admin: Trivia Manager + Analytics** | 🟡 High | 4-6 hrs | List/create/edit trivia, performance dashboards |
| M7 | **Admin: Book Prologues Manager** | 🟡 High | 2-4 hrs | CRUD for book prologues |
| M8 | **Admin: Journal Moderation** | 🟡 High | 2-4 hrs | View/mod approve/reject public entries |
| M9 | **Admin: Study Tools Manager** | 🟡 High | 2-4 hrs | CRUD for chapter study tools |
| M10 | **Admin: Activity Log** | 🟡 High | 2-4 hrs | User activity view |
| M11 | **Home Dashboard: Continue Reading card** | 🟢 Medium | 1-2 hrs | Recently read chapter |
| M12 | **Home Dashboard: Exegesis Lab resume card** | 🟢 Medium | 1-2 hrs | Active session card |
| M13 | **Home Dashboard: Journal preview card** | 🟢 Medium | 1-2 hrs | Recent entry preview |
| M14 | **Sower / Subscription Page** | 🟢 Medium | 8-12 hrs | Requires Stripe integration |
| M15 | **Font size / reading settings** | 🟢 Medium | 2-3 hrs | Persist to localStorage |

---

## 2. Priority Build Order

### Phase 1 — Now (Week 1)
| Priority | Feature | Files |
|----------|---------|-------|
| P0 | **M1: Strong's Concordance in Bible Reader** | `BibleReader.tsx` — add word-level rendering + WordStudyDialog |

### Phase 2 — Next (Week 2)
| Priority | Feature | Files |
|----------|---------|-------|
| P1 | **M2-M3: Reader Study Tools + "How Do I Study"** | New `StudyToolsSheet.tsx`, `BibleReader.tsx` |

### Phase 3 — Following (Week 3)
| Priority | Feature | Files |
|----------|---------|-------|
| P0 | **M5-M10: Missing Admin Managers** | `admin/` pages × 6 |

### Phase 4 — Polish (Week 4)
| Priority | Feature | Files |
|----------|---------|-------|
| P2 | **M11-M13: Dashboard cards** | `UserDashboard.tsx` |
| P2 | **M4: Book Prologue in Bible Reader** | `BibleReader.tsx` |

---

## 3. Backend Status

All backend endpoints **already exist**. No backend work is needed for any Phase 1-4 features. The web just needs frontend UI to call the same endpoints the app already uses successfully.

## 4. Key Architecture Decisions

### Strong's Word Rendering in BibleReader
- Fetch `verse-words` from `POST /strongs/verse-words` on chapter mount
- Build a `strongsWords` map: `Record<string, StrongsWordData[]>` keyed by verse key
- Replace `renderVerseText(text: string)` with `renderVerseWithStrongs(verseKey, text, words)` that splits text by word boundaries and renders Strong's-enabled words with `border-b border-dotted border-primary/40 cursor-help` style
- On word tap with Strong's ID, open a `WordStudyDialog` (reuse `Dialog` from shadcn, same pattern as LabFlow's word detail)
- Cache words to avoid re-fetching

### Study Tools Drawer
- Use shadcn `Sheet` component (right-side slide panel)
- Accordion sections for each tool type
- Backend: `POST /chapter-study-tools/get`

### "How Do I Study This?"
- shadcn `Dialog` overlay
- 5-step vertical flow with action buttons

---

## 5. Quick Reference

### Service APIs Ready to Consume

| API Function | Endpoint | Already Used In |
|-------------|----------|-----------------|
| `getVerseWords(book, chapter, verse?)` | `POST /strongs/verse-words` | LabFlow (Look + Learn stages) |
| `getStrongsEntry(strongsId)` | `GET /strongs/:strongsId` | LabFlow (word detail dialog) |
| `getBookPrologue(bookName)` | `POST /book-prologues/get` | LabFlow (Learn → Prologue tab) |
| `getVerseResources(book, chapter, verse)` | `POST /verse-resources/get` | LabFlow (Learn → History tab) |
| `getTranslationComparison(book, chapter, verse)` | `POST /verse-resources/compare-translations` | LabFlow (Learn → History tab) |

### File Creation Plan

| New File | Purpose | Phase |
|----------|---------|-------|
| `web/src/components/WordStudyDialog.tsx` | Strong's word detail dialog | 1 |
| `web/src/components/StudyToolsSheet.tsx` | Reader study tools drawer | 2 |
| `web/src/components/HowToStudySheet.tsx` | "How Do I Study This?" overlay | 2 |
