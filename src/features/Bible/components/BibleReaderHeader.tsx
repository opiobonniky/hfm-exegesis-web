// Bible reader header - navigation, font size, audio toggle, translation picker, search
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Search,
  ChevronDown,
  BookOpen,
  Layers3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FontSizeControls from "./FontSizeControls";
import TranslationPicker from "./TranslationPicker";
import type { BibleReaderHeaderProps } from "../types";
import { tt } from '@/components/languages/hardcodedTranslate';

export default function BibleReaderHeader({
  bookName,
  chapter,
  backLabel,
  selectBookLabel,
  selectChapterLabel,
  searchLabel,
  listenLabel,
  stopLabel,
  isRtl,
  audioActive,
  translations,
  selectedTranslationId,
  translationOpen,
  translationSearch,
  fontSize,
  onBack,
  onSelectBook,
  onSelectChapter,
  onBookOverview,
  onAudioToggle,
  onTranslationSelect,
  onTranslationOpenChange,
  onTranslationSearchChange,
  onFontSizeChange,
  onSearch,
}: BibleReaderHeaderProps) {
  return (
    <header className="z-30 shrink-0 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 w-full items-center gap-1.5 px-2 sm:gap-2 sm:px-5">
        {/* Back */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={onBack}
          aria-label={backLabel}
        >
          <ArrowLeft className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
        </Button>

        {/* Book */}
        <button
          type="button"
          onClick={onSelectBook}
          aria-label={selectBookLabel}
          className="group flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="max-w-[5.5rem] truncate font-[family-name:var(--font-heading)] text-sm font-bold leading-tight tracking-tight text-foreground sm:max-w-[12rem] sm:text-base">
            {bookName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>

        {/* Chapter */}
        <button
          type="button"
          onClick={onSelectChapter}
          aria-label={selectChapterLabel}
          className="group flex shrink-0 items-center gap-1.5 rounded-xl px-2 py-2 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3"
        >
          <Layers3 className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-foreground sm:text-sm">
            <span className="hidden sm:inline">{tt("Chapter")} </span>{chapter}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
        </button>

        <div className="flex-1" />

        {/* Book Overview (desktop) */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBookOverview}
          className="hidden h-9 gap-1.5 px-3 text-xs sm:flex"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{tt("Overview")}</span>
        </Button>

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
          onClick={onAudioToggle}
          className="h-9 gap-1.5 px-2.5 text-xs"
        >
          {audioActive ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">
            {audioActive ? stopLabel : listenLabel}
          </span>
        </Button>

        {/* Translation */}
        <TranslationPicker
          translations={translations}
          selectedId={selectedTranslationId}
          onSelect={onTranslationSelect}
          open={translationOpen}
          onOpenChange={onTranslationOpenChange}
          search={translationSearch}
          onSearchChange={onTranslationSearchChange}
        />

        {/* Search */}
        <button
          type="button"
          onClick={onSearch}
          aria-label={searchLabel}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
