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
  X,
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
  speechRate: number;
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  voice: number;
  onPauseResume: () => void;
  onStop: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleRepeat: () => void;
  onSpeechRateChange: (rate: number) => void;
  onToggleMute: () => void;
  onVoiceChange: (voice: TTSVoice) => void;
}

function ControlBtn({
  onClick,
  disabled,
  title,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90",
        "text-muted-foreground/70 hover:text-foreground hover:bg-muted/60",
        "disabled:opacity-20 disabled:cursor-not-allowed",
        className,
      )}
    >
      {children}
    </button>
  );
}

const repeatLabel: Record<string, string> = {
  none: "Off",
  one: "1",
  all: "A",
};

const repeatIcon: Record<string, React.ReactNode> = {
  none: <Repeat className="w-4 h-4" />,
  one: <Repeat1 className="w-4 h-4" />,
  all: <Repeat className="w-4 h-4" />,
};

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
  speechRate,
  voices,
  selectedVoice,
  voice,
  onPauseResume,
  onStop,
  onSkipBack,
  onSkipForward,
  onToggleRepeat,
  onSpeechRateChange,
  onToggleMute,
  onVoiceChange,
}: VoicePlayerBarProps) {
  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [voiceSearch, setVoiceSearch] = useState("");
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none">
      <div
        className="max-w-2xl mx-auto rounded-2xl border border-border/60 shadow-2xl overflow-hidden pointer-events-auto"
        style={{
          background: "hsl(var(--background) / 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="h-[3px] w-full bg-muted/40">
          <div
            className="h-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-2 px-4 py-3">
          {/* Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                isPaused ? "bg-muted" : "bg-primary/10",
              )}
            >
              {isPaused ? (
                <Pause className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Volume2 className="w-4 h-4 text-primary" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none mb-0.5 truncate">
                {voiceMode === "chapter"
                  ? `${displayBook} · ${t.bibleReader.chShort} ${displayChapter}`
                  : t.bibleReader.selectedVerses}
              </p>
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {currentItem
                  ? t.bibleReader.verseNum.replace(
                      "{n}",
                      String(currentItem.verseNum),
                    )
                  : "—"}
              </p>
            </div>

            <span className="tabular-nums text-xs text-muted-foreground shrink-0 ml-auto">
              <span className="font-medium text-foreground">
                {currentIndex + 1}
              </span>
              <span className="opacity-40 mx-0.5">/</span>
              {total}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            {/* Repeat */}
            <ControlBtn
              onClick={onToggleRepeat}
              title={`Repeat: ${repeatLabel[repeatMode]}`}
              className={
                repeatMode !== "none"
                  ? "text-primary bg-primary/10 hover:text-primary hover:bg-primary/15"
                  : undefined
              }
            >
              {repeatIcon[repeatMode]}
            </ControlBtn>

            {/* Speed */}
            <ControlBtn
              onClick={() => {
                const speeds = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
                const idx = speeds.indexOf(speechRate);
                const next = (idx + 1) % speeds.length;
                onSpeechRateChange(speeds[next]);
              }}
              title={`${speechRate}x`}
              className="font-bold text-xs min-w-[36px]"
            >
              {speechRate}x
            </ControlBtn>

            {/* Voice */}
            <Popover
              open={showVoicePicker}
              onOpenChange={(open) => {
                setShowVoicePicker(open);
                if (!open) setVoiceSearch("");
              }}
            >
              <PopoverTrigger asChild>
                <ControlBtn title={selectedVoice?.name || "Voice"}>
                  <Volume2 className="w-4 h-4" />
                </ControlBtn>
              </PopoverTrigger>
              <PopoverContent align="center" side="top" className="w-64 p-1">
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
                    const filtered = voices.filter(
                      (v) =>
                        v.name
                          .toLowerCase()
                          .includes(voiceSearch.toLowerCase()) ||
                        (v.category || "")
                          .toLowerCase()
                          .includes(voiceSearch.toLowerCase()),
                    );
                    return filtered.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-2 text-center">
                        No voices found
                      </p>
                    ) : (
                      filtered.map((v) => (
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
                            {v.category || "Neural"}{" "}
                            {v.source === "edge"
                              ? "(free)"
                              : v.source === "builtin"
                                ? "(built-in)"
                                : "(cloud)"}
                          </span>
                        </button>
                      ))
                    );
                  })()}
                </div>
              </PopoverContent>
            </Popover>

            {/* Skip Back */}
            <ControlBtn
              onClick={onSkipBack}
              disabled={!canSkipBack}
              title={t.bibleReader.previousVerse}
            >
              <SkipBack className="w-4 h-4" />
            </ControlBtn>

            {/* Play/Pause */}
            <button
              onClick={onPauseResume}
              title={
                isPaused
                  ? t.bibleReader.resumeAudio
                  : t.bibleReader.pauseAudio
              }
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-90 shadow-lg shadow-primary/20 transition-all mx-1"
            >
              {isPaused ? (
                <Play className="w-4.5 h-4.5 ml-0.5" />
              ) : (
                <Pause className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Skip Forward */}
            <ControlBtn
              onClick={onSkipForward}
              disabled={!canSkipForward}
              title={t.bibleReader.nextVerse}
            >
              <SkipForward className="w-4 h-4" />
            </ControlBtn>

            {/* Mute */}
            <ControlBtn
              onClick={onToggleMute}
              title={voice === 0 ? "Unmute" : "Mute"}
            >
              {voice === 0 ? (
                <VolumeX className="w-4 h-4 text-muted-foreground/40" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </ControlBtn>

            {/* Stop */}
            <ControlBtn
              onClick={onStop}
              title={t.bibleReader.stopAudio}
              className="text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </ControlBtn>
          </div>
        </div>
      </div>
    </div>
  );
}
