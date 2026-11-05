import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRegisterPage } from "./useRegisterPage";
import { useGoogleRegisterPage } from "./useGoogleRegisterPage";

const mocks = vi.hoisted(() => ({ post: vi.fn(), navigate: vi.fn(), setUser: vi.fn(), toast: vi.fn(), state: { registrationProof: "signed-proof", firstName: "Maya", lastName: "Reader", email: "maya@example.com" } as Record<string, string> | null }));
vi.mock("@/services/api", () => ({ sendPostRequest: mocks.post }));
vi.mock("react-router-dom", () => ({ useNavigate: () => mocks.navigate, useLocation: () => ({ state: mocks.state }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ setUserInfo: mocks.setUser }) }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/components/languages/languageProvider", () => ({ useLanguage: () => ({ t: {}, isRtl: false }) }));
vi.mock("@/components/languages/hardcodedTranslate", () => ({ tt: (v: string) => v }));
vi.mock("@/lib/utils", () => ({ getDeviceInfo: () => ({}), getClientIP: async () => "" }));
vi.mock("firebase/auth", () => ({ GoogleAuthProvider: { credentialFromResult: vi.fn() }, signInWithPopup: vi.fn() }));
vi.mock("@/firebaseConfiguration/config", () => ({ auth: {}, googleProvider: {} }));
const event = () => ({ preventDefault: vi.fn() }) as unknown as React.FormEvent;

describe("web registration parity", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.state = { registrationProof: "signed-proof", firstName: "Maya", lastName: "Reader", email: "maya@example.com" }; });
  it("does not leave the profile step with missing names", async () => {
    const { result } = renderHook(useRegisterPage);
    await act(async () => result.current.actions.handleSubmit(event()));
    expect(result.current.data.step).toBe(1); expect(mocks.post).not.toHaveBeenCalled();
  });
  it("registers all profile fields and waits for email verification before authentication", async () => {
    mocks.post.mockResolvedValueOnce({ returnCode: 200 }).mockResolvedValueOnce({ returnCode: 200, returnData: { token: "session", userRole: 2 } });
    const { result } = renderHook(useRegisterPage);
    act(() => {
      for (const [name, value] of Object.entries({ firstName: "Maya", lastName: "Reader", email: "MAYA@example.com", username: "maya", phoneNumber: "+12025550123", gender: "Female", dateOfBirth: "1990-04-02", password: "Secure123!", confirmPassword: "Secure123!" })) result.current.actions.handleChange({ target: { name, value } } as React.ChangeEvent<HTMLInputElement>);
      result.current.actions.setStep(3);
    });
    await act(async () => result.current.actions.handleSubmit(event()));
    expect(mocks.post).toHaveBeenCalledWith("auth", "register", expect.objectContaining({ firstName: "Maya", lastName: "Reader", email: "maya@example.com", phoneNumber: "+12025550123", gender: "Female", dateOfBirth: "1990-04-02" }));
    expect(result.current.data.step).toBe(4); expect(mocks.setUser).not.toHaveBeenCalled();
    act(() => result.current.actions.setCode("123456"));
    await act(async () => result.current.actions.handleSubmit(event()));
    expect(mocks.post).toHaveBeenLastCalledWith("auth", "verify-account", { email: "maya@example.com", code: "123456" });
    expect(mocks.setUser).toHaveBeenCalledWith(expect.objectContaining({ token: "session" }));
  });
  it("rejects missing or expired Google proof before making a request", async () => {
    mocks.state = null; const { result } = renderHook(useGoogleRegisterPage);
    await act(async () => result.current.actions.handleRegister(event()));
    expect(mocks.post).not.toHaveBeenCalled(); expect(result.current.data.error).toContain("expired");
  });
  it("enforces Google password confirmation, then sends the signed proof and contact fields", async () => {
    const { result } = renderHook(useGoogleRegisterPage);
    await act(async () => result.current.actions.handleRegister(event()));
    expect(result.current.data.step).toBe(2);
    act(() => { result.current.actions.setPassword("Secure123!"); result.current.actions.setConfirmPassword("Mismatch123!"); });
    await act(async () => result.current.actions.handleRegister(event()));
    expect(mocks.post).not.toHaveBeenCalled(); expect(result.current.data.error).toContain("match");
    mocks.post.mockResolvedValue({ returnCode: 200, returnData: { token: "google-session" } });
    act(() => { result.current.actions.setConfirmPassword("Secure123!"); result.current.actions.setPhoneNumber("+12025550123"); });
    await act(async () => result.current.actions.handleRegister(event()));
    expect(mocks.post).toHaveBeenCalledWith("auth", "complete-google-registration", expect.objectContaining({ registrationProof: "signed-proof", username: "mayareader", phoneNumber: "+12025550123", password: "Secure123!" }));
    const payload = mocks.post.mock.calls[0][2]; expect(payload).not.toHaveProperty("email"); expect(payload).not.toHaveProperty("googleId");
  });
});
