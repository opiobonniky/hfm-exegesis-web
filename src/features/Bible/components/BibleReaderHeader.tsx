// Bible reader header - navigation, font size, audio toggle, translation picker, search
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Search,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FontSizeControls from "./FontSizeControls";
import TranslationPicker from "./TranslationPicker";
import { useLanguage } from "@/components/languages/languageProvider";

interface BibleReaderHeaderProps {
  bookName: string;
  chapter: number;
  audioActive: boolean;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onBack: () => void;
  onToggleSidebar: () => void;
  onBookOverview?: () => void;
  onReadChapter: () => void;
  onToggleSearch: () => void;
  // Translation
  translations: { id: string; name: string }[];
  selectedTranslation: string;
  onSelectTranslation: (id: string) => void;
  translationOpen: boolean;
  onTranslationOpenChange: (open: boolean) => void;
  translationSearch: string;
  onTranslationSearchChange: (search: string) => void;
}

export default function BibleReaderHeader({
  bookName,
  chapter,
  audioActive,
  fontSize,
  onFontSizeChange,
  onBack,
  onToggleSidebar,
  onBookOverview,
  onReadChapter,
  onToggleSearch,
  translations,
  selectedTranslation,
  onSelectTranslation,
  translationOpen,
  onTranslationOpenChange,
  translationSearch,
  onTranslationSearchChange,
}: BibleReaderHeaderProps) {
  const { t, isRtl } = useLanguage();
  return (
    <header className="z-30 shrink-0 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full items-center gap-1.5 px-2 sm:gap-2 sm:px-5">
        {/* Back */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onBack}
          aria-label={t.common.back}
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
        {/* Book / Chapter */}
        <button
          onClick={onToggleSidebar}
          aria-label={t.bibleReader.selectBookChapter}
          aria-haspopup="dialog"
          className="group flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-[8rem] truncate font-[family-name:var(--font-heading)] text-sm font-bold leading-tight tracking-tight text-foreground sm:max-w-[14rem] sm:text-base">
              {bookName}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Chapter {chapter}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>
        <div className="flex-1" />
        {/* Book Overview (desktop) */}
        {onBookOverview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookOverview}
            className="hidden h-9 gap-1.5 px-3 text-xs sm:flex"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Button>
        )}
        {/* Font size (desktop) */}
        <FontSizeControls
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          className="hidden sm:flex"
        />
        {/* Audio toggle */}
        <Button
          variant={audioActive ? "default" : "outline"}
          size="sm"
          onClick={onReadChapter}
          className="h-9 gap-1.5 px-2.5 text-xs"
        >
          {audioActive ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {audioActive ? t.bibleReader.stop : t.bibleReader.listen}
          </span>
        </Button>
        {/* Translation */}
        <TranslationPicker
          translations={translations}
          selectedId={selectedTranslation}
          onSelect={onSelectTranslation}
          open={translationOpen}
          onOpenChange={onTranslationOpenChange}
          search={translationSearch}
          onSearchChange={onTranslationSearchChange}
        />
        {/* Search */}
        <button
          type="button"
          onClick={onToggleSearch}
          aria-label={t.common.search}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
