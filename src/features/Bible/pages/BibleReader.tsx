"use client";

import { useBibleReaderPage } from "../hooks/useBibleReaderPage";
import BibleReaderHeader from "../components/BibleReaderHeader";
import BibleReaderBody from "../components/BibleReaderBody";
import VerseExplanationDrawer from "../components/VerseExplanationDrawer";
import VerseActionSheet from "../components/VerseActionSheet";
import { EditNoteDialog } from "../components/EditNoteDialog";

const IS_DEV = import.meta.env.DEV;

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

      {/* Dev-only: show the active backend URL so misconfiguration is obvious */}
      {IS_DEV && h.apiBaseUrl && (
        <div className="pointer-events-none fixed bottom-2 right-2 z-50 rounded-lg border border-border/70 bg-background/90 px-2.5 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur-sm sm:bottom-3 sm:right-3 sm:text-xs">
          API: {h.apiBaseUrl}
        </div>
      )}
    </div>
  );
}
