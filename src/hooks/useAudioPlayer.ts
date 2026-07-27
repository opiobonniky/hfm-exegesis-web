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
  passageComplete: boolean;
  volume: number;
  ttsEnabled: boolean;
  repeatMode: "none" | "one" | "all";
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
  setVolume: (vol: number) => void;
  setRepeatMode: (mode: "none" | "one" | "all") => void;
  cycleRepeatMode: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const STORAGE_KEYS = {
  speechRate: "exegesis-speech-rate",
  selectedVoiceId: "exegesis-selected-voice-id",
  volume: "exegesis-volume",
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

function loadVolume(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.volume);
    if (saved !== null) {
      const vol = parseFloat(saved);
      if (vol >= 0 && vol <= 1) return vol;
    }
  } catch {}
  return 1;
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

function saveVolume(vol: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.volume, String(vol));
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
  const [volume, setVolume] = useState(loadVolume);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"none" | "one" | "all">("none");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isReadingRef = useRef(false);
  const isPausedRef = useRef(false);
  const versesRef = useRef<{ text: string }[]>([]);
  const currentIdxRef = useRef(0);
  const speechRateRef = useRef(1.0);
  const volumeRef = useRef(1.0);
  const skipRef = useRef<(() => void) | null>(null);
  const repeatModeRef = useRef<"none" | "one" | "all">("none");

  // Sync refs and persist
  useEffect(() => { speechRateRef.current = speechRate; saveSpeechRate(speechRate); }, [speechRate]);
  useEffect(() => { volumeRef.current = volume; saveVolume(volume); }, [volume]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  // Check whether TTS API is enabled
  useEffect(() => {
    ttsService.isEnabled().then(setTtsEnabled).catch(() => setTtsEnabled(false));
  }, []);

  // Load voices on mount
  useEffect(() => {
    ttsService.getVoices().then((available) => {
      setVoices(available);
      const savedVoiceId = loadVoiceId();
      if (savedVoiceId) {
        const saved = available.find((v) => v.voiceId === savedVoiceId);
        if (saved) { setSelectedVoice(saved); return; }
      }
      const preferred = available.find((v) => /aria|jenny|guy|davis|emma/i.test(v.name));
      setSelectedVoice(preferred || available[0] || null);
    }).catch(() => {});
  }, []);

  // ── Playback engines ──

  const cancelAllAudio = useCallback(() => {
    isReadingRef.current = false;
    isPausedRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (utteranceRef.current) {
      if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
    skipRef.current = null;
  }, []);

  // TTS API path (backed by Edge TTS / ElevenLabs)
  const playTTS = useCallback(async (text: string): Promise<void> => {
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
          audio.volume = volumeRef.current;

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
          // Fallback to Web Speech
          resolve(await playWebSpeech(text));
        }
      };
      doSpeak();
    });
  }, [selectedVoice]);

  // Web Speech API fallback
  const playWebSpeech = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) { resolve(); return; }

      const u = new SpeechSynthesisUtterance(text);
      u.rate = speechRateRef.current;
      u.volume = volumeRef.current;
      u.pitch = 1.0;

      // Match selected voice to browser voices
      if (selectedVoice?.voiceId && window.speechSynthesis.getVoices().length > 0) {
        const voices = window.speechSynthesis.getVoices();
        const svn = selectedVoice.name.toLowerCase();
        const match = voices.find((v) => {
          const vn = v.name.toLowerCase();
          const shortName = svn.split("(")[0].trim();
          return vn.includes(shortName) || shortName.includes(vn);
        });
        if (match) u.voice = match;
      }
      utteranceRef.current = u;

      skipRef.current = () => { utteranceRef.current = null; resolve(); };

      u.onend = () => { utteranceRef.current = null; skipRef.current = null; resolve(); };
      u.onerror = (e) => {
        if (e.error === "interrupted") return;
        utteranceRef.current = null;
        skipRef.current = null;
        resolve();
      };

      window.speechSynthesis.speak(u);
    });
  }, [selectedVoice]);

  const playVerse = useCallback(async (text: string): Promise<void> => {
    if (ttsEnabled) {
      await playTTS(text);
    } else {
      await playWebSpeech(text);
    }
  }, [ttsEnabled, playTTS, playWebSpeech]);

  // ── Playback loop ──

  const runPlayback = useCallback(async () => {
    while (isReadingRef.current) {
      const idx = currentIdxRef.current;

      if (idx >= versesRef.current.length) {
        setPassageComplete(true);
        break;
      }

      setCurrentVerseIdx(idx);
      await playVerse(versesRef.current[idx].text);

      // Advance to next verse (unless repeat-one mode)
      if (currentIdxRef.current === idx && repeatModeRef.current !== "one") {
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

  // ── Public actions ──

  const startPlayback = useCallback((verses: { text: string }[], startIdx = 0) => {
    cancelAllAudio();
    skipRef.current?.();
    skipRef.current = null;

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
  }, [runPlayback, cancelAllAudio]);

  const stopPlayback = useCallback(() => {
    cancelAllAudio();
    skipRef.current?.();
    skipRef.current = null;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVerseIdx(0);
    setTotalVerses(0);
    setPassageComplete(false);
  }, [cancelAllAudio]);

  const pausePlayback = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resumePlayback = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    } else if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }, []);

  const togglePause = useCallback(() => {
    if (isPaused) { resumePlayback(); } else { pausePlayback(); }
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
    cancelAllAudio();
    skipRef.current?.();
    skipRef.current = null;
  }, [isPaused, resumePlayback, stopPlayback, cancelAllAudio]);

  const skipBackward = useCallback(() => {
    if (isPaused) resumePlayback();
    const prev = Math.max(0, currentIdxRef.current - 1);
    currentIdxRef.current = prev;
    cancelAllAudio();
    skipRef.current?.();
    skipRef.current = null;
  }, [isPaused, resumePlayback, cancelAllAudio]);

  const handleSetVolume = useCallback((vol: number) => {
    setVolume(Math.max(0, Math.min(1, vol)));
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "none") return "one";
      if (prev === "one") return "all";
      return "none";
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => () => { cancelAllAudio(); }, [cancelAllAudio]);

  return {
    isPlaying,
    isPaused,
    speechRate,
    voices,
    selectedVoice,
    currentVerseIdx,
    totalVerses,
    passageComplete,
    volume,
    ttsEnabled,
    repeatMode,
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
    setVolume: handleSetVolume,
    setRepeatMode,
    cycleRepeatMode,
  };
}
