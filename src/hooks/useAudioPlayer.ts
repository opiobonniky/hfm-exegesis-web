import { useState, useRef, useCallback, useEffect } from "react";
import { ttsService, type TTSVoice } from "@/services/ttsService";

export interface AudioPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  /** True while the current verse audio is being fetched/synthesized (buffering is rare thanks to prefetching) */
  isBuffering: boolean;
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
  /** Jump playback to a playlist index (0-based) — used by the tick-bar scrubber. */
  seekToVerse: (verseIdx: number) => void;
  setVolume: (vol: number) => void;
  setRepeatMode: (mode: "none" | "one" | "all") => void;
  cycleRepeatMode: () => void;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

/**
 * Natural pause between verses (ms) so scripture reads like a professional
 * narration instead of back-to-back robotic speech. Scales with the speech
 * rate — faster reading, proportionally shorter breaths.
 */
const VERSE_PAUSE_BASE_MS = 420;
/** Extra pause at the end of a chapter/passage before completion. */
const PASSAGE_END_PAUSE_MS = 900;
/** Longest pause applied at reduced speeds. */
const VERSE_PAUSE_MAX_MS = 900;

const versePauseMs = (rate: number, isLastVerse: boolean) => {
  const base = isLastVerse ? PASSAGE_END_PAUSE_MS : VERSE_PAUSE_BASE_MS;
  return Math.min(Math.round(base / Math.max(rate, 0.5)), VERSE_PAUSE_MAX_MS + 600);
};

/**
 * Expand common scripture abbreviations and symbols so TTS pronounces them
 * naturally (e.g. "LORD" → "Lord", "§" → "verse"). Purely for narration —
 * the on-screen text is never modified.
 */
const normalizeForSpeech = (text: string): string =>
  text
    .replace(/\bLORD\b/g, "Lord")
    .replace(/\bLord\s+GOD\b/g, "Lord God")
    .replace(/\bGOD\b/g, "God")
    .replace(/\bv\.(?=\s*\d)/gi, "verse ")
    .replace(/\bvs\.(?=\s*\d)/gi, "verse ")
    .replace(/§/g, "verse ")
    .replace(/\s{2,}/g, " ")
    .trim();

/** How many upcoming verses to keep synthesized and ready in the cache */
const PREFETCH_AHEAD = 2;
/** Maximum number of object URLs kept in the cache before evicting the oldest */
const CACHE_MAX_ENTRIES = 8;

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
  } catch {
    // Storage may be unavailable in private browsing or tests.
  }
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
  } catch {
    // Storage may be unavailable in private browsing or tests.
  }
  return 1;
}

function saveSpeechRate(rate: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.speechRate, String(rate));
  } catch {
    // Preference persistence is best-effort.
  }
}

function saveVoiceId(voiceId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selectedVoiceId, voiceId);
  } catch {
    // Preference persistence is best-effort.
  }
}

function saveVolume(vol: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.volume, String(vol));
  } catch {
    // Preference persistence is best-effort.
  }
}

/**
 * Cache key: synthesis settings are part of the key so cached audio is never
 * reused with the wrong voice or speed.
 */
interface CacheKey {
  text: string;
  voiceId: string;
  speed: number;
}

function cacheKeyToString(key: CacheKey): string {
  return `${key.speed}|${key.voiceId}|${key.text}`;
}

interface CacheEntry {
  audio: HTMLAudioElement;
  url: string;
}

export function useAudioPlayer(): AudioPlayerState & AudioPlayerActions {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
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
  const repeatModeRef = useRef<"none" | "one" | "all">("none");
  const ttsEnabledRef = useRef(false);
  const selectedVoiceIdRef = useRef<string>("en-US-AriaNeural");

  /**
   * Settles the currently-awaiting playVerse promise. Every playback engine
   * registers its settle function here; stop/skip/unmount invoke it so the
   * runPlayback loop never stays blocked on a promise that would never
   * resolve (paused audio fires no onended).
   */
  const settleCurrentRef = useRef<(() => void) | null>(null);
  /** Timeout handle for the inter-verse narration pause. */
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Monotonic epoch guarding all async work. Any fetch that was started
   * before a stop/skip/restart must not attach itself to the new session.
   */
  const epochRef = useRef(0);

  /** Prefetch cache of synthesized verse audio, in insertion (FIFO) order */
  const audioCacheRef = useRef<Map<string, CacheEntry>>(new Map());
  /** In-flight synthesis requests, deduped by cache key */
  const pendingFetchRef = useRef<
    Map<string, Promise<HTMLAudioElement | null>>
  >(new Map());

  // Sync refs and persist
  useEffect(() => {
    speechRateRef.current = speechRate;
    saveSpeechRate(speechRate);
  }, [speechRate]);
  useEffect(() => {
    volumeRef.current = volume;
    saveVolume(volume);
  }, [volume]);
  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);
  useEffect(() => {
    ttsEnabledRef.current = ttsEnabled;
  }, [ttsEnabled]);
  useEffect(() => {
    selectedVoiceIdRef.current =
      selectedVoice?.voiceId || "en-US-AriaNeural";
  }, [selectedVoice]);

  // Check whether TTS API is enabled
  useEffect(() => {
    ttsService
      .isEnabled()
      .then(setTtsEnabled)
      .catch(() => setTtsEnabled(false));
  }, []);

  // Load voices on mount
  useEffect(() => {
    ttsService
      .getVoices()
      .then((available) => {
        setVoices(available);
        const savedVoiceId = loadVoiceId();
        if (savedVoiceId) {
          const saved = available.find((v) => v.voiceId === savedVoiceId);
          if (saved) {
            setSelectedVoice(saved);
            return;
          }
        }
        const preferred = available.find((v) =>
          /aria|jenny|guy|davis|emma/i.test(v.name),
        );
        setSelectedVoice(preferred || available[0] || null);
      })
      .catch(() => {});
  }, []);

  const clearAudioCache = useCallback(() => {
    const cache = audioCacheRef.current;
    cache.forEach((entry) => {
      entry.audio.pause();
      entry.audio.src = "";
      URL.revokeObjectURL(entry.url);
    });
    cache.clear();
    pendingFetchRef.current.clear();
  }, []);

  // ── Playback engines ──

  const cancelAllAudio = useCallback(() => {
    isReadingRef.current = false;
    isPausedRef.current = false;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (utteranceRef.current) {
      if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    // Unblock the playback loop if a verse promise is still pending.
    settleCurrentRef.current?.();
    settleCurrentRef.current = null;
    // NOTE: the prefetch cache intentionally survives stop/restart so
    // re-listening to a passage starts instantly; it is bounded by FIFO
    // eviction and fully cleared on unmount or voice change.
  }, []);

  /**
   * Fetch (or reuse cached) TTS audio for one verse as a ready-to-play
   * <audio> element. Results are cached so consecutive plays, repeats and
   * replays of the same verse never hit the network twice.
   */
  const fetchVerseAudio = useCallback(
    (text: string): Promise<HTMLAudioElement | null> => {
      const keyStr = cacheKeyToString({
        text,
        voiceId: selectedVoiceIdRef.current,
        speed: speechRateRef.current,
      });

      const cached = audioCacheRef.current.get(keyStr);
      if (cached) return Promise.resolve(cached.audio);

      const pending = pendingFetchRef.current.get(keyStr);
      if (pending) return pending;

      const fetchPromise = (async (): Promise<HTMLAudioElement | null> => {
        try {
          const arrayBuffer = await ttsService.speak(
            text,
            selectedVoiceIdRef.current,
            speechRateRef.current,
          );
          const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.volume = volumeRef.current;

          const cache = audioCacheRef.current;
          cache.set(keyStr, { audio, url });
          // FIFO eviction of stale entries (long passages). Never evict the
          // element that is currently playing.
          while (cache.size > CACHE_MAX_ENTRIES) {
            let evicted = false;
            for (const entryKey of cache.keys()) {
              const entry = cache.get(entryKey);
              if (!entry || entry.audio === audioRef.current) continue;
              cache.delete(entryKey);
              entry.audio.pause();
              entry.audio.src = "";
              URL.revokeObjectURL(entry.url);
              evicted = true;
              break;
            }
            if (!evicted) break;
          }
          return audio;
        } catch {
          return null;
        } finally {
          pendingFetchRef.current.delete(keyStr);
        }
      })();

      pendingFetchRef.current.set(keyStr, fetchPromise);
      return fetchPromise;
    },
    [],
  );

  /**
   * Kick off background synthesis for upcoming verses so their audio is ready
   * before the current verse finishes. Fire-and-forget: failures are ignored
   * (the play path falls back to Web Speech) and results simply land in the
   * shared cache.
   */
  const prefetchUpcoming = useCallback((fromIdx: number) => {
    if (!ttsEnabledRef.current) return;
    const verses = versesRef.current;
    const end = Math.min(fromIdx + PREFETCH_AHEAD, verses.length);
    for (let i = fromIdx; i < end; i++) {
      const text = verses[i]?.text;
      if (!text) continue;
      void fetchVerseAudio(text);
    }
  }, [fetchVerseAudio]);

  // Web Speech API fallback
  const playWebSpeech = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!("speechSynthesis" in window)) {
          resolve();
          return;
        }

        const u = new SpeechSynthesisUtterance(text);
        u.rate = speechRateRef.current;
        u.volume = volumeRef.current;
        u.pitch = 1.0;

        // Match selected voice to browser voices
        if (
          selectedVoice?.voiceId &&
          window.speechSynthesis.getVoices().length > 0
        ) {
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

        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          utteranceRef.current = null;
          if (settleCurrentRef.current === settle) settleCurrentRef.current = null;
          resolve();
        };
        settleCurrentRef.current = settle;

        u.onend = settle;
        // "interrupted" fires when speechSynthesis.cancel() is called during a
        // skip/stop — settling there is exactly what unblocks the loop.
        u.onerror = () => settle();

        window.speechSynthesis.speak(u);
      });
    },
    [selectedVoice],
  );

  // TTS API path (backed by Edge TTS / ElevenLabs)
  const playTTS = useCallback(
    async (text: string, verseIdx: number): Promise<void> => {
      const startEpoch = epochRef.current;

      const keyStr = cacheKeyToString({
        text,
        voiceId: selectedVoiceIdRef.current,
        speed: speechRateRef.current,
      });
      // Only surface the buffering indicator when synthesis isn't already ready
      if (!audioCacheRef.current.has(keyStr)) setIsBuffering(true);

      const audio = await fetchVerseAudio(text);
      setIsBuffering(false);

      // Playback was stopped/restarted while we were fetching, or the user
      // skipped to a different verse — discard the stale result (it stays
      // cached for when that verse is actually needed).
      if (
        epochRef.current !== startEpoch ||
        !isReadingRef.current ||
        currentIdxRef.current !== verseIdx
      ) {
        return;
      }

      if (!audio) {
        // Synthesis failed — fall back to Web Speech
        await playWebSpeech(text);
        return;
      }

      await new Promise<void>((resolve) => {
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          if (settleCurrentRef.current === settle) settleCurrentRef.current = null;
          audio.pause();
          if (audioRef.current === audio) audioRef.current = null;
          resolve();
        };
        settleCurrentRef.current = settle;

        audio.currentTime = 0;
        audio.playbackRate = speechRateRef.current;
        audio.volume = volumeRef.current;
        audioRef.current = audio;
        audio.onended = settle;
        audio.onerror = settle;

        audio.play().catch(() => {
          settle();
          void playWebSpeech(text);
        });
        if (isPausedRef.current) audio.pause();
      });
    },
    [fetchVerseAudio, playWebSpeech],
  );

  const playVerse = useCallback(
    async (text: string, verseIdx: number): Promise<void> => {
      if (ttsEnabled) {
        await playTTS(text, verseIdx);
      } else {
        await playWebSpeech(text);
      }
    },
    [ttsEnabled, playTTS, playWebSpeech],
  );

  // ── Playback loop ──

  const runPlayback = useCallback(async () => {
    // A loop instance owns exactly one playback "epoch". Any stop/restart
    // bumps the epoch, causing this loop to exit without touching state so
    // the newer loop (if any) is the sole owner of playback.
    const myEpoch = epochRef.current;

    while (isReadingRef.current && epochRef.current === myEpoch) {
      const idx = currentIdxRef.current;

      if (idx >= versesRef.current.length) {
        setPassageComplete(true);
        break;
      }

      setCurrentVerseIdx(idx);
      // Narrate from a normalized copy so abbreviations/symbols are spoken
      // naturally; the on-screen verse text is untouched.
      const spokenText = normalizeForSpeech(versesRef.current[idx].text);
      // Start the CURRENT verse's synthesis first so it reaches the backend
      // TTS pool before any prefetches, then warm the cache for the verses
      // that follow. By the time the current verse ends, the next audio is
      // usually already synthesized and playback continues without a gap.
      const playPromise = playVerse(spokenText, idx);
      prefetchUpcoming(idx + 1);
      await playPromise;

      // Superseded by stop/restart while this verse was playing.
      if (epochRef.current !== myEpoch) break;

      // Advance to next verse (unless repeat-one mode). A skip already moved
      // currentIdxRef — the equality check defers to it.
      if (currentIdxRef.current === idx && repeatModeRef.current !== "one") {
        currentIdxRef.current = idx + 1;
      }

      // Breathe between verses — a short beat before the next verse starts
      // gives narration a natural, professional cadence. Repeat-one replays
      // immediately without a pause. Interruptible: stop/skip during the
      // pause must abort it immediately.
      const isLastVerse = idx + 1 >= versesRef.current.length;
      if (isReadingRef.current && !isPausedRef.current && repeatModeRef.current !== "one") {
        const pauseMs = versePauseMs(speechRateRef.current, isLastVerse);
        const startEpoch = epochRef.current;
        await new Promise<void>((resolve) => {
          pauseTimeoutRef.current = setTimeout(resolve, pauseMs);
          // Abort the sleep if playback is redirected/stopped mid-pause.
          settleCurrentRef.current = () => {
            if (pauseTimeoutRef.current) {
              clearTimeout(pauseTimeoutRef.current);
              pauseTimeoutRef.current = null;
            }
            resolve();
          };
        });
        if (settleCurrentRef.current) settleCurrentRef.current = null;
        if (epochRef.current !== startEpoch || !isReadingRef.current) break;
      }
    }

    // A newer loop (restart) or skip redirect owns playback now.
    if (epochRef.current !== myEpoch) return;

    if (isReadingRef.current) {
      isReadingRef.current = false;
      isPausedRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setIsBuffering(false);
    }
  }, [playVerse, prefetchUpcoming]);

  // Always-fresh accessor so actions can (re)start the loop with the latest
  // closure (e.g. after a voice change recreated playVerse).
  const runPlaybackRef = useRef<() => Promise<void> | null>(null);
  runPlaybackRef.current = runPlayback;

  // ── Public actions ──

  const startPlayback = useCallback(
    (verses: { text: string }[], startIdx = 0) => {
      // Bump the epoch so any in-flight loop/fetch from a previous session
      // exits instead of fighting the new one, then cut current audio.
      epochRef.current += 1;
      cancelAllAudio();

      versesRef.current = verses;
      currentIdxRef.current = startIdx;
      isReadingRef.current = true;
      isPausedRef.current = false;
      setTotalVerses(verses.length);
      setCurrentVerseIdx(startIdx);
      setIsPlaying(true);
      setIsPaused(false);
      setIsBuffering(false);
      setPassageComplete(false);
      void runPlaybackRef.current?.();
    },
    [cancelAllAudio],
  );

  const stopPlayback = useCallback(() => {
    epochRef.current += 1;
    cancelAllAudio();
    setIsPlaying(false);
    setIsPaused(false);
    setIsBuffering(false);
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

  /**
   * Cut off the verse that is currently playing (skip) without stopping the
   * playback loop and without clearing the prefetch cache — the next verse is
   * likely already synthesized and starts instantly. The epoch stays intact so
   * the runPlayback loop keeps driving playback; the stale verse promise is
   * unblocked via settle and its result discarded (voice-idx check in playTTS
   * and the equality check in the loop).
   *
   * NOTE: must be declared BEFORE setVoice/skipForward/skipBackward, which
   * reference it in their useCallback dependency arrays (evaluated at render
   * time — a later const would be in the temporal dead zone).
   */
  const redirectPlayback = useCallback(() => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (utteranceRef.current) {
      if (window.speechSynthesis?.paused) window.speechSynthesis.resume();
      window.speechSynthesis?.cancel();
      utteranceRef.current = null;
    }
    settleCurrentRef.current?.();
    settleCurrentRef.current = null;
  }, []);

  const setVoice = useCallback(
    (voice: TTSVoice) => {
      setSelectedVoice(voice);
      selectedVoiceIdRef.current = voice.voiceId;
      saveVoiceId(voice.voiceId);

      const wasReading = isReadingRef.current;
      const resumeIdx = currentIdxRef.current;
      const wasPaused = isPausedRef.current;

      // Drop all cached audio (it was synthesized with the previous voice) and
      // end the current loop; then hot-restart playback at the current verse
      // so the new voice is heard immediately and upcoming verses are
      // prefetched with it. redirectPlayback also cancels any Web Speech
      // fallback audio so the old voice never overlaps the new one.
      redirectPlayback();
      clearAudioCache();
      epochRef.current += 1;

      if (wasReading) {
        currentIdxRef.current = resumeIdx;
        setIsBuffering(false);
        void runPlaybackRef.current?.();
        if (wasPaused) {
          // runPlayback starts the verse then pauses it via isPausedRef
          isPausedRef.current = true;
          setIsPaused(true);
        }
      }
    },
    [clearAudioCache, redirectPlayback],
  );

  const skipForward = useCallback(() => {
    if (isPausedRef.current) resumePlayback();
    const next = currentIdxRef.current + 1;
    if (next >= versesRef.current.length) {
      stopPlayback();
      return;
    }
    currentIdxRef.current = next;
    redirectPlayback();
  }, [resumePlayback, stopPlayback, redirectPlayback]);

  const skipBackward = useCallback(() => {
    if (isPausedRef.current) resumePlayback();
    const prev = Math.max(0, currentIdxRef.current - 1);
    currentIdxRef.current = prev;
    redirectPlayback();
  }, [resumePlayback, redirectPlayback]);

  /**
   * Scrub straight to a playlist index (tick-bar click / keyboard seek).
   * Same contract as skipBackward/skipForward: advance the index, then
   * redirectPlayback() so the loop drops the stale verse and picks up the
   * new one — while paused it resumes so the seek is heard immediately.
   */
  const seekToVerse = useCallback(
    (verseIdx: number) => {
      if (!isReadingRef.current) return;
      const clamped = Math.min(
        Math.max(Math.trunc(verseIdx), 0),
        Math.max(versesRef.current.length - 1, 0),
      );
      if (clamped === currentIdxRef.current) return;
      if (isPausedRef.current) resumePlayback();
      currentIdxRef.current = clamped;
      redirectPlayback();
    },
    [redirectPlayback, resumePlayback],
  );

  const handleSetVolume = useCallback((vol: number) => {
    const nextVolume = Math.max(0, Math.min(1, vol));
    volumeRef.current = nextVolume;
    if (audioRef.current) audioRef.current.volume = nextVolume;
    setVolume(nextVolume);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "none") return "one";
      if (prev === "one") return "all";
      return "none";
    });
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      cancelAllAudio();
      clearAudioCache();
    },
    [cancelAllAudio, clearAudioCache],
  );

  return {
    isPlaying,
    isPaused,
    isBuffering,
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
    seekToVerse,
    setVolume: handleSetVolume,
    setRepeatMode,
    cycleRepeatMode,
  };
}
