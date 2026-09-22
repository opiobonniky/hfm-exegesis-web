import { SkipBack, Play, Pause, SkipForward } from "lucide-react";

interface PlaybackControlsProps {
  isPaused: boolean;
  currentVerseIdx: number;
  totalVerses: number;
  previousLabel: string;
  resumeLabel: string;
  pauseLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onTogglePause: () => void;
  onNext: () => void;
}

export function PlaybackControls({
  isPaused,
  currentVerseIdx,
  totalVerses,
  previousLabel,
  resumeLabel,
  pauseLabel,
  nextLabel,
  onPrevious,
  onTogglePause,
  onNext,
}: PlaybackControlsProps) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentVerseIdx === 0}
        aria-label={previousLabel}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SkipBack className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={isPaused ? resumeLabel : pauseLabel}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {isPaused ? (
          <Play className="ms-0.5 h-4 w-4" fill="currentColor" />
        ) : (
          <Pause className="h-4 w-4" fill="currentColor" />
        )}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentVerseIdx >= totalVerses - 1}
        aria-label={nextLabel}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <SkipForward className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
