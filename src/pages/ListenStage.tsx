import { useState, useEffect, useCallback, useRef } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Ear,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { bibleApi } from "@/services/bibleApi";

interface ListenOption {
  label: string;
  value: number;
}

interface ListenStageProps {
  selectedRepeats: number;
  repeatCount: number;
  listenComplete: boolean;
  passageRef: string | null;
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  passageVerses?: { text: string }[];
  onUpdate: (updates: Record<string, any>) => void;
  onStartListening: () => void;
  onResetListening: () => void;
  onAdvance: () => void;
  onIncrementRepeat?: () => void;
  stageLabel: string;
  listenOptions: ListenOption[];
}

export default function ListenStage({
  selectedRepeats,
  repeatCount,
  listenComplete,
  passageRef,
  bookName,
  chapter,
  verseStart,
  verseEnd,
  passageVerses,
  onUpdate,
  onStartListening,
  onResetListening,
  onAdvance,
  onIncrementRepeat,
  stageLabel,
  listenOptions,
}: ListenStageProps) {
  const audio = useAudioPlayer();
  const [audioVerses, setAudioVerses] = useState<{ text: string }[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [playing, setPlaying] = useState(false);

  // Refs to avoid stale closures in effects
  const playingRef = useRef(false);
  playingRef.current = playing;
  const repeatCountRef = useRef(0);
  repeatCountRef.current = repeatCount;
  const selectedRepeatsRef = useRef(3);
  selectedRepeatsRef.current = selectedRepeats;

  // Enable speed toggle text
  const speedText = `${audio.speechRate.toFixed(2)}x`.replace(/\.?0+([^0])?$/, "$1");

  // ── Fetch verse text for audio playback ──
  const fetchAndPlayPassage = useCallback(async () => {
    if (!bookName || !chapter) return;
    setAudioLoading(true);
    setAudioError(false);

    try {
      if (passageVerses && passageVerses.length > 0) {
        setAudioVerses(passageVerses);
        audio.startPlayback(passageVerses);
        setAudioLoading(false);
        return;
      }

      const ch = parseInt(chapter, 10);
      const startV = parseInt(verseStart || "1", 10);
      const endV = verseEnd ? parseInt(verseEnd, 10) : startV;

      const verseData = await bibleApi.getVerses("Berean", bookName, ch);
      const filtered = verseData.verses
        .filter((v) => v.verseNumber >= startV && v.verseNumber <= endV)
        .map((v) => ({ text: v.text }));

      if (filtered.length === 0) {
        setAudioError(true);
        setAudioLoading(false);
        return;
      }

      setAudioVerses(filtered);
      audio.startPlayback(filtered);
      setAudioLoading(false);
    } catch {
      setAudioError(true);
      setAudioLoading(false);
    }
  }, [bookName, chapter, verseStart, verseEnd, passageVerses, audio]);

  // ── Start play ──
  const handleStart = () => {
    onStartListening();
    setPlaying(true);
    fetchAndPlayPassage();
  };

  // ── Pause / Resume ──
  const handleToggle = () => {
    if (audio.isPlaying) {
      audio.pausePlayback();
    } else {
      audio.resumePlayback();
    }
  };

  // ── Reset ──
  const handleReset = () => {
    audio.stopPlayback();
    setAudioVerses([]);
    setAudioError(false);
    setAudioLoading(false);
    setPlaying(false);
    onResetListening();
  };

  // ── When passage finishes, loop or complete ──
  useEffect(() => {
    if (audio.passageComplete && audioVerses.length > 0 && playingRef.current) {
      const nextCount = repeatCountRef.current + 1;
      if (nextCount >= selectedRepeatsRef.current) {
        audio.stopPlayback();
        setPlaying(false);
      } else {
        audio.startPlayback(audioVerses);
      }
      onIncrementRepeat?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio.passageComplete]);

  // ── Stop audio when listen completes ──
  useEffect(() => {
    if (listenComplete && audio.isPlaying) {
      audio.stopPlayback();
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listenComplete]);

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Stage header */}
      <div className="flex flex-col items-center pb-2">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center mb-2">
          <Ear className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] font-black text-primary uppercase tracking-wider mb-0.5">
          Step 2 of 4
        </p>
        <h2 className="text-lg font-black text-foreground">Listen</h2>
        <p className="text-xs text-muted-foreground">{stageLabel}</p>
        {passageRef && (
          <Badge
            variant="outline"
            className="mt-2 text-[11px] font-bold bg-primary/10 border-primary/20 text-primary gap-1"
          >
            <BookOpen className="w-3 h-3" />
            {passageRef}
          </Badge>
        )}
      </div>

      {!listenComplete ? (
        <>
          {/* Repeat selection — shown before playing starts */}
          {!playing && !audioLoading && (
            <>
              {repeatCount > 0 ? (
                <div className="rounded-xl bg-card border border-border p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    You completed {repeatCount} of {selectedRepeats} readings
                  </p>
                  <Button onClick={handleStart} className="gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    Resume Reading
                  </Button>
                </div>
              ) : (
                <p className="text-xs font-bold text-muted-foreground mb-1">
                  How many times would you like to hear the passage?
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {listenOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onUpdate({ selectedRepeats: opt.value })}
                    className={cn(
                      "px-4 min-h-[44px] py-2 rounded-full text-xs font-bold border-2 transition-all active:scale-[0.97] [touch-action:manipulation]",
                      selectedRepeats === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:border-muted-foreground/30",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {repeatCount === 0 && (
                <Button onClick={handleStart} className="gap-2 mt-2">
                  <Play className="w-4 h-4 fill-current" />
                  Begin {listenOptions.find((o) => o.value === selectedRepeats)?.label || `${selectedRepeats}x`} Reading
                </Button>
              )}
            </>
          )}

          {/* Audio play view */}
          {playing && (
            <div className="flex flex-col items-center py-4">
              <p className="text-xs text-muted-foreground italic mb-4">
                {audio.isPlaying
                  ? "Listening to the Word..."
                  : "Paused"}
              </p>

              {/* Verse progress */}
              {audio.isPlaying && audio.totalVerses > 0 && (
                <div className="w-full max-w-xs mb-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                    <span>
                      Verse {Math.min(audio.currentVerseIdx + 1, audio.totalVerses)} of{" "}
                      {audio.totalVerses}
                    </span>
                    <span className="tabular-nums font-mono">{speedText}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-300"
                      style={{
                        width: `${
                          audio.totalVerses > 0
                            ? ((audio.currentVerseIdx + 1) / audio.totalVerses) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Repeat progress */}
              <div className="flex items-center gap-2 mb-4">
                {Array.from({ length: selectedRepeats }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-colors",
                      i < repeatCount
                        ? "bg-primary border-primary"
                        : i === repeatCount && audio.isPlaying
                          ? "border-primary bg-primary/30 animate-pulse"
                          : "border-muted-foreground/30 bg-transparent",
                    )}
                  />
                ))}
                <span className="text-xs font-bold text-muted-foreground ml-1">
                  {repeatCount}/{selectedRepeats}
                </span>
              </div>

              {/* Loading / error */}
              {audioLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Loading audio...
                </div>
              )}
              {audioError && !audio.isPlaying && (
                <p className="text-xs text-destructive mb-3">
                  Could not load audio for this passage.
                </p>
              )}

              {/* Speed + voice controls */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={audio.cycleSpeed}
                  className="relative h-8 px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors [touch-action:manipulation]"
                  title="Playback speed"
                >
                  {speedText}
                </button>

                {audio.voices.length > 0 && (
                  <div className="flex items-center gap-1 max-w-[180px] overflow-x-auto scrollbar-none">
                    {audio.voices.slice(0, 3).map((v) => (
                      <button
                        key={v.voiceId}
                        onClick={() => audio.setVoice(v)}
                        className={cn(
                          "shrink-0 text-[10px] font-bold min-h-[44px] px-2 py-1 rounded-full border transition-colors active:scale-[0.97] [touch-action:manipulation]",
                          audio.selectedVoice?.voiceId === v.voiceId
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-muted-foreground border-border hover:border-primary/30",
                        )}
                      >
                        {v.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Skip controls */}
              {audio.isPlaying && audio.totalVerses > 1 && (
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={audio.skipBackward}
                    disabled={audio.currentVerseIdx === 0}
                    className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed [touch-action:manipulation]"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      audio.stopPlayback();
                      fetchAndPlayPassage();
                    }}
                    className="relative h-8 px-3 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 [touch-action:manipulation]"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restart
                  </button>
                  <button
                    onClick={audio.skipForward}
                    disabled={audio.currentVerseIdx >= audio.totalVerses - 1}
                    className="relative w-8 h-8 before:absolute before:content-[''] before:-inset-2 before:rounded-full rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed [touch-action:manipulation]"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Main controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleToggle}
                  className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
                >
                  {audio.isPlaying ? (
                    <Pause className="w-6 h-6 text-primary" />
                  ) : (
                    <Play className="w-6 h-6 text-primary fill-current" />
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="min-h-[44px] h-10 px-4 rounded-full border-2 border-border bg-card flex items-center justify-center hover:bg-muted active:scale-[0.97] transition-all [touch-action:manipulation]"
                >
                  <RotateCcw className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive ml-1.5">Reset</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Complete — Amen state */
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 rounded-full bg-primary/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-1">Amen</h2>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
            You have dwelled in the Word.
            <br />
            <span className="text-xs">
              The passage was read {repeatCount} time{repeatCount !== 1 ? "s" : ""}.
            </span>
          </p>
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Button
              variant="outline"
              onClick={handleStart}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Listen Again
            </Button>
            <Button onClick={onAdvance} className="gap-2">
              <Brain className="w-4 h-4" />
              Continue to Learn
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
