# Bible edition preferences

- Only **Settings → Reading → Preferred Translation** writes `preferred_translation`.
- Bible Reader and Search may read that default, but manual choices and explicit
  edition links change only the current page/URL. Language fallbacks do not write it.
- Admin editors use `useBibleEditions`: `setVersion` changes the item being edited;
  `setPreferredVersion` is reserved for Settings. Saved items retain their edition.
- New pickers offer the current UI language. An incompatible preference uses an
  available language-specific default without replacing the saved preference.
- BSB and Berean identify the same edition. BSB/Berean is the English fallback.
- This is browser-local preference storage, not a site-wide default or an
  account-synchronized preference. No other user's stored preference is modified.

## Verification — 2026-11-18

- Full web suite: 82 files, 496 tests passed.
- Production build, including app/node TypeScript projects: passed.
- Regression tests cover manual editor/reader/search choices, explicit links,
  automatic language fallbacks, fresh reader visits and Settings persistence.
- Related backend full suite: 99 suites, 901 tests passed; production health passed.

Existing large bundled-Bible chunk warnings remain unrelated to this change.
