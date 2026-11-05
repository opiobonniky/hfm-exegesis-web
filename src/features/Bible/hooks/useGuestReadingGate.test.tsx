import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuestReadingGate } from "./useGuestReadingGate";

const mocks = vi.hoisted(() => ({ isGuest: true }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isGuest: mocks.isGuest }),
}));

describe("guest reading gate", () => {
  beforeEach(() => { mocks.isGuest = true; });

  it("blocks an account-only action for guests and surfaces a sign-in reason", () => {
    const { result } = renderHook(() => useGuestReadingGate());
    const action = vi.fn(() => "ran");
    const guarded = result.current.protect(action, "Highlights require an account.");
    let outcome: unknown;
    act(() => { outcome = guarded(); });
    expect(outcome).toBeUndefined();
    expect(action).not.toHaveBeenCalled();
    expect(result.current.message).toBe("Highlights require an account.");
  });

  it("runs the action unchanged and stays silent for signed-in readers", () => {
    mocks.isGuest = false;
    const { result } = renderHook(() => useGuestReadingGate());
    const action = vi.fn((value: number) => value * 2);
    expect(result.current.protect(action)(21)).toBe(42);
    expect(action).toHaveBeenCalledWith(21);
    expect(result.current.message).toBeNull();
  });

  it("clears the prompt when the reader chooses to keep reading", () => {
    const { result } = renderHook(() => useGuestReadingGate());
    act(() => { result.current.requestAccount("Notes require an account."); });
    expect(result.current.message).not.toBeNull();
    act(() => { result.current.close(); });
    expect(result.current.message).toBeNull();
  });
});
