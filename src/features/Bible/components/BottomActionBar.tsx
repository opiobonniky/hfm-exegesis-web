// Bottom action bar - quick navigation and actions dock
import {
  SkipBack,
  SkipForward,
  ArrowUp,
  ArrowDown,
  Star,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

interface BottomActionBarProps {
  onPrev: () => void;
  onNext: () => void;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  onBookmark: () => void;
  onAudioToggle: () => void;
  isAudioPlaying: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
}
export default function BottomActionBar({
  onPrev,
  onNext,
  onScrollTop,
  onScrollBottom,
  onBookmark,
  onAudioToggle,
  isAudioPlaying,
  canGoPrev,
  canGoNext,
}: BottomActionBarProps) {
  const { t } = useLanguage();
  return (
    <div className="relative z-20 shrink-0 bg-transparent sm:px-4 sm:pb-3">
      <div
        className={cn(
          "flex items-center justify-around border-t border-border bg-background/95 px-2 py-2 backdrop-blur-xl",
          "sm:mx-auto sm:w-full sm:max-w-xl sm:rounded-2xl sm:border sm:px-3 sm:shadow-lg",
        )}
      >
        {/* Prev chapter */}
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label={t.bibleReader.previousChapter}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        {/* Scroll top */}
        <button
          type="button"
          onClick={onScrollTop}
          aria-label="Scroll up"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        {/* Audio toggle */}
        <button
          type="button"
          onClick={onAudioToggle}
          aria-label={
            isAudioPlaying
              ? t.bibleReader.stopReading
              : t.bibleReader.readChapter
          }
          aria-pressed={isAudioPlaying}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isAudioPlaying
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          {isAudioPlaying ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        {/* Bookmark */}
        <button
          type="button"
          onClick={onBookmark}
          aria-label={t.bibleReader.bookmark}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star className="w-4 h-4" />
        </button>
        {/* Scroll bottom */}
        <button
          type="button"
          onClick={onScrollBottom}
          aria-label="Scroll down"
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
        {/* Next chapter */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label={t.bibleReader.nextChapter}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted transition-all disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
