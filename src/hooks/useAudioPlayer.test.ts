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
});
