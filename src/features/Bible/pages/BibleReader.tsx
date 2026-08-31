"use client";

import { useBibleReaderPage } from "../hooks/useBibleReaderPage";
import BibleReaderHeader from "../components/BibleReaderHeader";
import BibleReaderBody from "../components/BibleReaderBody";
import VerseExplanationDrawer from "../components/VerseExplanationDrawer";
import VerseActionSheet from "../components/VerseActionSheet";
import { EditNoteDialog } from "../components/EditNoteDialog";

export default function BibleReader() {
  const h = useBibleReaderPage();

  return (
    <div
      dir={h.layout.dir}
      className="relative flex h-full flex-col overflow-hidden bg-background"
    >
      {/* ── Header ── */}
      <BibleReaderHeader {...h.header} />

      {/* ── Body: sidebar + chapter content + bottom bar ── */}
      <BibleReaderBody {...h.body} />

      {/* ── Overlays ── */}
      <VerseExplanationDrawer {...h.drawer} />
      <VerseActionSheet {...h.verseActions} />
      <EditNoteDialog {...h.note} />
    </div>
  );
}
