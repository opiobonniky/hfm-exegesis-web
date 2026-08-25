// Audio control bar — bottom bar when TTS is playing
import { useState } from "react";
import {
  SkipBack, SkipForward, Play, Pause, Square,
  Repeat, Repeat1, Music, Mic, Gauge, ChevronDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AudioPlayerState, AudioPlayerActions } from "@/hooks/useAudioPlayer";
import type { TTSVoice } from "@/services/ttsService";
import { useLanguage } from "@/components/languages/languageProvider";

interface AudioControlBarProps {
  audio: AudioPlayerState & AudioPlayerActions;
  bookName: string;
  chapter: number;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export default function AudioControlBar({ audio, bookName, chapter }: AudioControlBarProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const progressPct = audio.totalVerses > 0 ? (audio.currentVerseIdx / audio.totalVerses) * 100 : 0;

  return (
    <div className="shrink-0 z-40 relative">
      {/* Expanded tray */}
      {expanded && (
        <div className="absolute bottom-full left-0 right-0 z-50 bg-card/98 backdrop-blur-md border-t border-border shadow-lg max-h-[40vh] overflow-y-auto">
          <div className="px-4 pb-4 space-y-3 pt-3">
            {/* Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Speed</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {SPEED_OPTIONS.map((rate) => (
                  <button key={rate} onClick={() => audio.setSpeechRate(rate)}
                    type="button" aria-label={`Set reading speed to ${rate} times`} aria-pressed={audio.speechRate === rate}
                    className={cn("px-2 py-1 rounded-md text-[10px] font-bold transition-all",
                      audio.speechRate === rate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    {rate}×
                  </button>
                ))}
              </div>
            </div>
            {/* Voice */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Voice</span>
              </div>
              <Popover open={voiceOpen} onOpenChange={setVoiceOpen}>
                <PopoverTrigger asChild>
                  <button type="button" aria-label="Select voice" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-foreground hover:bg-muted/80 transition-all">
                    <span className="truncate max-w-[100px]">{audio.selectedVoice?.name || "Default"}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] max-h-[250px] p-0" align="end">
                  <div className="max-h-[230px] overflow-y-auto">
                    {audio.voices.map((v: TTSVoice) => (
                      <button type="button" key={v.voiceId} onClick={() => { audio.setVoice(v); setVoiceOpen(false); }}
                        aria-pressed={audio.selectedVoice?.voiceId === v.voiceId}
                        className={cn("w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors",
                          audio.selectedVoice?.voiceId === v.voiceId && "bg-primary/5 text-primary font-semibold")}>
                        {v.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Repeat */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Repeat</span>
              </div>
              <button type="button" onClick={audio.cycleRepeatMode} aria-label={`Repeat mode: ${audio.repeatMode}`}
                className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
                  audio.repeatMode !== "none" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                {audio.repeatMode === "one" ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                {audio.repeatMode === "none" ? "Off" : audio.repeatMode === "one" ? "One" : "All"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Main bar */}
      <div className="border-t border-border bg-card/95 backdrop-blur-md">
        {/* Progress bar */}
        <div className="h-1 bg-muted/30">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
        {/* Mode badge + verse counter + expand */}
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5">
            <Music className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Chapter</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono ml-auto">
            {audio.currentVerseIdx + 1} / {audio.totalVerses}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Hide audio settings" : "Show audio settings"}
            aria-expanded={expanded}
            className={cn("w-7 h-7 rounded-lg flex items-center justify-center transition-all", expanded ? "bg-primary/10" : "hover:bg-muted")}>
            <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
        {/* Now playing */}
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground truncate">{bookName} {chapter}:{audio.currentVerseIdx + 1}</p>
        </div>
        {/* Primary controls */}
        <div className="flex items-center justify-center gap-3 px-4 pb-3">
          <button type="button" onClick={audio.skipBackward} disabled={audio.currentVerseIdx === 0} aria-label={t.bibleReader.previousVerse}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-all disabled:opacity-30">
            <SkipBack className="w-4 h-4" />
          </button>
          <button type="button" onClick={audio.togglePause} aria-label={audio.isPaused ? t.bibleReader.resumeAudio : t.bibleReader.pauseAudio}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20">
            {audio.isPaused
              ? <Play className="w-6 h-6 text-primary-foreground ml-0.5" fill="currentColor" />
              : <Pause className="w-6 h-6 text-primary-foreground" fill="currentColor" />}
          </button>
          <button type="button" onClick={audio.skipForward} disabled={audio.currentVerseIdx >= audio.totalVerses - 1} aria-label={t.bibleReader.nextVerse}
            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-all disabled:opacity-30">
            <SkipForward className="w-4 h-4" />
          </button>
          <button type="button" onClick={audio.stopPlayback} aria-label={t.bibleReader.stopAudio}
            className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-all">
            <Square className="w-3.5 h-3.5 text-destructive" fill="currentColor" />
          </button>
        </div>
      </div>
      {/* Safe area padding for mobile */}
      <div className="h-[env(safe-area-inset-bottom)] bg-card/95" />
    </div>
  );
}
