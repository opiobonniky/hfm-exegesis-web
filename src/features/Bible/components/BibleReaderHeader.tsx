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

/* ─── Navigation Props ───────────────────────────────────────────────────── */
interface NavigationProps {
  bookName: string;
  chapter: number;
  onBack: () => void;
  onToggleSidebar: () => void;
  onBookOverview?: () => void;
}

/* ─── Audio Props ────────────────────────────────────────────────────────── */
interface AudioProps {
  active: boolean;
  onToggle: () => void;
}

/* ─── Translation Props ──────────────────────────────────────────────────── */
interface TranslationProps {
  translations: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

/* ─── Toolbar Props ──────────────────────────────────────────────────────── */
interface ToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onToggleSearch: () => void;
}

/* ─── Main Props ─────────────────────────────────────────────────────────── */
interface BibleReaderHeaderProps {
  navigation: NavigationProps;
  audio: AudioProps;
  translation: TranslationProps;
  toolbar: ToolbarProps;
}

export default function BibleReaderHeader({
  navigation,
  audio,
  translation,
  toolbar,
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
          onClick={navigation.onBack}
          aria-label={t.common.back}
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>

        {/* Book / Chapter */}
        <button
          onClick={navigation.onToggleSidebar}
          aria-label={t.bibleReader.selectBookChapter}
          aria-haspopup="dialog"
          className="group flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="max-w-[8rem] truncate font-[family-name:var(--font-heading)] text-sm font-bold leading-tight tracking-tight text-foreground sm:max-w-[14rem] sm:text-base">
              {navigation.bookName}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Chapter {navigation.chapter}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>

        <div className="flex-1" />

        {/* Book Overview (desktop) */}
        {navigation.onBookOverview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigation.onBookOverview}
            className="hidden h-9 gap-1.5 px-3 text-xs sm:flex"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Button>
        )}

        {/* Font size (desktop) */}
        <FontSizeControls
          fontSize={toolbar.fontSize}
          onFontSizeChange={toolbar.onFontSizeChange}
          className="hidden sm:flex"
        />

        {/* Audio toggle */}
        <Button
          variant={audio.active ? "default" : "outline"}
          size="sm"
          onClick={audio.onToggle}
          className="h-9 gap-1.5 px-2.5 text-xs"
        >
          {audio.active ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {audio.active ? t.bibleReader.stop : t.bibleReader.listen}
          </span>
        </Button>

        {/* Translation */}
        <TranslationPicker
          translations={translation.translations}
          selectedId={translation.selectedId}
          onSelect={translation.onSelect}
          open={translation.open}
          onOpenChange={translation.onOpenChange}
          search={translation.search}
          onSearchChange={translation.onSearchChange}
        />

        {/* Search */}
        <button
          type="button"
          onClick={toolbar.onToggleSearch}
          aria-label={t.common.search}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
