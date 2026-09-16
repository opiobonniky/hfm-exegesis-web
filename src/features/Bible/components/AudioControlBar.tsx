import { useState } from "react";
import { Headphones, Loader2, Settings2, Square } from "lucide-react";

import { useLanguage } from "@/components/languages/languageProvider";
import { cn } from "@/lib/utils";
import type { AudioControlBarProps } from "../types";
import { SpeedControl } from "./AudioControls/SpeedControl";
import { VolumeControl } from "./AudioControls/VolumeControl";
import { VoiceControl } from "./AudioControls/VoiceControl";
import { RepeatControl } from "./AudioControls/RepeatControl";
import { PlaybackControls } from "./AudioControls/PlaybackControls";
import { VerseTickBar } from "./AudioControls/VerseTickBar";

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
    <div className="relative z-20 shrink-0 bg-transparent sm:px-4 sm:pb-3 h-10 -mt-28">
      <div className="mx-auto w-full max-w-3xl overflow-hidden border-t border-border/70  shadow-[0_-12px_36px_-24px_hsl(var(--foreground))] backdrop-blur-xl sm:rounded-2xl sm:border">
        <div className="px-3 pt-3.5 sm:px-4">
          <VerseTickBar
            currentVerseIdx={audioState.currentVerseIdx}
            totalVerses={audioState.totalVerses}
            onSeek={audioActions.seekToVerse}
          />
        </div>

        {expanded && (
          <div className="border-b border-border/60 bg-muted/15 px-3 py-3 sm:px-5">
            <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Headphones className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]",
                  audioState.isBuffering
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-primary/20 bg-primary/5 text-primary",
                )}
              >
                {audioState.isBuffering && (
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                )}
                {audioState.isBuffering
                  ? "Buffering"
                  : audioState.isPaused
                    ? "Paused"
                    : "Now playing"}
              </span>
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                {currentPosition} / {audioState.totalVerses}
              </span>
            </div>
            <p className="mt-1 truncate font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
              {bookName} {chapter}:{currentPosition}
            </p>
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

          <div className="hidden h-7 w-px bg-border/60 sm:block" />

          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            aria-label={
              expanded ? "Hide audio settings" : "Show audio settings"
            }
            aria-expanded={expanded}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              expanded
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={audioActions.stopPlayback}
            aria-label={t.bibleReader.stopAudio}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Square className="h-3.5 w-3.5" fill="currentColor" />
          </button>
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-card/95 sm:hidden" />
    </div>
  );
}
