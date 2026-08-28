import { useState } from "react";
import {
  ChevronDown,
  Gauge,
  Headphones,
  Mic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Settings2,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
} from "lucide-react";

import { useLanguage } from "@/components/languages/languageProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import type {
  AudioPlayerActions,
  AudioPlayerState,
} from "@/hooks/useAudioPlayer";
import { cn } from "@/lib/utils";
import type { TTSVoice } from "@/services/ttsService";

interface AudioControlBarProps {
  audio: AudioPlayerState & AudioPlayerActions;
  bookName: string;
  chapter: number;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function AudioControlBar({
  audio,
  bookName,
  chapter,
}: AudioControlBarProps) {
  const { t, isRtl } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const currentPosition = Math.min(
    audio.currentVerseIdx + 1,
    audio.totalVerses,
  );
  const progressPct =
    audio.totalVerses > 0 ? (currentPosition / audio.totalVerses) * 100 : 0;
  const repeatLabel =
    audio.repeatMode === "none"
      ? "Off"
      : audio.repeatMode === "one"
        ? "One"
        : "All";

  return (
    <div className="relative z-40 shrink-0 bg-transparent sm:px-4 sm:pb-3">
      <div className="mx-auto w-full max-w-3xl overflow-hidden border-t border-border/70 bg-card/95 shadow-[0_-12px_36px_-24px_hsl(var(--foreground))] backdrop-blur-xl sm:rounded-2xl sm:border">
        <div
          className="h-1 bg-muted/50"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={audio.totalVerses}
          aria-valuenow={currentPosition}
        >
          <div
            className="h-full rounded-e-full bg-primary transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {expanded && (
          <div className="border-b border-border/60 bg-muted/15 px-3 py-3 sm:px-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <section className="rounded-xl border border-border/60 bg-background/70 p-3">
                <div className="mb-2.5 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Speed
                  </span>
                  <span className="ms-auto rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {audio.speechRate}×
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => audio.setSpeechRate(rate)}
                      aria-label={`Set reading speed to ${rate} times`}
                      aria-pressed={audio.speechRate === rate}
                      className={cn(
                        "rounded-lg px-1 py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        audio.speechRate === rate
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {rate}×
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-border/60 bg-background/70 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Volume
                  </span>
                  <span className="ms-auto text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {Math.round(audio.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[audio.volume * 100]}
                  min={0}
                  max={100}
                  step={5}
                  aria-label="Reading volume"
                  onValueChange={([value]) => audio.setVolume(value / 100)}
                />
              </section>

              <section className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mic className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Reading voice
                  </p>
                  <Popover open={voiceOpen} onOpenChange={setVoiceOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Select voice"
                        className="mt-0.5 flex max-w-full items-center gap-1 text-start text-xs font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="truncate">
                          {audio.selectedVoice?.name || "Default"}
                        </span>
                        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="max-h-[300px] w-[260px] overflow-hidden p-0"
                      align={isRtl ? "start" : "end"}
                    >
                      <div className="border-b border-border/60 px-3 py-2.5">
                        <p className="text-xs font-bold text-foreground">
                          Select reading voice
                        </p>
                      </div>
                      <div className="max-h-[250px] overflow-y-auto p-1.5">
                        {audio.voices.map((voice: TTSVoice) => (
                          <button
                            type="button"
                            key={voice.voiceId}
                            onClick={() => {
                              audio.setVoice(voice);
                              setVoiceOpen(false);
                            }}
                            aria-pressed={
                              audio.selectedVoice?.voiceId === voice.voiceId
                            }
                            className={cn(
                              "w-full rounded-lg px-2.5 py-2 text-start text-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              audio.selectedVoice?.voiceId === voice.voiceId &&
                                "bg-primary/10 font-semibold text-primary",
                            )}
                          >
                            {voice.name}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </section>

              <button
                type="button"
                onClick={audio.cycleRepeatMode}
                aria-label={t.bibleReader.repeatModeLabel.replace(
                  "{mode}",
                  repeatLabel,
                )}
                aria-pressed={audio.repeatMode !== "none"}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/70 p-3 text-start transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    audio.repeatMode === "none"
                      ? "bg-muted text-muted-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {audio.repeatMode === "one" ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Repeat
                  </span>
                  <span className="block text-xs font-bold text-foreground">
                    {repeatLabel}
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
            <Headphones className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                {audio.isPaused ? "Paused" : "Now playing"}
              </span>
              <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
                {currentPosition} / {audio.totalVerses}
              </span>
            </div>
            <p className="mt-1 truncate font-[family-name:var(--font-heading)] text-sm font-bold text-foreground">
              {bookName} {chapter}:{currentPosition}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={audio.skipBackward}
              disabled={audio.currentVerseIdx === 0}
              aria-label={t.bibleReader.previousVerse}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={audio.togglePause}
              aria-label={
                audio.isPaused
                  ? t.bibleReader.resumeAudio
                  : t.bibleReader.pauseAudio
              }
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {audio.isPaused ? (
                <Play className="ms-0.5 h-5 w-5" fill="currentColor" />
              ) : (
                <Pause className="h-5 w-5" fill="currentColor" />
              )}
            </button>
            <button
              type="button"
              onClick={audio.skipForward}
              disabled={audio.currentVerseIdx >= audio.totalVerses - 1}
              aria-label={t.bibleReader.nextVerse}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

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
            onClick={audio.stopPlayback}
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
