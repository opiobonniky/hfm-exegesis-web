import {
  Volume2,
  Lightbulb,
  Highlighter,
  StickyNote,
  Heart,
  Share2,
  Copy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SelectionActionBarProps {
  selectedCount: number;
  onListen?: () => void;
  onJournal?: () => void;
  onExplain?: () => void;
  onHighlight?: () => void;
  onNote?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onClear: () => void;
}

export default function SelectionActionBar({
  selectedCount,
  onListen,
  onExplain,
  onHighlight,
  onNote,
  onFavorite,
  onShare,
  onCopy,
  onClear,
}: SelectionActionBarProps) {
  return (
    <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-2">
            <X className="w-4 h-4" />
            Clear
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedCount} verse{selectedCount > 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onListen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onListen}
              className="gap-1"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Listen</span>
            </Button>
          )}

          {onJournal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onJournal}
              className="gap-1"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Journal</span>
            </Button>
          )}

          {onExplain && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExplain}
              className="gap-1"
            >
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Explain</span>
            </Button>
          )}

          {onHighlight && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onHighlight}
              className="gap-1"
            >
              <Highlighter className="w-4 h-4" />
              <span className="hidden sm:inline">Highlight</span>
            </Button>
          )}

          {onNote && (
            <Button variant="ghost" size="sm" onClick={onNote} className="gap-1">
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">Note</span>
            </Button>
          )}

          {onFavorite && (
            <Button variant="ghost" size="sm" onClick={onFavorite} className="gap-1">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Favorite</span>
            </Button>
          )}

          {onShare && (
            <Button variant="ghost" size="sm" onClick={onShare} className="gap-1">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          )}

          {onCopy && (
            <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
