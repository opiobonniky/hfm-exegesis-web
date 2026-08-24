// Bible reader header — navigation, font size, audio toggle, translation picker, search
import { ArrowLeft, Volume2, VolumeX, Search, ChevronDown, BookOpen } from "lucide-react";
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
  bookName, chapter, audioActive, fontSize, onFontSizeChange,
  onBack, onToggleSidebar, onBookOverview, onReadChapter, onToggleSearch,
  translations, selectedTranslation, onSelectTranslation,
  translationOpen, onTranslationOpenChange, translationSearch, onTranslationSearchChange,
}: BibleReaderHeaderProps) {
  const { t, isRtl } = useLanguage();
  return (
    <header className="shrink-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-2 px-3 sm:px-5 py-2.5">
        {/* Back */}
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onBack} aria-label={t.common.back}>
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>
        {/* Book / Chapter */}
        <button
          onClick={onToggleSidebar}
          aria-label={t.bibleReader.selectBookChapter}
          aria-haspopup="dialog"
          className="flex items-center gap-1.5 text-sm font-semibold hover:bg-muted rounded-lg px-2 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="truncate max-w-[140px]">{bookName} {chapter}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
        <div className="flex-1" />
        {/* Book Overview (desktop) */}
        {onBookOverview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBookOverview}
            className="h-8 px-2.5 text-xs gap-1.5 hidden sm:flex"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Button>
        )}
        {/* Font size (desktop) */}
        <FontSizeControls fontSize={fontSize} onFontSizeChange={onFontSizeChange} className="hidden sm:flex" />
        {/* Audio toggle */}
        <Button
          variant={audioActive ? "default" : "outline"}
          size="sm"
          onClick={onReadChapter}
          className="h-8 px-2.5 text-xs gap-1.5"
          {audioActive ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{audioActive ? t.bibleReader.stop : t.bibleReader.listen}</span>
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
          type="button"
          onClick={onToggleSearch}
          aria-label={t.common.search}
          className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center border border-border/40 hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </header>
  );
