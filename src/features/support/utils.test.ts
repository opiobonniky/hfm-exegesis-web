import { describe, expect, it } from "vitest";
import { formatSupportTime } from "./utils";

describe("formatSupportTime", () => {
  const now = new Date(2026, 9, 16, 12, 0, 0);

  it("formats recent activity compactly", () => {
    expect(formatSupportTime(new Date(2026, 9, 16, 11, 59, 40).toISOString(), now)).toBe("now");
    expect(formatSupportTime(new Date(2026, 9, 16, 11, 58).toISOString(), now)).toBe("2min");
    expect(formatSupportTime(new Date(2026, 9, 16, 9).toISOString(), now)).toBe("3h");
  });

  it("formats older activity conversationally", () => {
    expect(formatSupportTime(new Date(2026, 9, 15, 10).toISOString(), now)).toBe("Yesterday");
    expect(formatSupportTime(new Date(2026, 9, 13, 10).toISOString(), now, "en-US")).toBe("Tue");
    expect(formatSupportTime(new Date(2026, 9, 1, 10).toISOString(), now, "en-US")).toBe("Oct 1");
  });
});
