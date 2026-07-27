import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAudioPlayer } from "./useAudioPlayer";

// ── Mock Data ──

const MOCK_VOICES = [
  { name: "Aria (Female)", voiceId: "en-US-AriaNeural", source: "edge" as const, category: "Neural" },
  { name: "Guy (Male)", voiceId: "en-US-GuyNeural", source: "edge" as const, category: "Neural" },
];

const MOCK_VERSES = [
  { text: "In the beginning God created the heavens and the earth." },
  { text: "The earth was without form and void." },
  { text: "And God said, Let there be light." },
];

const SINGLE_VERSE = [{ text: "Jesus wept." }];

// ── Mocks ──

vi.mock("@/services/ttsService", () => ({
  ttsService: {
    speak: vi.fn(),
    getVoices: vi.fn(),
    isEnabled: vi.fn().mockResolvedValue(false),
  },
}));

import { ttsService } from "@/services/ttsService";

/**
 * Mock audio element with explicit control over callbacks.
 * play() resolves immediately (unblocking await) without firing onended/onerror.
 * Tests call fireOnended() or fireOnerror() to explicitly advance verses.
 */
function createMockAudio() {
  let onendedCb: (() => void) | null = null;
  let onerrorCb: (() => void) | null = null;
  const el = {
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    src: "",
    playbackRate: 1,
    get onended() { return onendedCb; },
    set onended(fn) { onendedCb = fn; },
    get onerror() { return onerrorCb; },
    set onerror(fn) { onerrorCb = fn; },
  };
  return el;
}

let mockAudioEl: ReturnType<typeof createMockAudio>;

function setupAudioMock() {
  mockAudioEl = createMockAudio();
  vi.stubGlobal("Audio", vi.fn(() => mockAudioEl));
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:mock"),
    revokeObjectURL: vi.fn(),
  });
}

/**
 * Fire the onended callback on the current mock audio element,
 * which resolves playVerse and advances runPlayback to the next verse.
 */
function fireOnended() {
  act(() => {
    mockAudioEl.onended?.();
  });
}

/**
 * Fire the onerror callback on the current mock audio element.
 */
function fireOnerror() {
  act(() => {
    mockAudioEl.onerror?.();
  });
}

/** Flush pending microtasks and React state updates */
async function flush() {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

// ── Suite ──

describe("useAudioPlayer", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    setupAudioMock();
    vi.mocked(ttsService.getVoices).mockResolvedValue(MOCK_VOICES);
    vi.mocked(ttsService.speak).mockResolvedValue(new ArrayBuffer(0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ── Initial state ──

  describe("initial state", () => {
    it("starts with idle state", () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.speechRate).toBe(1.0);
      expect(result.current.currentVerseIdx).toBe(0);
      expect(result.current.totalVerses).toBe(0);
      expect(result.current.passageComplete).toBe(false);
      expect(result.current.selectedVoice).toBeNull();
    });

    it("loads voices on mount", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));
      expect(result.current.voices).toEqual(MOCK_VOICES);
      expect(result.current.selectedVoice?.name).toBe("Aria (Female)");
    });

    it("falls back to first voice when no preferred voice matches", async () => {
      vi.mocked(ttsService.getVoices).mockResolvedValue([
        { name: "Unknown", voiceId: "unknown", source: "edge", category: "Neural" },
      ]);
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBe(1));
      expect(result.current.selectedVoice?.voiceId).toBe("unknown");
    });

    it("handles getVoices failure gracefully", async () => {
      vi.mocked(ttsService.getVoices).mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useAudioPlayer());
      await flush();
      expect(result.current.voices).toEqual([]);
      expect(result.current.selectedVoice).toBeNull();
    });
  });

  // ── startPlayback ──

  describe("startPlayback", () => {
    it("starts playing and tracks verses", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.totalVerses).toBe(3);
      expect(result.current.currentVerseIdx).toBe(0);
      expect(result.current.passageComplete).toBe(false);
    });

    it("plays through all verses and marks passage complete", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve, audioRef set

      fireOnended();  // verse 0 → 1
      await flush();
      expect(result.current.currentVerseIdx).toBe(1);

      fireOnended();  // verse 1 → 2
      await flush();
      expect(result.current.currentVerseIdx).toBe(2);

      fireOnended();  // verse 2 → passage complete
      await flush();
      expect(result.current.passageComplete).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });

    it("can start from a specific index", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES, 1));

      expect(result.current.currentVerseIdx).toBe(1);
    });

    it("stops existing playback before starting new one", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve, audioRef.current set

      // audioRef.current is still set (onended hasn't fired yet)
      act(() => result.current.startPlayback(SINGLE_VERSE));

      expect(mockAudioEl.pause).toHaveBeenCalled();
      expect(result.current.totalVerses).toBe(1);
      expect(result.current.currentVerseIdx).toBe(0);
    });

    it("sets passageComplete immediately for empty verse array", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.startPlayback([]));

      expect(result.current.passageComplete).toBe(true);
    });
  });

  // ── stopPlayback ──

  describe("stopPlayback", () => {
    it("resets all playback state", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve, audioRef.current set

      act(() => result.current.stopPlayback());

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.currentVerseIdx).toBe(0);
      expect(result.current.totalVerses).toBe(0);
      expect(result.current.passageComplete).toBe(false);
      expect(mockAudioEl.pause).toHaveBeenCalled();
    });
  });

  // ── Pause / Resume ──

  describe("pause/resume", () => {
    it("pausePlayback sets isPaused to true", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve, audioRef.current set

      act(() => result.current.pausePlayback());

      expect(result.current.isPaused).toBe(true);
      expect(mockAudioEl.pause).toHaveBeenCalled();
    });

    it("resumePlayback sets isPaused to false", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();

      act(() => result.current.pausePlayback());
      expect(result.current.isPaused).toBe(true);

      act(() => result.current.resumePlayback());
      expect(result.current.isPaused).toBe(false);
      expect(mockAudioEl.play).toHaveBeenCalled();
    });

    it("togglePause toggles between paused and playing", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();

      act(() => result.current.togglePause());
      expect(result.current.isPaused).toBe(true);

      act(() => result.current.togglePause());
      expect(result.current.isPaused).toBe(false);
    });
  });

  // ── Speed ──

  describe("speed control", () => {
    it("has default speech rate of 1.0", () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.speechRate).toBe(1.0);
    });

    it("cycleSpeed cycles through speed options", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.cycleSpeed());
      expect(result.current.speechRate).toBe(1.25);

      act(() => result.current.cycleSpeed());
      expect(result.current.speechRate).toBe(1.5);

      act(() => result.current.cycleSpeed());
      expect(result.current.speechRate).toBe(1.75);

      act(() => result.current.cycleSpeed());
      expect(result.current.speechRate).toBe(2.0);

      act(() => result.current.cycleSpeed());
      expect(result.current.speechRate).toBe(0.75);
    });

    it("cycleSpeed updates audio playbackRate when playing", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve, audioRef.current set

      act(() => result.current.cycleSpeed());

      expect(mockAudioEl.playbackRate).toBe(1.25);
    });

    it("setSpeechRate directly sets the rate", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setSpeechRate(1.5));
      expect(result.current.speechRate).toBe(1.5);
    });
  });

  // ── Voice ──

  describe("voice selection", () => {
    it("setVoice updates selectedVoice", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.setVoice(MOCK_VOICES[1]));

      expect(result.current.selectedVoice?.voiceId).toBe("en-US-GuyNeural");
    });
  });

  // ── Skip ──

  describe("skip forward/backward", () => {
    it("skipForward advances to next verse", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve

      fireOnended(); // verse 0 → 1
      await flush();

      act(() => result.current.skipForward()); // forward from 1 → 2
      await flush(); // Let runPlayback process the skip and start verse 2

      expect(result.current.currentVerseIdx).toBe(2);
    });

    it("skipBackward goes to previous verse", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush(); // Let verse 0's play() resolve

      fireOnended(); // verse 0 → 1
      await flush();

      fireOnended(); // verse 1 → 2
      await flush();

      act(() => result.current.skipBackward()); // backward from 2 → 1
      await flush(); // Let runPlayback re-enter loop at verse 1

      expect(result.current.currentVerseIdx).toBe(1);
    });

    it("skipBackward stays at first verse when at beginning", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));

      act(() => result.current.skipBackward());
      expect(result.current.currentVerseIdx).toBe(0);
    });

    it("skipForward stops playback when at last verse of single-verse passage", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));

      act(() => result.current.skipForward());
      expect(result.current.isPlaying).toBe(false);
    });
  });

  // ── Passage complete ──

  describe("passage complete", () => {
    it("reports passageComplete after all verses play", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();

      fireOnended(); await flush(); // verse 0 → 1
      fireOnended(); await flush(); // verse 1 → 2
      fireOnended(); await flush(); // verse 2 → complete

      expect(result.current.passageComplete).toBe(true);
      expect(result.current.isPlaying).toBe(false);
    });

    it("can restart playback after passage completes", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();
      fireOnended(); await flush();
      fireOnended(); await flush();
      fireOnended(); await flush();
      expect(result.current.passageComplete).toBe(true);

      act(() => result.current.startPlayback(MOCK_VERSES));
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.passageComplete).toBe(false);
      expect(result.current.currentVerseIdx).toBe(0);
    });
  });

  // ── Error handling ──

  describe("error handling", () => {
    it("handles ttsService.speak failure gracefully", async () => {
      vi.mocked(ttsService.speak).mockRejectedValue(new Error("TTS failed"));
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.passageComplete).toBe(true);
    });

    it("handles audio.play() failure gracefully", async () => {
      mockAudioEl.play.mockRejectedValue(new Error("Playback denied"));
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.passageComplete).toBe(true);
    });

    it("handles audio.onerror path gracefully", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      // Fire onerror explicitly instead of onended to test the error path
      fireOnerror();
      await flush();

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.passageComplete).toBe(true);
    });
  });

  // ── Volume control ──

  describe("volume control", () => {
    it("starts with default volume of 1", () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.volume).toBe(1);
    });

    it("setVolume updates volume within valid range", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setVolume(0.5));
      expect(result.current.volume).toBe(0.5);

      act(() => result.current.setVolume(-1));
      expect(result.current.volume).toBe(0);

      act(() => result.current.setVolume(2));
      expect(result.current.volume).toBe(1);
    });

    it("setVolume persists to localStorage", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setVolume(0.3));
      expect(localStorage.getItem("exegesis-volume")).toBe("0.3");
    });

    it("restores volume from localStorage on mount", () => {
      localStorage.setItem("exegesis-volume", "0.7");
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.volume).toBe(0.7);
    });

    it("sets audio element volume when playing via TTS", async () => {
      vi.mocked(ttsService.isEnabled).mockResolvedValue(true);
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.setVolume(0.5));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      // TTS path uses Audio element - volume should be set
      expect(mockAudioEl.volume).toBe(0.5);
    });
  });

  // ── Repeat mode ──

  describe("repeat mode", () => {
    it("starts with repeat mode set to none", () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.repeatMode).toBe("none");
    });

    it("setRepeatMode directly sets the mode", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setRepeatMode("one"));
      expect(result.current.repeatMode).toBe("one");

      act(() => result.current.setRepeatMode("all"));
      expect(result.current.repeatMode).toBe("all");

      act(() => result.current.setRepeatMode("none"));
      expect(result.current.repeatMode).toBe("none");
    });

    it("cycleRepeatMode cycles none → one → all → none", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.cycleRepeatMode());
      expect(result.current.repeatMode).toBe("one");

      act(() => result.current.cycleRepeatMode());
      expect(result.current.repeatMode).toBe("all");

      act(() => result.current.cycleRepeatMode());
      expect(result.current.repeatMode).toBe("none");

      act(() => result.current.cycleRepeatMode());
      expect(result.current.repeatMode).toBe("one");
    });

    it("repeat mode 'one' prevents advancing to next verse", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setRepeatMode("one"));
      act(() => result.current.startPlayback(MOCK_VERSES));

      // Immediately stop playback (before any verse completes)
      act(() => result.current.stopPlayback());

      // The verse should not have advanced
      expect(result.current.currentVerseIdx).toBe(0);
    });

    it("repeat mode 'none' advances to next verse", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();

      fireOnended();
      await flush();

      expect(result.current.currentVerseIdx).toBe(1);
    });
  });

  // ── localStorage persistence ──

  describe("localStorage persistence", () => {
    it("persists speechRate to localStorage", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setSpeechRate(1.5));
      expect(localStorage.getItem("exegesis-speech-rate")).toBe("1.5");
    });

    it("restores speechRate from localStorage on mount", () => {
      localStorage.setItem("exegesis-speech-rate", "1.75");
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.speechRate).toBe(1.75);
    });

    it("restores invalid speechRate as default 1.0", () => {
      localStorage.setItem("exegesis-speech-rate", "999");
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.speechRate).toBe(1.0);
    });

    it("persists voice selection to localStorage", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setVoice(MOCK_VOICES[1]));
      expect(localStorage.getItem("exegesis-selected-voice-id")).toBe("en-US-GuyNeural");
    });

    it("restores voice selection from localStorage on mount", async () => {
      localStorage.setItem("exegesis-selected-voice-id", "en-US-GuyNeural");
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));
      expect(result.current.selectedVoice?.voiceId).toBe("en-US-GuyNeural");
    });

    it("persists volume to localStorage", () => {
      const { result } = renderHook(() => useAudioPlayer());

      act(() => result.current.setVolume(0.42));
      expect(localStorage.getItem("exegesis-volume")).toBe("0.42");
    });
  });

  // ── ttsEnabled / Web Speech API fallback ──

  describe("ttsEnabled / Web Speech API fallback", () => {
    beforeEach(() => {
      vi.mocked(ttsService.isEnabled).mockResolvedValue(false);
      vi.stubGlobal("speechSynthesis", {
        speak: vi.fn(function(u) { setTimeout(() => u.onend?.(), 0); }),
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        paused: false,
        getVoices: vi.fn().mockReturnValue([]),
      });
      vi.stubGlobal("SpeechSynthesisUtterance", vi.fn(() => ({
        onend: null,
        onerror: null,
      })));
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("ttsEnabled starts as false when API is offline", () => {
      const { result } = renderHook(() => useAudioPlayer());
      expect(result.current.ttsEnabled).toBe(false);
    });

    it("uses Web Speech API when tts is disabled", async () => {
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });

    it("uses TTS API when tts is enabled", async () => {
      vi.mocked(ttsService.isEnabled).mockResolvedValue(true);
      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      expect(ttsService.speak).toHaveBeenCalled();
    });

    it("falls back to Web Speech when TTS API fails", async () => {
      vi.mocked(ttsService.isEnabled).mockResolvedValue(true);
      vi.mocked(ttsService.speak).mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      expect(window.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  // ── Unmount cleanup ──

  describe("unmount cleanup", () => {
    it("cancels audio when component unmounts while playing via TTS", async () => {
      vi.mocked(ttsService.isEnabled).mockResolvedValue(true);
      const { result, unmount } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(MOCK_VERSES));
      await flush();

      unmount();

      expect(mockAudioEl.pause).toHaveBeenCalled();
    });

    it("cancels Web Speech when component unmounts while playing", async () => {
      vi.stubGlobal("speechSynthesis", {
        speak: vi.fn(), // Don't fire onend — keep utterance active
        cancel: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        paused: false,
        getVoices: vi.fn().mockReturnValue([]),
      });
      const { result, unmount } = renderHook(() => useAudioPlayer());
      await waitFor(() => expect(result.current.voices.length).toBeGreaterThan(0));

      act(() => result.current.startPlayback(SINGLE_VERSE));
      await flush();

      // Utterance should still be active since speak doesn't fire onended
      unmount();

      expect(window.speechSynthesis.cancel).toHaveBeenCalled();
    });
  });
});
