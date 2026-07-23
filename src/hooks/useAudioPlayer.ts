import { useState, useRef, useCallback, useEffect } from "react";
import { ttsService, type TTSVoice } from "@/services/ttsService";

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  speechRate: number;
  voices: TTSVoice[];
  selectedVoice: TTSVoice | null;
  currentVerseIdx: number;
  totalVerses: number;
  /** Passage finished playing (all verses read) */
  passageComplete: boolean;
}

export interface AudioPlayerActions {
  startPlayback: (verses: { text: string }[], startIdx?: number) => void;
  stopPlayback: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePause: () => void;
  setSpeechRate: (rate: number) => void;
  cycleSpeed: () => void;
  setVoice: (voice: TTSVoice) => void;
  skipForward: () => void;
  skipBackward: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const STORAGE_KEYS = {
  speechRate: "exegesis-speech-rate",
  selectedVoiceId: "exegesis-selected-voice-id",
} as const;

function loadSpeechRate(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.speechRate);
    if (saved !== null) {
      const rate = parseFloat(saved);
      if (SPEED_OPTIONS.includes(rate)) return rate;
    }
  } catch {}
  return 1.0;
}

function loadVoiceId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.selectedVoiceId);
  } catch {
    return null;
  }
}

function saveSpeechRate(rate: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.speechRate, String(rate));
  } catch {}
}

function saveVoiceId(voiceId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selectedVoiceId, voiceId);
  } catch {}
}

export function useAudioPlayer(): AudioPlayerState & AudioPlayerActions {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(loadSpeechRate);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice | null>(null);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [totalVerses, setTotalVerses] = useState(0);
  const [passageComplete, setPassageComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isReadingRef = useRef(false);
  const isPausedRef = useRef(false);
  const versesRef = useRef<{ text: string }[]>([]);
  const currentIdxRef = useRef(0);
  const speechRateRef = useRef(1.0);
  const skipRef = useRef<(() => void) | null>(null);

  // Sync refs and persist speech rate
  useEffect(() => {
    speechRateRef.current = speechRate;
    saveSpeechRate(speechRate);
  }, [speechRate]);

  // Load voices on mount
  useEffect(() => {
    ttsService.getVoices().then((available) => {
      setVoices(available);
      const savedVoiceId = loadVoiceId();
      if (savedVoiceId) {
        const saved = available.find((v) => v.voiceId === savedVoiceId);
        if (saved) {
          setSelectedVoice(saved);
          return;
        }
      }
      const preferred = available.find((v) => /aria|jenny|guy|davis|emma/i.test(v.name));
      setSelectedVoice(preferred || available[0] || null);
    }).catch(() => {});
  }, []);

  const playVerse = useCallback(async (text: string, idx: number): Promise<void> => {
    return new Promise((resolve) => {
      const doSpeak = async () => {
        try {
          const arrayBuffer = await ttsService.speak(
            text,
            selectedVoice?.voiceId || "en-US-AriaNeural",
            speechRateRef.current,
          );
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.playbackRate = speechRateRef.current;

          skipRef.current = () => {
            audio.pause();
            audio.src = "";
            URL.revokeObjectURL(url);
            audioRef.current = null;
            resolve();
          };

          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            skipRef.current = null;
            resolve();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            skipRef.current = null;
            resolve();
          };

          await audio.play();
          if (isPausedRef.current) audio.pause();
        } catch {
          audioRef.current = null;
          skipRef.current = null;
          resolve();
        }
      };
      doSpeak();
    });
  }, [selectedVoice]);

  const runPlayback = useCallback(async () => {
    while (isReadingRef.current) {
      const idx = currentIdxRef.current;
      if (idx >= versesRef.current.length) {
        setPassageComplete(true);
        break;
      }
      setCurrentVerseIdx(idx);
      await playVerse(versesRef.current[idx].text, idx);

      if (currentIdxRef.current === idx) {
        currentIdxRef.current = idx + 1;
      }
    }

    if (isReadingRef.current) {
      isReadingRef.current = false;
      isPausedRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
    }
  }, [playVerse]);

  const startPlayback = useCallback((verses: { text: string }[], startIdx = 0) => {
    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    skipRef.current?.();

    versesRef.current = verses;
    currentIdxRef.current = startIdx;
    isReadingRef.current = true;
    isPausedRef.current = false;
    setTotalVerses(verses.length);
    setCurrentVerseIdx(startIdx);
    setIsPlaying(true);
    setIsPaused(false);
    setPassageComplete(false);
    runPlayback();
  }, [runPlayback]);

  const stopPlayback = useCallback(() => {
    isReadingRef.current = false;
    isPausedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    skipRef.current?.();
    skipRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerseIdx(0);
    setTotalVerses(0);
    setPassageComplete(false);
  }, []);

  const pausePlayback = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    audioRef.current?.pause();
  }, []);

  const resumePlayback = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    audioRef.current?.play().catch(() => {});
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) {
      resumePlayback();
    } else {
      pausePlayback();
    }
  }, [isPaused, pausePlayback, resumePlayback]);

  const cycleSpeed = useCallback(() => {
    setSpeechRate((prev) => {
      const idx = SPEED_OPTIONS.indexOf(prev);
      const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
      speechRateRef.current = next;
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }, []);

  const setVoice = useCallback((voice: TTSVoice) => {
    setSelectedVoice(voice);
    saveVoiceId(voice.voiceId);
  }, []);

  const skipForward = useCallback(() => {
    if (isPaused) resumePlayback();
    const next = currentIdxRef.current + 1;
    if (next >= versesRef.current.length) {
      stopPlayback();
      return;
    }
    currentIdxRef.current = next;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    skipRef.current?.();
    skipRef.current = null;
  }, [isPaused, resumePlayback, stopPlayback]);

  const skipBackward = useCallback(() => {
    if (isPaused) resumePlayback();
    const prev = Math.max(0, currentIdxRef.current - 1);
    currentIdxRef.current = prev;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    skipRef.current?.();
    skipRef.current = null;
  }, [isPaused, resumePlayback]);

  return {
    isPlaying,
    isPaused,
    speechRate,
    voices,
    selectedVoice,
    currentVerseIdx,
    totalVerses,
    passageComplete,
    startPlayback,
    stopPlayback,
    pausePlayback,
    resumePlayback,
    togglePause,
    setSpeechRate,
    cycleSpeed,
    setVoice,
    skipForward,
    skipBackward,
  };
}
