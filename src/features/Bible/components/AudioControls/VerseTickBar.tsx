import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

interface VerseTickBarProps {
  currentVerseIdx: number;
  totalVerses: number;
  onSeek?: (verseIdx: number) => void;
}

/**
 * Verse-level progress bar for the audio control bar: one tick per verse in
 * the chapter, with the elapsed portion filled in. Clicking (or focusing +
 * arrow keys) seeks straight to that verse, so the bar doubles as a scrubber.
 * Ticks render compactly (gaps shrink, thin ones drop off) for long chapters,
 * and the whole strip is mirrored in RTL like the rest of the reader UI.
 */
export function VerseTickBar({
  currentVerseIdx,
  totalVerses,
  onSeek,
}: VerseTickBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillPct =
    totalVerses > 0
      ? (Math.min(currentVerseIdx + 1, totalVerses) / totalVerses) * 100
      : 0;
  const compact = totalVerses > 40;
  const evenMoreCompact = totalVerses > 80;
  const minGap = evenMoreCompact ? 2 : compact ? 3 : 6;
  const tickWidth = evenMoreCompact ? 2 : compact ? 3 : 4;

  const handleTrackClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek || totalVerses <= 0) return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
      const clamped = Math.min(Math.max(ratio, 0), 0.999);
      onSeek(Math.floor(clamped * totalVerses));
    },
    [onSeek, totalVerses],
  );

  const handleTrackKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!onSeek || totalVerses <= 0) return;
      const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (step === 0) return;
      event.preventDefault();
      event.stopPropagation();
      const next = Math.min(Math.max(currentVerseIdx + step, 0), totalVerses - 1);
      if (next !== currentVerseIdx) onSeek(next);
    },
    [currentVerseIdx, onSeek, totalVerses],
  );

  const ariaLabel = `Audio progress: verse ${Math.min(currentVerseIdx + 1, totalVerses)} of ${totalVerses}`;

  return (
    <div
      ref={barRef}
      dir="auto"
      className="group/bar relative h-3 select-none"
    >
      <div
        ref={trackRef}
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuemin={1}
        aria-valuemax={totalVerses}
        aria-valuenow={Math.min(currentVerseIdx + 1, totalVerses)}
        tabIndex={onSeek ? 0 : -1}
        aria-disabled={!onSeek}
        onClick={onSeek ? handleTrackClick : undefined}
        onKeyDown={onSeek ? handleTrackKeyDown : undefined}
        className={cn(
          "relative flex h-2.5 items-center gap-px overflow-hidden rounded-full bg-muted transition-all",
          "group-hover/bar:h-2.5 group-focus-visible/bar:h-2.5",
          onSeek && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        )}
        style={{ gap: minGap }}
      >
        {/* Elapsed fill behind the ticks */}
        <div
          className="pointer-events-none absolute inset-y-0 start-0 rounded-full bg-primary/85 transition-[width] duration-500 ease-out"
          style={{ width: `${fillPct}%` }}
        />
        {Array.from({ length: totalVerses }, (_, idx) => {
          const isPast = idx <= currentVerseIdx;
          const isCurrent = idx === currentVerseIdx;
          return (
            <span
              key={idx}
              aria-hidden
              className={cn(
                "relative z-[1] rounded-full transition-colors duration-300",
                isPast
                  ? "bg-primary-foreground/90"
                  : "bg-foreground/25 group-hover/bar:bg-foreground/40",
                isCurrent && "bg-primary-foreground shadow-[0_0_6px_hsl(var(--primary))]",
                isCurrent && !isPast && "bg-primary-foreground",
              )}
              style={{ width: tickWidth, minWidth: tickWidth }}
            />
          );
        })}
      </div>
    </div>
  );
}
