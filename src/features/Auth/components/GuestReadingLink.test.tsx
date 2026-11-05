import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuestReadingLink } from "./GuestReadingLink";

const mocks = vi.hoisted(() => ({ startGuest: vi.fn() }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ startGuest: mocks.startGuest }),
}));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (v: string) => v }));

describe("guest reading entry", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts a guest reading session for signed-out visitors", () => {
    render(<GuestReadingLink />);
    fireEvent.click(screen.getByRole("button", { name: /continue as guest/i }));
    expect(mocks.startGuest).toHaveBeenCalledTimes(1);
  });

  it("does not start a session while another action is in flight", () => {
    render(<GuestReadingLink disabled />);
    const button = screen.getByRole("button", { name: /continue as guest/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mocks.startGuest).not.toHaveBeenCalled();
  });
});
