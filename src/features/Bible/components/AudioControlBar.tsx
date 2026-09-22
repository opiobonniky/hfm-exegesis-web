import { useState } from "react";
import { Loader2, Settings2, Square } from "lucide-react";

import { useLanguage } from "@/components/languages/languageProvider";
import { cn } from "@/lib/utils";
import type { AudioControlBarProps } from "../types";
import { SpeedControl } from "./AudioControls/SpeedControl";
import { VolumeControl } from "./AudioControls/VolumeControl";
import { VoiceControl } from "./AudioControls/VoiceControl";
import { RepeatControl } from "./AudioControls/RepeatControl";
import { PlaybackControls } from "./AudioControls/PlaybackControls";
import { VerseTickBar } from "./AudioControls/VerseTickBar";
import ReaderDock from "./ReaderDock";

export default function AudioControlBar({
  audioState,
  audioActions,
  bookName,
  chapter,
}: AudioControlBarProps) {
  const { t, isRtl } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const currentPosition = Math.min(
    audioState.currentVerseIdx + 1,
    audioState.totalVerses,
  );
  const repeatLabel =
    audioState.repeatMode === "none"
      ? "Off"
      : audioState.repeatMode === "one"
        ? "One"
        : "All";

  return (
    <ReaderDock
      lift={expanded ? "-mt-56" : "-mt-20"}
      safeArea
      className="h-auto"
      barClassName="mx-auto w-full max-w-2xl overflow-hidden shadow-[0_-10px_28px_-22px_hsl(var(--foreground))] sm:rounded-xl"
    >
      <div className="px-2 pt-2 sm:px-3">
        <VerseTickBar
          currentVerseIdx={audioState.currentVerseIdx}
          totalVerses={audioState.totalVerses}
          onSeek={audioActions.seekToVerse}
        />
      </div>

      {expanded && (
        <div className="border-b border-border/60 bg-muted/15 px-3 py-2 sm:px-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <SpeedControl
              speechRate={audioState.speechRate}
              onSpeechRateChange={audioActions.setSpeechRate}
            />
            <VolumeControl
              volume={audioState.volume}
              onVolumeChange={audioActions.setVolume}
            />
            <VoiceControl
              voices={audioState.voices}
              selectedVoice={audioState.selectedVoice}
              onVoiceChange={audioActions.setVoice}
            />
            <RepeatControl
              repeatMode={audioState.repeatMode}
              onCycle={audioActions.cycleRepeatMode}
              label={t.bibleReader.repeatModeLabel.replace(
                "{mode}",
                repeatLabel,
              )}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-12 items-center gap-1.5 px-2 py-1.5 sm:gap-2 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
              audioState.isBuffering
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : audioState.isPaused
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary",
            )}
            aria-label={
              audioState.isBuffering
                ? "Buffering"
                : audioState.isPaused
                  ? "Paused"
                  : "Now playing"
            }
            title={
              audioState.isBuffering
                ? "Buffering"
                : audioState.isPaused
                  ? "Paused"
                  : "Now playing"
            }
          >
            {audioState.isBuffering ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <p className="min-w-0 truncate font-[family-name:var(--font-heading)] text-xs font-bold text-foreground sm:text-sm">
            {bookName} {chapter}:{currentPosition}
          </p>
          <span className="shrink-0 text-[9px] font-medium tabular-nums text-muted-foreground sm:text-[10px]">
            {currentPosition}/{audioState.totalVerses}
          </span>
        </div>

        <PlaybackControls
          isPaused={audioState.isPaused}
          currentVerseIdx={audioState.currentVerseIdx}
          totalVerses={audioState.totalVerses}
          previousLabel={t.bibleReader.previousVerse}
          resumeLabel={t.bibleReader.resumeAudio}
          pauseLabel={t.bibleReader.pauseAudio}
          nextLabel={t.bibleReader.nextVerse}
          onPrevious={audioActions.skipBackward}
          onTogglePause={audioActions.togglePause}
          onNext={audioActions.skipForward}
        />

        <div className="hidden h-6 w-px bg-border/60 sm:block" />

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Hide audio settings" : "Show audio settings"}
          aria-expanded={expanded}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            expanded
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={audioActions.stopPlayback}
          aria-label={t.bibleReader.stopAudio}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Square className="h-3 w-3" fill="currentColor" />
        </button>
      </div>
    </ReaderDock>
  );
}
