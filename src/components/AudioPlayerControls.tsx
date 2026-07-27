import { useState, useEffect } from "react";
import {
  Timer,
  ChevronDown,
  RotateCcw,
  Clock,
  Play,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import VoicePlayerBar from "@/components/VoicePlayerBar";
import type { TTSVoice } from "@/services/ttsService";

interface SpeechItem {
  verseKey: string;
  verseNum: number;
  text: string;
}

export interface AudioPlayerControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentItem: SpeechItem | null;
  currentIndex: number;
  total: number;
  progress: number;
  voiceMode: "chapter" | "selected" | null;
  displayBook: string;
  displayChapter: number;
  canSkipBack: boolean;
  canSkipForward: boolean;
  repeatMode: "none" | "one" | "all";
  speechRate: number;
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  volume: number;
  afterPlay: "continue" | "stop";
  onPauseResume: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleRepeat: () => void;
  onSpeechRateChange: (rate: number) => void;
  onToggleMute: () => void;
  onVoiceChange: (voice: TTSVoice) => void;
  onSetVolume: (vol: number) => void;
  onAfterPlayChange: (mode: "continue" | "stop") => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SLEEP_TIMER_OPTIONS = [
  { label: "Off", value: null },
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
] as const;

export default function AudioPlayerControls({
  isPlaying,
  isPaused,
  currentItem,
  currentIndex,
  total,
  progress,
  voiceMode,
  displayBook,
  displayChapter,
  canSkipBack,
  canSkipForward,
  repeatMode,
  speechRate,
  voices,
  selectedVoice,
  volume,
  afterPlay,
  onPauseResume,
  onStop,
  onSkipBack,
  onSkipForward,
  onToggleRepeat,
  onSpeechRateChange,
  onToggleMute,
  onVoiceChange,
  onSetVolume,
  onAfterPlayChange,
}: AudioPlayerControlsProps) {
  const { t } = useLanguage();
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [showOverflow, setShowOverflow] = useState(false);

  // Sleep timer countdown effect
  useEffect(() => {
    if (sleepTimer && sleepTimer > 0) {
      const interval = setInterval(() => {
        setSleepTimerRemaining((prev) => {
          if (prev <= 1) {
            // Timer expired - stop speaking
            onStop();
            setSleepTimer(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sleepTimer, onStop]);

  // Reset sleep timer when playback stops
  useEffect(() => {
    if (!isPlaying) {
      setSleepTimer(null);
      setSleepTimerRemaining(0);
    }
  }, [isPlaying]);

  if (!isPlaying) return null;

  return (
    <VoicePlayerBar
      currentItem={currentItem}
      currentIndex={currentIndex}
      total={total}
      progress={progress}
      isPaused={isPaused}
      voiceMode={voiceMode}
      displayBook={displayBook}
      displayChapter={displayChapter}
      canSkipBack={canSkipBack}
      canSkipForward={canSkipForward}
      repeatMode={repeatMode}
      speechRate={speechRate}
      voices={voices}
      selectedVoice={selectedVoice}
      voice={volume}
      onPauseResume={onPauseResume}
      onStop={onStop}
      onSkipBack={onSkipBack}
      onSkipForward={onSkipForward}
      onToggleRepeat={onToggleRepeat}
      onSpeechRateChange={onSpeechRateChange}
      onToggleMute={onToggleMute}
      onVoiceChange={onVoiceChange}
      extraControls={
        <Popover open={showOverflow} onOpenChange={setShowOverflow}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90",
                "text-muted-foreground/70 hover:text-foreground hover:bg-muted/60",
                showOverflow && "bg-muted/60 text-foreground",
              )}
              title="More controls"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" side="top" className="w-56 p-2 space-y-2">
            {/* Sleep Timer */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1.5">
                <Timer className="w-3 h-3" />
                Sleep Timer
              </p>
              <div className="grid grid-cols-3 gap-1">
                {SLEEP_TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      if (opt.value === null) {
                        setSleepTimer(null);
                        setSleepTimerRemaining(0);
                      } else {
                        setSleepTimer(opt.value * 60);
                        setSleepTimerRemaining(opt.value * 60);
                      }
                      setShowOverflow(false);
                    }}
                    className={cn(
                      "text-xs py-1.5 px-1 rounded-md transition-colors text-center",
                      (sleepTimer === null && opt.value === null) ||
                      (sleepTimer !== null && sleepTimer === opt.value! * 60)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {sleepTimer !== null && (
                <div className="flex items-center gap-1.5 mt-1.5 px-1">
                  <Clock className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-xs text-primary font-medium tabular-nums">
                    {formatTime(sleepTimerRemaining)}
                  </span>
                  <button
                    onClick={() => {
                      setSleepTimer(null);
                      setSleepTimerRemaining(0);
                    }}
                    className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="h-px bg-border/60" />

            {/* After Play */}
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />
                After Play
              </p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => {
                    onAfterPlayChange("stop");
                    setShowOverflow(false);
                  }}
                  className={cn(
                    "text-xs py-1.5 px-2 rounded-md transition-colors text-center",
                    afterPlay === "stop"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <Play className="w-3 h-3 mx-auto mb-0.5" />
                  Stop
                </button>
                <button
                  onClick={() => {
                    onAfterPlayChange("continue");
                    setShowOverflow(false);
                  }}
                  className={cn(
                    "text-xs py-1.5 px-2 rounded-md transition-colors text-center",
                    afterPlay === "continue"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <RotateCcw className="w-3 h-3 mx-auto mb-0.5" />
                  Continue
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      }
    />
  );
}
