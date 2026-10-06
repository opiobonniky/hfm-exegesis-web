import type { PropsWithChildren } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLabFlow } from "./useLabFlow";

const mocks = vi.hoisted(() => ({
  startSession: vi.fn(),
  getSession: vi.fn(),
  saveStageProgress: vi.fn(),
  saveProgress: vi.fn(),
}));

vi.mock("@/services/exegesisApi", () => mocks);

vi.mock("../services/save-flow-progress", () => ({
  saveAbideProgress: vi.fn(),
  saveApplyProgress: vi.fn(),
}));

const wrapper =
  (entry: string) =>
  ({ children }: PropsWithChildren) => (
    <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
  );

describe("useLabFlow entry stage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.startSession.mockResolvedValue({ id: "new-session" });
  });

  it("starts a requested later step at Look and preserves the passage range", async () => {
    const { result } = renderHook(() => useLabFlow(), {
      wrapper: wrapper(
        "/lab?book=John&chapter=1&verseStart=1&verseEnd=3&requestedStage=learn",
      ),
    });

    expect(result.current.data.stage).toBe("look");
    expect(result.current.data.requestedStage).toBe("learn");
    expect(result.current.data.verseStart).toBe("1");
    expect(result.current.data.verseEnd).toBe("3");

    await waitFor(() => expect(result.current.data.sessionId).toBe("new-session"));
    expect(result.current.data.stage).toBe("look");
    expect(mocks.startSession).toHaveBeenCalledWith({
      bookName: "John",
      chapter: 1,
      verseStart: 1,
      verseEnd: 3,
    });
  });

  it("resumes an existing session at its saved stage", async () => {
    mocks.getSession.mockResolvedValue({
      id: "saved-session",
      bookName: "Romans",
      chapter: 8,
      verseStart: 28,
      verseEnd: 28,
      passageRef: "Romans 8:28",
      currentStage: "abide",
      completed: false,
    });

    const { result } = renderHook(() => useLabFlow(), {
      wrapper: wrapper("/lab?sessionId=saved-session"),
    });

    await waitFor(() => expect(result.current.data.loading).toBe(false));
    await waitFor(() => expect(result.current.data.stage).toBe("abide"));
    expect(result.current.data.requestedStage).toBeNull();
    expect(mocks.startSession).not.toHaveBeenCalled();
  });
});
