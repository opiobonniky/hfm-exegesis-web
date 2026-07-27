import { X, Volume2, VolumeX, Highlighter, BookMarked, Star, Copy, PenLine, Share2, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { ToolbarBtn } from "@/lib/bibleHelpers";

export interface SelectionActionBarProps {
  selectedVerses: string[];
  isSpeaking: boolean;
  voiceMode: "chapter" | "selected" | null;
  selectedBook: string;
  selectedChapter: number;
  selectedVerse: number | null;
  displayBook: string;
  displayChapter: number;
  onClearSelection: () => void;
  onReadSelectedVerses: () => void;
  onOpenHighlightPicker: () => void;
  onOpenNoteModal: () => void;
  onAddFavorite: () => void;
  onOpenFavoriteModal: () => void;
  onCopyVerses: (rangeStart?: number, rangeEnd?: number) => void;
  onOpenCopyModal: () => void;
  onShareVerses: (rangeStart?: number, rangeEnd?: number) => void;
  onOpenShareModal: () => void;
  onNavigateToJournal: (verseNum: string) => void;
  onNavigateToStudy: () => void;
  isConsecutiveSelection: () => boolean;
}

export default function SelectionActionBar({
  selectedVerses,
  isSpeaking,
  voiceMode,
  selectedBook,
  selectedChapter,
  selectedVerse,
  displayBook,
  displayChapter,
  onClearSelection,
  onReadSelectedVerses,
  onOpenHighlightPicker,
  onOpenNoteModal,
  onAddFavorite,
  onOpenFavoriteModal,
  onCopyVerses,
  onOpenCopyModal,
  onShareVerses,
  onOpenShareModal,
  onNavigateToJournal,
  onNavigateToStudy,
  isConsecutiveSelection,
}: SelectionActionBarProps) {
  const { t } = useLanguage();

  if (selectedVerses.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 flex justify-center px-3 sm:px-4 pt-2 pb-1 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 bg-background/95 backdrop-blur border border-border/60 rounded-full px-2 sm:px-3 py-1.5 shadow-lg overflow-x-auto max-w-full">
        {/* Count + clear */}
        <button
          onClick={onClearSelection}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground min-h-[44px] px-2 py-1 rounded-full hover:bg-muted/50 active:scale-[0.97] transition-all shrink-0 [touch-action:manipulation]"
        >
          <X className="w-3 h-3" />
          <span>{selectedVerses.length}</span>
        </button>

        <div className="w-px h-4 bg-border/60 mx-0.5 sm:mx-1 shrink-0" />

        {/* Listen */}
        <button
          onClick={onReadSelectedVerses}
          className={cn(
            "flex items-center gap-1 text-xs min-h-[44px] px-2 py-1 rounded-full transition-colors whitespace-nowrap shrink-0 active:scale-[0.97] [touch-action:manipulation]",
            isSpeaking && voiceMode === "selected"
              ? "bg-primary text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          )}
        >
          {isSpeaking && voiceMode === "selected" ? (
            <>
              <VolumeX className="w-3 h-3" />
              <span className="hidden sm:inline">{t.bibleReader.stop}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3" />
              <span className="hidden sm:inline">{t.bibleReader.listen}</span>
            </>
          )}
        </button>

        <ToolbarBtn
          onClick={onOpenHighlightPicker}
          icon={<Highlighter className="w-3 h-3" />}
          label={t.bibleReader.highlight}
        />
        <ToolbarBtn
          onClick={onOpenNoteModal}
          icon={<BookMarked className="w-3 h-3" />}
          label={t.bibleReader.addNote}
        />
        <ToolbarBtn
          onClick={() => {
            if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
              onAddFavorite();
            } else {
              onOpenFavoriteModal();
            }
          }}
          icon={<Star className="w-3 h-3" />}
          label={t.bibleReader.fav}
          compact
        />
        <ToolbarBtn
          onClick={() => {
            if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
              onCopyVerses();
            } else {
              onOpenCopyModal();
            }
          }}
          icon={<Copy className="w-3 h-3" />}
          label={t.common.copy}
          compact
        />
        <ToolbarBtn
          onClick={() => {
            let verseNum = "1";
            if (selectedVerses.length > 0) {
              const parts = selectedVerses[0].split(":");
              if (parts.length > 1) verseNum = parts[1];
            }
            onNavigateToJournal(verseNum);
          }}
          icon={<PenLine className="w-3 h-3" />}
          label={t.bibleReader.journal}
          compact
        />
        <ToolbarBtn
          onClick={() => {
            if (selectedVerses.length > 0 && !isConsecutiveSelection()) {
              onShareVerses();
            } else {
              onOpenShareModal();
            }
          }}
          icon={<Share2 className="w-3 h-3" />}
          label={t.common.share}
          compact
        />
        <ToolbarBtn
          onClick={onNavigateToStudy}
          icon={<Library className="w-3 h-3" />}
          label="Study"
          compact
        />
      </div>
    </div>
  );
}
