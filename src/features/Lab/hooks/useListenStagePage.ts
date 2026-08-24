import { useState, useEffect, useCallback, useRef } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { bibleApi } from "@/services/bibleApi";

interface ListenStageProps {
  selectedRepeats: number; repeatCount: number; listenComplete: boolean;
  passageRef: string; bookName: string; chapter: number; verseStart: number; verseEnd: number;
  passageVerses: { text: string }[]; onUpdate: (data: any) => void;
  onStartListening: () => void; onResetListening: () => void;
  onAdvance: () => void; onIncrementRepeat: () => void;
  stageLabel: string; listenOptions: { value: number; label: string }[];
}
export function useListenStagePage(props: ListenStageProps) {
  const { bookName, chapter, verseStart, verseEnd, passageVerses, listenComplete,
    onStartListening, onResetListening, onIncrementRepeat } = props;
  const audio = useAudioPlayer();
  const [audioVerses, setAudioVerses] = useState<{ text: string }[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const playingRef = useRef(false);
  playingRef.current = playing;
  const repeatCountRef = useRef(0);
  repeatCountRef.current = props.repeatCount;
  const selectedRepeatsRef = useRef(3);
  selectedRepeatsRef.current = props.selectedRepeats;
  const speedText = `${audio.speechRate.toFixed(2)}x`.replace(/\.?0+([^1-9])?$/, "$1");
  const fetchAndPlayPassage = useCallback(async () => {
    if (!bookName || !chapter) return;
    setAudioLoading(true); setAudioError(false);
    try {
      if (passageVerses && passageVerses.length > 0) { setAudioVerses(passageVerses); audio.startPlayback(passageVerses); setAudioLoading(false); return; }
      const ch = parseInt(chapter, 10);
      const startV = parseInt(String(verseStart || "1"), 10);
      const endV = verseEnd ? parseInt(String(verseEnd), 10) : startV;
      const verseData = await bibleApi.getVerses("Berean", bookName, ch);
      const filtered = verseData.verses.filter((v) => v.verseNumber >= startV && v.verseNumber <= endV).map((v) => ({ text: v.text }));
      if (filtered.length === 0) { setAudioError(true); setAudioLoading(false); return; }
      setAudioVerses(filtered); audio.startPlayback(filtered); setAudioLoading(false);
    } catch { setAudioError(true); setAudioLoading(false); }
  }, [bookName, chapter, verseStart, verseEnd, passageVerses, audio]);
  const handleStart = useCallback(() => { onStartListening(); setPlaying(true); fetchAndPlayPassage(); }, [onStartListening, fetchAndPlayPassage]);
  const handleToggle = useCallback(() => {
    if (audio.isPaused) audio.resumePlayback();
    else if (audio.isPlaying) audio.pausePlayback();
  }, [audio]);
  const handleReset = useCallback(() => {
    audio.stopPlayback(); setAudioVerses([]); setAudioError(false); setAudioLoading(false); setPlaying(false); setDone(false); onResetListening();
  }, [audio, onResetListening]);
  useEffect(() => {
    if (audio.passageComplete && audioVerses.length > 0 && playingRef.current) {
      const nextCount = repeatCountRef.current + 1;
      if (nextCount >= selectedRepeatsRef.current) { audio.stopPlayback(); setPlaying(false); setDone(true); }
      else { audio.startPlayback(audioVerses); }
      onIncrementRepeat?.();
    }
  }, [audio.passageComplete]);
    if (listenComplete && audio.isPlaying) { audio.stopPlayback(); setPlaying(false); }
  }, [listenComplete]);
  return {
    audioVerses, audioLoading, audioError, playing, done, showSettings, setShowSettings,
    audio, speedText, handleStart, handleToggle, handleReset,
  };
