# Daily content editor compatibility

- Daily verse and verse-explanation references use `verseNumber` for the first
  verse and an optional `verseEnd` for the last verse in the same chapter.
  `null` clears a range; omitting it preserves the range for older clients.
- Deploy the backend migration
  `20261117150000_add_daily_content_verse_ranges` and regenerate Prisma Client
  before deploying the range editor. No production migration is run by the UI.
- Cross references accept legacy newline text, hyphen/en-dash/em-dash quote
  separators, `Psalm`/`Psalms`, and JSON arrays. New daily-content references
  are JSON arrays preserving passage fields, multiline text and commentary.
- Daily word studies remain JSON strings with `word`, `strongs`, and
  `definition`; explanations keep their structured `surfaceText`, `strongsId`,
  and `customDefinition` records. Both editors use the same structured input.
- Stored quotations are not overwritten on opening an editor. Changing a
  passage or translation refreshes its quote. Manual edits are disabled until
  the passage selection is complete. Requests for old selections cannot
  overwrite the current preview.
- Explanations retain their existing unique starting-reference identity. A
  range extends that explanation; it does not create separate copies per verse.

Verification: editor/parser/hook tests mock save requests; browser checks do
not save or update production editorial content.
