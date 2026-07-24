import { useState } from "react";
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import type { TTSVoice } from "@/services/ttsService";

// ── Types ──

interface SpeechItem {
  verseKey: string;
  verseNum: number;
  text: string;
}

interface VoicePlayerBarProps {
  currentItem: SpeechItem | null;
  currentIndex: number;
  total: number;
  progress: number;
  isPaused: boolean;
  voiceMode: "chapter" | "selected" | null;
  displayBook: string;
  displayChapter: number;
  canSkipBack: boolean;
  canSkipForward: boolean;
  repeatMode: "none" | "one" | "all";
  afterPlay: "continue" | "stop";
  speechRate: number;
  sleepTimerRemaining: number;
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  voice: number;
  onPauseResume: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleRepeat: () => void;
  onToggleAfterPlay: () => void;
  onSpeechRateChange: (rate: number) => void;
  onSleepTimerChange: (minutes: number | null) => void;
  onToggleMute: () => void;
  onVolumeChange: (v: number) => void;
  onVoiceChange: (voice: TTSVoice) => void;
}

// ── Button class helper ──

function playerBtnCn(base: string): string {
  return `${base} before:absolute before:content-[''] before:-inset-2 before:rounded-full relative [touch-action:manipulation]`;
}

// ── Component ──

export default function VoicePlayerBar({
  currentItem,
  currentIndex,
  total,
  progress,
  isPaused,
  voiceMode,
  displayBook,
  displayChapter,
  canSkipBack,
  canSkipForward,
  repeatMode,
  afterPlay,
  speechRate,
  sleepTimerRemaining,
  voices,
  selectedVoice,
  voice,
  onPauseResume,
  onStop,
  onSkipBack,
  onSkipForward,
  onToggleRepeat,
  onToggleAfterPlay,
  onSpeechRateChange,
  onSleepTimerChange,
  onToggleMute,
  onVolumeChange,
  onVoiceChange,
}: VoicePlayerBarProps) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState("");
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-border/70 shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          background: "hsl(var(--background) / 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Progress */}
        <div className="h-[3px] w-full bg-muted/50">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-3.5">
          {/* Left Section: Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
            <div
              className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                isPaused ? "bg-muted" : "bg-primary/10",
              )}
            >
              {isPaused ? (
                <Pause className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-1 truncate">
                {voiceMode === "chapter"
                  ? `${displayBook} · ${t.bibleReader.chShort} ${displayChapter}`
                  : t.bibleReader.selectedVerses}
              </p>
              <div className="flex items-center gap-2 overflow-hidden">
                <p
                  className="text-sm sm:text-base font-semibold text-foreground truncate leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {currentItem ? t.bibleReader.verseNum.replace('{n}', String(currentItem.verseNum)) : "—"}
                </p>
                <button
                  onClick={onToggleAfterPlay}
                  className={cn(
                    "flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter transition-colors",
                    afterPlay === "continue"
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "bg-muted text-muted-foreground border border-transparent",
                  )}
                >
                  {afterPlay === "continue" ? t.bibleReader.continueOn : t.bibleReader.autoStop}
                </button>
              </div>
            </div>

            {/* Counter */}
            <div className="flex-shrink-0 tabular-nums text-xs text-muted-foreground min-w-[40px] text-center bg-muted/30 py-1 px-2 rounded-lg">
              <span className="font-medium text-foreground">
                {currentIndex + 1}
              </span>
              <span className="opacity-40 mx-0.5">/</span>
              {total}
            </div>
          </div>

          {/* Right Section: Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-1.5 w-full sm:w-auto">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                onClick={onToggleRepeat}
                title={t.bibleReader.repeatModeLabel.replace('{mode}', repeatMode)}
                className={cn(
                  playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95"),
                  repeatMode !== "none"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {repeatMode === "one" ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
                {repeatMode === "all" && (
                  <span className="absolute text-[8px] font-bold mt-3">
                    {t.bibleReader.repeatAll}
                  </span>
                )}
              </button>

              {/* Speed Control */}
              <button
                onClick={() => {
                  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
                  const currentIdx = speeds.indexOf(speechRate);
                  const nextIdx = (currentIdx + 1) % speeds.length;
                  onSpeechRateChange(speeds[nextIdx]);
                }}
                title={`${t.bibleReader.speedX.replace('{rate}', String(speechRate))}`}
                className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all font-bold text-xs")}
              >
                {t.bibleReader.speedX.replace('{rate}', String(speechRate))}
              </button>

              {/* Sleep Timer */}
              <button
                onClick={() => {
                  const options: (number | null)[] = [null, 5, 15, 30, 60];
                  const currentIdx =
                    sleepTimerRemaining > 0
                      ? options.findIndex(
                          (o) => o !== null && o * 60 === sleepTimerRemaining,
                        )
                      : 0;
                  const nextIdx =
                    currentIdx === -1 ? 1 : (currentIdx + 1) % options.length;
                  onSleepTimerChange(options[nextIdx]);
                }}
                title={
                  sleepTimerRemaining > 0
                    ? `${t.bibleReader.setSleepTimer}: ${Math.floor(sleepTimerRemaining / 60)}m ${sleepTimerRemaining % 60}s`
                    : t.bibleReader.setSleepTimer
                }
                className={cn(
                  playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center active:scale-95 transition-all font-bold text-xs"),
                  sleepTimerRemaining > 0
                    ? "text-amber-500 bg-amber-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                {sleepTimerRemaining > 0 ? (
                  <span>{t.bibleReader.sleepMins.replace('{n}', String(Math.ceil(sleepTimerRemaining / 60)))}</span>
                ) : (
                  <span>💤</span>
                )}
              </button>

              {/* Voice Selector */}
              <Popover open={showVoicePicker} onOpenChange={(open) => { setShowVoicePicker(open); if (!open) setVoiceSearch(""); }}>
                <PopoverTrigger asChild>
                  <button
                    title={selectedVoice?.name || 'Voice'}
                    className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95 transition-all text-[9px] font-semibold truncate max-w-[50px]")}
                  >
                    {selectedVoice
                      ? selectedVoice.name.substring(0, 6)
                      : 'V'}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="center"
                  side="top"
                  className="w-64 p-1"
                >
                  <div className="p-1.5 border-b border-border/40 mb-1">
                    <Input
                      placeholder="Search voices…"
                      value={voiceSearch}
                      onChange={(e) => setVoiceSearch(e.target.value)}
                      className="h-7 text-xs"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                  {(() => {
                    const filtered = voices.filter((v) =>
                      v.name.toLowerCase().includes(voiceSearch.toLowerCase()) ||
                      (v.category || "").toLowerCase().includes(voiceSearch.toLowerCase())
                    );
                    return filtered.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2 text-center">No voices found</p>
                    ) : filtered.map((v) => (
                      <button
                        key={v.voiceId}
                        onClick={() => {
                          onVoiceChange(v);
                          setShowVoicePicker(false);
                          setVoiceSearch("");
                        }}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors",
                          selectedVoice?.name === v.name
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground/80 hover:bg-muted",
                        )}
                      >
                        <span className="block leading-tight">{v.name}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {v.category || 'Neural'} {v.source === 'edge' ? '(free)' : v.source === 'builtin' ? '(built-in)' : '(cloud)'}
                        </span>
                      </button>
                    ));
                  })()}
                  </div>
                </PopoverContent>
              </Popover>

              <button
                onClick={onSkipBack}
                disabled={!canSkipBack}
                title={t.bibleReader.previousVerse}
                className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all")}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onPauseResume}
                title={isPaused ? t.bibleReader.resumeAudio : t.bibleReader.pauseAudio}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 shadow-lg shadow-primary/20 transition-all mx-0.5"
              >
                {isPaused ? (
                  <Play className="w-4.5 h-4.5 ml-0.5" />
                ) : (
                  <Pause className="w-4.5 h-4.5" />
                )}
              </button>

              <button
                onClick={onSkipForward}
                disabled={!canSkipForward && afterPlay !== "continue"}
                title={t.bibleReader.nextVerse}
                className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-25 disabled:cursor-not-allowed active:scale-95 transition-all")}
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* Volume indicator */}
              <button
                onClick={onToggleMute}
                title={voice === 0 ? 'Unmute' : `Volume: ${Math.round(voice * 100)}%`}
                className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-95")}
              >
                {voice === 0 ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground/50" />
                ) : voice < 0.5 ? (
                  <Volume2 className="w-4 h-4 text-foreground/70" />
                ) : (
                  <Volume2 className="w-4 h-4 text-foreground" />
                )}
              </button>

              {/* Volume slider */}
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={voice}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1.5 rounded-full appearance-none cursor-pointer bg-muted/50 accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125"
                title={`${Math.round(voice * 100)}%`}
              />

              {/* Stop button */}
              <button
                onClick={onStop}
                title={t.bibleReader.stopAudio}
                className={playerBtnCn("w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all")}
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
