// Floating action bar for multi-selected verses - highlight, note, favorite, copy, share, listen
import {
  Highlighter,
  StickyNote,
  Star,
  Copy,
  Share2,
  Volume2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

interface VerseMultiSelectBarProps {
  count: number;
  onHighlight: () => void;
  onNote: () => void;
  onFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
  onListen: () => void;
  onClear: () => void;
}
export default function VerseMultiSelectBar({
  count,
  onHighlight,
  onNote,
  onFavorite,
  onCopy,
  onShare,
  onListen,
  onClear,
}: VerseMultiSelectBarProps) {
  const { t } = useLanguage();
  const handlers: Record<string, () => void> = {
    highlight: onHighlight,
    note: onNote,
    favorite: onFavorite,
    copy: onCopy,
    share: onShare,
    listen: onListen,
  };
  const actions = [
    {
      key: "highlight",
      icon: Highlighter,
      label: t.bibleReader.highlight,
      color: "text-primary",
    },
    {
      key: "note",
      icon: StickyNote,
      label: t.bibleReader.addNote,
      color: "text-amber-500",
    },
    {
      key: "favorite",
      icon: Star,
      label: t.bibleReader.bookmark,
      color: "text-rose-500",
    },
    { key: "copy", icon: Copy, label: t.common.copy, color: "text-blue-500" },
    {
      key: "share",
      icon: Share2,
      label: t.common.share,
      color: "text-emerald-500",
    },
    {
      key: "listen",
      icon: Volume2,
      label: t.bibleReader.listen,
      color: "text-purple-500",
    },
  ] as const;
  if (count === 0) return null;
  return (
    <div className="z-30 shrink-0 bg-transparent sm:px-4 sm:pb-3">
      <div
        className={cn(
          "flex items-center justify-center gap-0.5 overflow-x-auto border-t border-border bg-background/95 px-2 py-2 backdrop-blur-xl",
          "sm:mx-auto sm:w-fit sm:max-w-full sm:rounded-2xl sm:border sm:px-3 sm:shadow-lg",
        )}
      >
        {/* Count badge */}
        <div className="me-1 flex shrink-0 items-center gap-1.5 px-2 py-1">
          <span className="text-xs font-bold text-primary">{count}</span>
          <span className="text-[10px] text-muted-foreground">
            {count === 1 ? "verse" : "verses"}
          </span>
        </div>
        {/* Action buttons */}
        {actions.map(({ key, icon: Icon, label, color }) => (
          <button
            type="button"
            key={key}
            onClick={handlers[key]}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              color,
            )}
            title={label}
            aria-label={label}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        {/* Divider */}
        <div className="mx-0.5 h-6 w-px shrink-0 bg-border/50" />
        {/* Clear */}
        <button
          type="button"
          onClick={onClear}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          title={t.common.close}
          aria-label={t.common.close}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
