---
title: "Exegesis Web Application Manual"
subtitle: "Volume 3 - Browser Features, User Journeys, Integrations, and Deployment"
author: "Him First Media"
date: "2026-10-20"
lang: en
---

# Scope

This manual documents the React web application in `web/`. It covers the
responsive reader, user and administrator workspaces, localization, service
worker, notifications, media, support, billing and browser-specific limitations.
It describes implementation, not a guarantee that every external service is
configured on a particular deployment.

Companion documents: [project guide](../../PROJECT_DOCUMENTATION.md),
[mobile manual](../../app/docs/APPLICATION_GUIDE.md) and
[backend manual](../../backend/docs/PLATFORM_GUIDE.md).

# Architecture and navigation

| Layer | Implementation |
| --- | --- |
| UI | React 18, TypeScript and Vite |
| Routing | React Router, lazy feature routes and Suspense |
| Components | Tailwind, shadcn/Radix primitives, Lucide and shared layouts |
| Forms | React Hook Form and Zod where adopted |
| Identity | `AuthContext`, backend application JWT, Firebase Google popup |
| HTTP | Axios-based services |
| Local preferences | localStorage |
| Offline/caching | `/sw.js` and browser Cache Storage |
| Realtime | Socket.IO client and support realtime context |
| Audio | Backend TTS service and browser playback hooks |
| Theme | Shared theme utilities and document-level styling |

`src/App.tsx` establishes auth, language, theme, routes, layouts, support realtime
and route-loading behavior. Route definitions live in
`src/components/Routes/routes.ts`. `ProtectedRoute` handles signed-in access;
administrator and subscription checks also exist in feature/backend flows.

The root landing route is role-aware: unauthenticated users see landing content,
signed-in readers see their dashboard, and administrators see the admin dashboard.
Accounts requiring a password change are redirected to that journey.

Route families include:

| Area | Representative paths |
| --- | --- |
| Identity | `/login`, `/register`, `/google-register`, `/verify-account`, `/forgot-password` |
| Dashboard | `/`, `/home`, `/dashboard`, `/user-dashboard` |
| Scripture | `/bible-books`, `/bible-chapters`, `/bible-reader`, `/book-overview` |
| Personal verse data | `/highlights`, `/notes`, `/favorites`, `/history` |
| Daily content | `/daily-verse`, `/daily-devotions`, `/user-daily-verse`, `/user-devotions` |
| Plans | `/reading-plans`, `/reading-plan-detail/:planId`, `/my-reading-plans`, `/daily-reading/:planId/:day` |
| Journal | `/journal`, `/journal/new`, `/journal/entry/:entryId`, `/journal/view/:entryId` |
| Study | `/search`, `/study-bible`, `/bible-study`, `/lab-home`, Lab flow/review routes |
| Trivia | `/trivia`, `/trivia/questions`, `/trivia/performance` |
| Settings and operations | Settings/profile, subscription, support and admin route definitions |

Paths are navigation references, not promises of public access. Actual route
metadata and backend middleware determine access.

# Identity and account lifecycle

## Email-based access

The browser provides onboarding, registration, verification, sign-in,
forgotten-password/reset and forced-password-change screens. Successful login
stores an application session, hydrates profile/tier state and prepares
authenticated API access. Profile settings include personal and extended
information plus profile/cover images.

## Google sign-in

```text
Click Google -> Firebase popup -> Google ID token
  -> /auth/google-login -> backend verifies identity and audience
  -> existing user: session
  -> new user: registrationProof -> completion form
  -> /auth/complete-google-registration -> session
```

The browser popup and backend application session are separate layers. The
application's personal data is served by the Express/PostgreSQL backend, not
automatically by Firebase Auth. The registration proof binds a new account's
completion to verified Google identity.

Google authorized domains and OAuth redirect configuration must include the
actual deployed hostname. Session restoration attempts push-token synchronization.
Logout clears the application session and invokes push cleanup and Firebase
sign-out as implemented.

# Dashboard and daily-content experience

The user dashboard provides entry points into daily verse, devotional/exegesis
material, Bible reading, personal study records and learning features.
Dedicated daily-content pages show the requested date/reference where data
exists. Editorial publication and scheduling determine what is available.

Admin-facing daily-content routes are separate from reader-facing pages. A
reader seeing no item for a date is not necessarily a rendering failure: the
record may be absent, unpublished or outside its scheduled date.

# Bible reader and verse workflows

## Opening a passage

1. Choose a book and chapter or follow a reference link.
2. Resolve the preferred translation; load bundled data or request the API.
3. Display Scripture and any available headings/context.
4. Focus a requested verse or restore appropriate chapter navigation.

The web reader supports book and chapter selection, translation selection,
continuous chapter presentation as managed by reader hooks, current-chapter
tracking and linked verse navigation. A first-time book opening can route through
the book overview before returning to the requested passage. Overview-seen state
is persisted locally.

## Typography and scrolling

- Reader font size defaults to 20 and is clamped to 12-48.
- The selected font size is persisted as `bible-font-size` in localStorage.
- User wheel/touch interaction cancels an in-progress scripted scroll animation.
- Reduced-motion preference is considered in reader scroll animation.
- Direction/layout adapt through locale and reader styling.

The browser supports its own browser/page zoom. The mobile application's
immediate two-finger text-resizing recognizer is not implemented by these web
font-size controls; the two capabilities should not be described as identical.

## Verse actions

Readers can select verses/ranges, highlight with the shared color palette,
manage notes, save favorites, view explanation/resources, copy/share where
available and move into study/journal journeys. Reference-based keys keep
selection/highlight identity tied to book, chapter and verse.

Notes include create/edit/delete dialog behavior. Explanation/resource drawers
load data for the selected reference and handle loading/empty states. Multi-verse
highlight operations have their own saving state. Persistent personal data is
stored through authenticated backend APIs.

## Personal reading collections

Highlights, Notes, Favorites and History pages provide saved-record lists and
navigation back to the underlying Scripture. Shared highlight IDs/colors align
with mobile, so server-synchronized highlights can render consistently on both
clients. This is server sharing, not an independent browser offline-sync engine.

# Bible versions, languages and translated content

## Bible datasets

The browser has lazy-loaded Bible version bundles and backend translation APIs.
The default BSB bundle is preloaded early to reduce initial reader/dashboard
loading. Preferred translation is stored locally; backend catalogue IDs and
frontend version aliases are normalized in feature services.

Language preference maps choose a suitable free Bible where one is mapped, with
English fallback. For example, `fil` maps to `tl` in catalogue requests.
The deployed catalogue and actual bundles determine available texts; no fixed
translation count is guaranteed.

## Interface translation

The current language provider exposes 39 registered interface languages. It
starts from English source strings and uses Google Translate Element to
translate rendered DOM. It applies document `lang`/`dir`, stores
`exegesis-language`, and retries language application after route changes.
Returning to English clears the translation state and reloads the page to
restore React's English DOM.

This differs from the native application's local screen-catalogue system.
Browser translation requires the external script/service; saved language choice
does not guarantee translated UI on an entirely offline first visit.

Keep interface language, published Bible translation, backend-translated study
content and spoken voice distinct. The Scripture source remains its selected
Bible dataset. Refer to the project guide for all language codes and RTL scope.

**Rendered-text boundary:** the Google widget can translate DOM text that is not
explicitly excluded, and the audited Bible feature does not establish a blanket
`notranslate` exemption for its verse components. A widget-rendered translation
must not be described as the original published wording of the selected Bible.
Use an actual catalogue/version selection when identifying a Bible translation;
interface translation and Bible-source selection are different operations.

# Search, dictionary and study resources

The browser contains unified search and resource/dictionary pages, backed by
Scripture searches, advanced/cross-translation indexes and study services.
Book/testament/scope filtering and result actions are feature-specific.
Advanced search routes can require a subscription even when basic Scripture
reading or some lookup routes are public.

Study features include:

- Verse explanations and background/context sections.
- Strong's IDs, Greek/Hebrew entries, definitions, transliteration and grammar.
- Related usage and verse references where populated.
- Chapter study tools, book prologues and overviews.
- Translation comparison and resource-section counts.
- Navigation from a resource/search result back to the reader or Lab.

Content depends on seeded/editorial data. The application does not imply every
word has a Strong's mapping in every translation.

# Exegesis Lab and journal

## Guided Lab flow

```text
Select passage -> Look -> Listen -> Learn -> Abide -> Apply / review
  -> save progress -> resume or complete -> linked journal / PDF export
```

Look captures observation; Listen supports attention/listening state; Learn
connects words/context; Abide captures prayer/reflection; Apply records practical
response. Application data is persisted with the session's Abide-related fields.
The backend stage routes are Look, Listen, Learn and Abide, not a separate Apply
endpoint. Session history/review supports returning to earlier work.

## Journal experience

Journal pages support creating, reading and editing entries, passage references,
prompts/templates, favorites, filtering/search, published discovery/likes and
available TXT/JSON/PDF export actions. Subscription gates are enforced by journal APIs.
Administrator moderation/publication controls are distinct from a user's own
private entry management.

Backend localization can return translated viewing content; raw/original text
is the appropriate basis for editing. Export-one/export-all and Lab-session PDF
routes depend on backend processing and connectivity. An exported PDF is a
snapshot, not a live synchronized journal.

# Plans, trivia and narration

## Reading plans

Browse plans, inspect details, start a plan, open daily readings, answer quizzes,
review reflections and track completed days. My Plans and daily-reading routes
represent the user's progress rather than editing the shared plan definition.
Only populated assignment days and quiz records can be shown.

## Trivia

The browser offers question and performance experiences, submission feedback and
personal statistics. Administrators have question CRUD and aggregate/per-user
analytics. The mobile offline-pack implementation is not a general offline
browser trivia promise.

## Audio

Reader/player hooks maintain a passage playlist and current verse reference.
The browser requests synthesized audio through `/tts`, offers configured voices
and speed preferences, and highlights/focuses the reported verse. Available
controls are exposed through reading/voice/player components.

Cloud audio requires reachable synthesis services. Static fallback voice names
are not proof that synthesis is available. Browser autoplay/permission rules,
supported playback APIs and provider language support affect results. Mobile
device TTS should not be assumed as an equivalent browser offline capability.

# Notifications and installable browser experience

## Web push

Prerequisites are a supported secure browser context, service-worker support,
notification permission, configured Firebase application, VAPID public key and
backend Firebase Admin access.

```text
Enable notifications -> request browser permission -> register /sw.js
  -> get FCM token using VAPID -> POST /push/register-token
  -> save time/timezone -> backend sends -> foreground/background display
  -> click notification -> focus/navigate existing tab or open app URL
```

The push service stores tokens with a Firebase-project-scoped cache key. It
unregisters old registrations and deletes the local Firebase token on disable/
logout. Missing `VITE_FIREBASE_VAPID_KEY` returns a disabled reason instead of a
working push subscription. A denied browser permission must be changed through
the browser's site settings.

## Service worker and offline boundaries

`public/sw.js` combines caching and Firebase background messaging. It uses:

- Precached shell/icons in production.
- Network-first executable JS/CSS with cached fallback.
- Cache-first same-origin static media/fonts/JSON.
- Network-first matching GET APIs with cached fallback.
- Navigation fallback to the cached shell where available.

Non-GET requests are not intercepted. Therefore the worker does **not** queue
POST highlight/note/journal writes or make every authenticated page available
offline. Data not fetched/cached previously may be unavailable. Browser eviction
or clearing site data removes retained assets/preferences. A first offline visit
is not a supported substitute for installing/downloading a mobile Bible.

Localhost/127.0.0.1 development bypasses caching to avoid stale Vite bundles.
The manifest and worker support an installable browser experience where the
browser permits it; installation/push capability differs across operating systems.

# Support, profile media and subscriptions

## Support conversations

Signed-in users can create tickets, view their conversation list, send replies,
attach supported images/PDFs and inspect status. The support realtime provider
receives ticket/message/unread/receipt events through authenticated Socket.IO.
The admin inbox adds filters, status updates, replies and aggregate statistics.

Delivered and read timestamps are distinct; a receipt update is not a new reply.
Permission and ticket ownership remain backend-enforced even with a live socket.
FAQ/support information and ticket conversations are separate experiences.

## R2 media

Profile photos, covers and support attachments are uploaded to the backend,
which validates and stores files in Cloudflare R2. The browser receives a public
or backend-proxy URL. No R2 secret belongs in `VITE_*` variables.
Account migration requires preserving object keys and updating stored media URLs,
not just changing the login email on Cloudflare.

## Subscription journeys

### Packages and verified pricing

| Package | Monthly USD | Annual USD | Family IDs |
| --- | ---: | ---: | --- |
| Free Reader | 0.00 | 0.00 | `free` |
| Legacy Sower | 3.33 | 33.33 | `legacy_sower`, `legacy_sower_monthly` |
| Covenant Sower | **7.78 configured** | 77.77 | `covenant_sower`, `covenant_sower_monthly` |

These are the local backend environment's active Stripe **test-mode** prices
verified on October 20, 2026. They do not verify a separate live deployment.
The backend emergency fallback says Covenant **$7.77/month**, but Stripe and
the web Sower card use **$7.78**. See the
[database/Stripe snapshot](../../backend/docs/SUBSCRIPTION_DATA_SNAPSHOT.md).

Database rows currently cover Free and the two annual packages, with no monthly
rows. Legacy's stored slot cap is 1,000; Covenant has no configured cap. Free
requires no recurring payment. Monthly and annual variants of the same family
have the same access rank.

### What the public plan pages describe

| Area | Free Reader | Legacy Sower | Covenant Sower |
| --- | --- | --- | --- |
| Scripture/basic tools | Reader, basic search, notes/bookmarks, daily verse | Included | Included |
| Advanced study | Not advertised as included | Strong's/topics/lemma and cross-translation search, Lab, reading plans/progress | Included |
| Journal | Basic notes | Full Legacy Ledger and journal export | Included |
| Higher-tier copy | Not included | Not included | Prayer/reflection, advanced analytics and early access |

This is the web comparison copy, not a claim of one-to-one backend enforcement.
Journal, plans, Lab and advanced search have Legacy-or-higher gates. Some
resource reads are public; no Covenant-specific `requireTier` route was found.
The AI-labelled backend uses stored context/templates rather than proving an
external generative-AI service. An ADMIN account can have Free tier and still
pass administrative/tier checks; a paid USER does not become an administrator.

### Two different browser price displays

- **`/sower`:** monthly/annual switch and purchase/manage buttons. Its grid
  renders the static `TIERS` array, including $3.33 and $7.78 monthly. The current
  hook also requests `/subscriptions/get-plans`, which is not registered by the
  backend router; that returned data is not used by the grid. These cards are
  not an automatically synchronized live price catalogue.
- **`/plans`:** public comparison using `/landing/get-tiers` database data plus
  curated benefits. When monthly rows are absent, `buildTierOverrides()` divides
  annual prices by 12 and `PlansTierStrip` labels the result `/month`. The
  inspected database yields **$2.78 Legacy** and **$6.48 Covenant** in that
  conversion, while actual configured monthly charges are $3.33/$7.78. A
  billed-annually qualifier is not added by the strip. This is a confirmed
  display-source mismatch to fix, not another verified monthly billing offer.

### Subscribe, change cadence and manage billing

1. Sign in, open Sower and select monthly or annual billing.
2. Review the package, cadence and actual Stripe Checkout amount.
3. Subscribe submits the base family and `month`/`year` to
   `/subscriptions/create-checkout-session`; browser navigates to its returned URL.
4. A new purchase opens Stripe Checkout. An existing billable subscription can
   be updated in place with prorations; the backend rejects a duplicate same
   price and rejects downgrades through checkout.
5. Stripe returns to the configured frontend URL with the subscription result.
   Web refreshes status repeatedly after successful/upgraded returns while
   webhook-derived access catches up.
6. Current paying users can choose Manage Subscription to open the Stripe portal.
   Portal options govern supported changes/cancellation; cancelling checkout
   does not grant a paid entitlement.

Changing billing interval through the portal is different from selecting a new
family on a card. A manual admin entitlement change is not a Stripe subscription
price change. Refunds use the separate admin workflow below.

# Organization information

The `HimFirstMedia` feature area includes Who We Are, founders, leadership,
goals, mission and vision pages. These informational pages are separate from
the Scripture/study services and do not establish external service integrations
simply because an organization/resource link is displayed.

# Administrator workspace

## Roles, entry and navigation

The database roles are `1=ADMIN` and `2=USER`. Sign in as ADMIN to enter the
dashboard/workspace. Public registration and payment are not the intended
administrator-provisioning workflow. Create another administrator from the
existing administrator's Create User page by explicitly selecting ADMIN.

| Area | Browser entry | Actions |
| --- | --- | --- |
| Dashboard | `/admin` and role-aware root | Summary statistics and navigation |
| Users | `/admin/users`, `/admin/users/create`, `/admin/users/:userId` | Search, create/edit roles/profile, status/verification, delete, sessions |
| Plans | `/reading-plans`, `/add-reading-plan`, `/edit-reading-plan/:planId` | Plan builders, edit metadata/days/questions, delete |
| Plan analytics | `/admin/reading-plans/:planId` | Enrollments, completion, quizzes, participants and trends |
| Trivia | `/admin/trivia`, `/admin/trivia/add`, `/admin/trivia/edit/:questionId` | Question CRUD/filtering and active state |
| Trivia analytics | `/admin/trivia/performance`, `/admin/trivia/user/:userId` | Aggregate, user and question performance |
| Daily content | `/admin/daily-content`, `/admin/daily-exegesis` | Verse/devotion/exegesis list, create/edit, scheduling/publication and delete |
| Explanations | `/admin/verse-explanations` and add/edit/detail routes | Structured explanation content |
| Study tools | `/admin/study-tools`, `/admin/study-tools/add` | Chapter resources and word/reference data |
| Book context | `/admin/book-prologues` and add/edit/detail routes | Book overview/prologue CRUD |
| Journals | `/admin/journal-moderation` and entry detail | Publication review and deletion |
| Subscriptions | `/admin/subscriptions` | Tiers, subscribers, Stripe sync, actions and event history |
| Support | `/admin/support` | Ticket inbox, replies, status and unread/receipt behavior |

Prompt/template editors are in the Journal feature rather than all appearing
under `/admin`. Some plan/content editors likewise use shared non-admin-prefixed
paths. The URL itself is not an authorization rule.

## User creation, especially ADMIN users

1. Open Users -> Create User.
2. Fill username (at least three characters), valid email, first name, optional
   remaining profile fields, phone/gender/date of birth as applicable.
3. Choose USER or ADMIN; form defaults to USER and sends numeric `userRole`.
4. Submit to `/admin/create-user`. Duplicate username/email returns an error.
5. Backend generates/hashes a temporary password, creates an active verified
   account, marks password change required, stores Free tier and queues the
   credentials email.
6. Return to `/admin/users`, reopen the user and verify the role.
7. The recipient signs in and completes the forced password-change screen.

Creation and queued-email success are not proof of SMTP delivery. The backend,
not the administrator's form, chooses the temporary password.

## Editing and account controls

Search Users by identifying fields and open its detail/editor. Edit supported
profile/email/role fields and save. The backend update targets the current
username and supports `roleId`/`roleName`; it does not simply rename every record
when text in a client form changes.

Status and verification are separate buttons: status controls account active
state; verification controls email-verified state. Backend disallows the acting
admin's own status change and deletion. Role changes require the normal session/
authorization behavior to be considered; they are not subscription upgrades.

The user detail requests login-session history. **Known wiring difference:** its
current hook sends `userId` to `get-user-activity`, while the backend service
expects `username`; the native user-detail service uses username. Treat empty
web session history as a contract gap to verify, not proof that the user never
logged in.

## Deleting a user

Select the intended user, choose Delete and confirm. Backend identifies the
account by username and refuses self-deletion. It attempts to cancel the linked
Stripe subscription and anonymize the Stripe customer, deletes specified
personal/activity records, and soft-deletes/anonymizes the application account.
It clears access/media fields, attempts R2 profile/cover cleanup and records a
subscription event. Financial history and an audit email field remain.

This is not "delete every associated byte". Stripe/media cleanup errors can be
caught while processing continues; verify external results if those operations
matter to the requested account action.

## Create a reading plan

1. Open Add Reading Plan.
2. **Metadata:** title, description, total days, category, difficulty and whether
   quiz questions are enabled.
3. **Days:** select chapter references and reflection questions; the web builder
   considers a day complete when it has a selected book and non-empty reflection.
4. **Quizzes:** add day-specific questions, four options, correct answer and
   explanation. These are not the global Trivia bank.
5. Review and submit. The plan is created first, followed by assignments and
   quizzes in separate calls.
6. Reopen the plan and verify saved day/question counts and active state.

At least one complete day is required by the builder. `totalDays` does not create
all future assignments, and the backend currently starts plans active. Partial
failure can leave a saved plan with incomplete content rather than an atomic
rollback of the entire builder.

## Edit, activate/deactivate and delete plans

Open `/edit-reading-plan/:planId`. Plan metadata and each day have independent
save actions. Metadata save sends title/description/active state/total days in
the current hook. Day save uses `assignmentId` and the update-assignment route;
existing questions use update-quiz-question, removed questions use delete, and
new questions use add-quiz-questions.

The metadata form contains additional category/difficulty/questions flags in its
model, but the audited save-meta payload does not send all of them. Do not assume
every displayed/editable metadata value is persisted without reloading and
checking the returned record.

The canonical deletion API requires **`planId`**, not numeric `id`. A legacy
`useAdminReadingPlans` hook sends `id`/`durationDays` in some CRUD paths rather
than the canonical contract; distinguish that wiring from the dedicated builder/
edit services. Deactivation removes a plan from ordinary active listings;
deletion cascades to assignments, quizzes and enrollment progress.

The admin detail displays structure, enrollment/completion counts and trends,
participant progress/streaks, quiz correctness and difficult questions. Recheck
saved content before interpreting analytics for an incomplete plan.

## Trivia question management and analysis

Open the Questions tab in `/admin/trivia`. Search/filter, inspect question
detail, or use Add/Edit routes. Enter question, at least two non-empty options,
correct-answer index, explanation, category, easy/medium/hard difficulty and
optional Scripture reference. Save and reload the list/detail. For edit, existing
values are prefilled. Deactivate by update or confirm Delete to remove a question.

Correct answers are zero-based positions in `optionsJson`; do not leave gaps
that change indexing when blank options are removed. The backend create handler
uses default active state, rather than honoring a false `isActive` input on
creation. Performance tabs include aggregate overview, sortable/paginated user
performance, individual answer history and question-level accuracy/usage.

## Daily content operations

In Daily Content, switch Verse/Devotion/Exegesis tabs, filter by display date,
and choose Add, Edit, View or Delete. Separate editors select date/publication
and content before saving. Existing records are reopened with their reference/ID
so an edit updates the intended content rather than creating an unrelated item.

- Daily Verse: version/reference, reflection, explanation, application and study sections.
- Devotion: devotional content, Scripture reference and its supporting sections.
- Daily Exegesis: title/passage, introduction/context, teaching/application,
  prayer/tags and display date.

After saving, reopen the record and check the reader's requested date/reference.
Publishing a future record is not the same as displaying it today. Only eligible
daily verse content is used by the current daily-verse push sweep.

## Study explanations, chapter tools and book prologues

- **Explanations:** choose passage, create/edit explanation/application,
  introductions/context, word studies, themes, practical applications and
  cross-references; preview detail, save or delete the selected record.
- **Chapter tools:** choose chapter/type and edit tool-specific labels, colors,
  word/reference content; list/filter, add/update and delete; preview in the reader.
- **Book prologues:** choose book and edit author, audience, writing date/location,
  purpose, summary/background, themes/people, structure, lessons/applications,
  Christ connection and key Scripture references; save the book's upsert record,
  preview the overview or delete through its manager.

These are shared editorial resources, not private user notes. Legacy explanation
mutation routes currently have authenticated-only rather than admin-specific
checks; the editor UI alone is not proof of complete role enforcement.

## Journal moderation, prompts and templates

Moderation lists/searches entries, opens full detail, toggles public/private
publication and confirms deletion. A publication toggle affects discovery
visibility; it does not edit the author's account role or paid tier.

The separate Journal Prompts editor supports create/update/delete with prompt
text, category/description, ordering, active state and optional book/chapter/
verse scope. The Templates editor creates named/category-based prompt sets and
deletes selected templates. There is no registered standalone template-update
route; do not promise a full template edit operation from create/delete alone.

## Subscriber administration

`/admin/subscriptions` initially opens **Tiers**; its **Subscribers** tab fetches
users and reconciliation summaries. This differs from native's Users-first tab.

1. Load Subscribers and inspect database versus Stripe tier/status/expiry.
2. **Sync Stripe:** reconcile subscriber mappings/state and refresh the table;
   this is different from synchronizing tier definitions.
3. **Manage:** choose application tier and optional expiry, save, reload and
   inspect history. This is an entitlement override, not a Stripe-price update.
4. **Suspend/Resume:** confirmation changes the account-status label. It neither
   cancels billing nor sets `status=false`; it is not verified universal blocking.
5. **Refund:** select reason and confirm; the server looks for a refundable
   charge/payment, refunds it, attempts cancellation, moves the user to Free and
   logs the action. Missing refundable payment is an error, not a manual credit.
6. **History:** open the user's event timeline; backend returns newest events
   with a default 50 and maximum 200 requested records.

## Subscription tier administration

Open Tiers, choose Create or Edit, and set name, description, price in dollars,
currency, interval, feature lines, active state, ordering and optional slot cap.
Save and reload. Existing name changes can update Stripe product names;
price/cadence changes create a new Price and update the database association.
Existing subscribers are not automatically repriced.

Seed Default Tiers fills missing Free/Legacy/Covenant annual base rows and skips
existing rows. Delete Tier removes the database definition, not payments or
active subscriptions. The backend also exposes tier-definition Stripe sync,
separate from the user-sync button.

Creating a new named tier does not extend the current checkout whitelist or
fixed entitlement ranks. Generic generated `_month` IDs also differ from the
supported family `_monthly` identifiers. Public pricing and the admin database
list have different sources; use the verified snapshot and reload each surface
before declaring a change synchronized.

## Support inbox and operational parity

Open `/admin/support`, filter/search tickets and inspect a conversation. Reply
with the available attachment workflow, update its status and review unread/
delivery/read receipts. Messages and status changes persist through the support
API; Socket.IO invalidates/updates the live inbox state. An unread badge is not
the same as an email or a push delivery receipt.

Native provides general Activity and translation-site-setting controls that were
not found as equivalent standalone web administration surfaces in this audit.
Conversely, web has subscription history and journal detail/deletion workflows
not mirrored by the audited native list hooks. These differences are recorded,
not filled in with assumed UI parity.

# Environment and deployment

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Browser application's backend origin |
| `VITE_FIREBASE_VAPID_KEY` | Public Web Push certificate key |
| `VITE_SUPABASE_URL` | Generated Supabase client configuration, where used |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase client key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase integration/project metadata |

Firebase application configuration is maintained in
`src/firebaseConfiguration/config.ts` and must agree with the worker's project.
The generated Supabase client/types exist in the repository, but the audited
core authentication/data journey uses the backend API. Merely having that SDK
does not establish a second active identity/data platform for all features.

From `web/`:

```bash
npm install
npm run dev
npm run build
npm run preview
```

Deploy `dist/` to the chosen static hosting environment with SPA fallback for
deep routes, HTTPS, root-served `sw.js` and manifest/icons. Configure the correct
API URL before building: Vite variables are embedded into build output.
Authorize the deployed domain in Firebase. Preserve Socket.IO connectivity to
the backend and its expected socket path for live support events.

# Validation and troubleshooting

```bash
npm test
npm run typecheck:app
npm run build
```

Playwright configuration and `e2e/` also exist for browser journey checks.
Typecheck/build/test outcomes should be reported independently; passing a build
is not proof that strict typecheck or every external integration passes.

| Symptom | Investigate |
| --- | --- |
| Google popup fails | Domain authorization, current OAuth/Firebase config, popup restrictions |
| Push cannot enable | Permission, HTTPS, VAPID key, browser support, worker registration |
| Old UI after deploy | Worker/cached chunks, deployment cache policy and refresh path |
| Translated UI missing | Google Translate script availability and current language application |
| Protected page/API fails | Application JWT, account state and required subscription |
| Media image/attachment fails | Stored URL, new R2 bucket object, public access/proxy response |
| Deep URL returns hosting 404 | Static host SPA rewrite/fallback configuration |
| Support thread stale | Socket authentication/connectivity and latest ticket API state |

# Implementation reference

| Path relative to `web/` | Responsibility |
| --- | --- |
| `src/App.tsx` | Providers, layouts and route orchestration |
| `src/components/Routes/routes.ts` | Route inventory and metadata |
| `src/contexts/AuthContext.tsx` | Session restore/login/logout and push synchronization |
| `src/services/api.ts` | Backend HTTP client |
| `src/features/Bible/hooks/useBibleReader.ts` | Reader data, versions and actions |
| `src/features/Bible/hooks/useBibleReaderPage.ts` | Verse focus, typography, drawers, actions and scroll behavior |
| `src/features/Bible/services/freeBibleTranslations.ts` | Language/version preferences |
| `src/components/languages/languageProvider.tsx` | Google Translate-backed UI localization |
| `src/services/pushService.ts` | Browser permission and FCM lifecycle |
| `public/sw.js` | Caching, background messages and notification clicks |
| `src/features/support/contexts/SupportRealtimeContext.tsx` | Support realtime integration |
| `src/features/Journal/` | Journal views, hooks and API usage |
| `src/features/Lab/` | Guided study and session review |
| `src/features/Admin/` | Administrative workspace |

For Markdown-to-PDF commands, see the project guide. Keep this document aligned
with actual route/component behavior when modifying features.
