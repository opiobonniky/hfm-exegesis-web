import { describe, it, expect, vi, beforeEach } from "vitest";
import { finishRegistration, registrationFieldError, readProfilePhoto } from "./registration";
import { sendPostRequest } from "@/services/api";

vi.mock("@/services/api", () => ({ sendPostRequest: vi.fn() }));
describe("registration validation and photo lifecycle", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requires strong, matching passwords for both registration methods", () => {
    expect(registrationFieldError("password", "weak")).not.toBe("");
    expect(registrationFieldError("password", "Secure123!")).toBe("");
    expect(registrationFieldError("confirmPassword", "", "Secure123!")).not.toBe("");
    expect(registrationFieldError("confirmPassword", "Different123!", "Secure123!")).not.toBe("");
    expect(registrationFieldError("confirmPassword", "Secure123!", "Secure123!")).toBe("");
  });
  it("checks optional contact fields only when supplied", () => {
    expect(registrationFieldError("phoneNumber", "")).toBe("");
    expect(registrationFieldError("phoneNumber", "bad phone")).not.toBe("");
    expect(registrationFieldError("dateOfBirth", "2999-01-01")).not.toBe("");
  });
  it("rejects unsupported and oversized photos", async () => {
    await expect(readProfilePhoto(new File(["text"], "note.txt", { type: "text/plain" }))).rejects.toThrow("JPEG");
    await expect(readProfilePhoto(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.png", { type: "image/png" }))).rejects.toThrow("5 MB");
  });
  it("authenticates before the protected photo upload", async () => {
    const order: string[] = []; const user = { token: "session", username: "reader" };
    const setUser = vi.fn(() => order.push("session"));
    vi.mocked(sendPostRequest).mockImplementation(async () => { order.push("upload"); return { success: true, returnCode: 200, returnData: { profilePhotoUrl: "/photo.png" } }; });
    await finishRegistration(user, "data:image/png;base64,aGVsbG8=", setUser, vi.fn());
    expect(order).toEqual(["session", "upload", "session"]);
    expect(setUser).toHaveBeenLastCalledWith({ ...user, profilePhotoUrl: "/photo.png" });
  });
  it("keeps the authenticated account when the optional photo fails", async () => {
    vi.mocked(sendPostRequest).mockResolvedValue({ success: false, returnCode: 500 });
    const setUser = vi.fn(); const warn = vi.fn(); const user = { token: "session" };
    await finishRegistration(user, "photo", setUser, warn);
    expect(setUser).toHaveBeenCalledOnce(); expect(setUser).toHaveBeenCalledWith(user); expect(warn).toHaveBeenCalledOnce();
  });
});
