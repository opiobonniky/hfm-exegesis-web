# Google Translate Element Integration

## Runtime

The web app uses Google Translate Element as its only translation runtime. It follows the CDN widget approach documented by W3Schools and does not require an API key:

```html
<script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
```

`src/components/languages/googleTranslate.ts` owns script loading, widget initialization, language-code mapping, the `googtrans` cookie, and synchronization with Google's hidden selector. The app's existing language controls remain the visible UI.

## Behavior

- `LanguageProvider` renders English source strings so Google can translate the complete rendered DOM.
- The selected app language remains available to API requests, Bible translation selection, locale formatting, and RTL layout.
- The selection persists in `localStorage` as `exegesis-language` and in Google's `googtrans` cookie.
- All 22 app languages are included. Filipino maps from the app code `fil` to Google's legacy code `tl`.
- Route changes retry selector synchronization for content mounted by React or Suspense.
- Language pickers have `notranslate` boundaries so Google does not mutate Radix Select internals.
- Returning to English clears the Google cookie and reloads once. Google does not provide English as a target option, so this reliably restores React's original DOM.
- Google's default selector, banner, tooltip, helper iframes, and loading spinner are hidden in `src/index.css`. Google injects that chrome as direct children of `<body>`, outside the widget container, so it is matched by the shared `VIpgJd-ZVi9od-` class prefix rather than individual hashed class names (the hashes change between Google deploys, and the widget's `translate_static/img/loading.gif` otherwise stays on screen).
- If the CDN is blocked, the app remains usable in English and logs the load error.

## Static Text Audit

`npm run translate:scan` inventories user-facing literals and writes:

- `docs/hardcoded-source.json`
- `docs/hardcoded-strings-report.md`

`npm run translate:wire` wraps audited literals in `tt(text)`. `tt` is an English source marker only; Google translates the resulting DOM. Neither command generates translated dictionaries or makes network requests.

## DOM Stability

Google rewrites the live DOM. For each translatable text node it **removes the original text node** and substitutes a `<font style="vertical-align: inherit">` wrapper holding the translation (verified in-browser with a MutationObserver). React still holds a reference to the removed node, so the next commit that deletes it throws:

```
NotFoundError: Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
```

This happens on every unmount of translated markup, not just loading buttons: Radix tab panels, dialogs, conditional renders, list removals, route changes, and Framer Motion exits. Patching individual components is not tractable, so `src/lib/domStability.ts` installs idempotent guards on `Node.prototype.removeChild` and `Node.prototype.insertBefore` from `src/main.tsx` before React mounts:

- `removeChild` removes the node from wherever it actually lives (Google's `<font>`, or a no-op when already detached) and prunes the empty wrapper Google left behind.
- `insertBefore` appends instead when the reference node is no longer a child of the target, which is the same failure on the insert path.

Callers that respect the DOM contract are unaffected, so behaviour only changes after Google has rewritten the tree.

`StableLoadingContent` (`src/components/ui/StableLoadingContent.tsx`) is a complementary optimisation: it keeps idle and pending branches mounted and toggles visibility, so loading buttons do not swap translated nodes at all.

Note that when React removes a host's only text child it also resets that host's `textContent`, which drops the `<font>` wrapper with it. That is React's own contract, not a crash, and the new English source is re-translated on the widget's next pass.

## Verification

- Production Vite build passes.
- Unit tests cover English source text, Google selector synchronization, cookies, `fil` mapping, and the DOM guards (detached node, re-parented node, wrong insert reference, React commit against Google-mutated markup).
- Browser checks cover English to French, French to English, and English to Arabic with `dir="rtl"`.
- The Settings tab crash is covered by a before/after browser run: with the guards removed at runtime the app throws the reported `removeChild` error, trips `FeatureErrorBoundary:Settings`, and the tab triggers stop responding; with the guards installed the same interaction produces no errors.

Run the focused checks with:

```bash
npx vitest run src/lib/domStability.test.tsx \
  src/components/ui/StableLoadingContent.test.tsx \
  src/components/languages/hardcodedTranslate.test.ts \
  src/components/languages/googleTranslate.test.ts
npm run build
```
