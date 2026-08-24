import { type ReactNode } from "react";
import { renderHook, type RenderHookOptions } from "@testing-library/react";
import { vi } from "vitest";

// ── Mock sendPostRequest ──────────────────────────────────────────────────────

export const mockSendPostRequest = vi.fn();

vi.mock("@/services/api", () => ({
  sendPostRequest: (...args: any[]) => mockSendPostRequest(...args),
  TOKEN_KEY: "auth_token",
  USER_KEY: "user_data",
}));

// ── Mock useAuth ──────────────────────────────────────────────────────────────

const mockAuthValue = {
  user: { id: "user-1", email: "test@example.com", userRole: 1 },
  userInfo: { id: "user-1", firstName: "Test", lastName: "User", username: "testuser" },
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuthValue,
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => mockAuthValue,
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

// ── Mock useLanguage ──────────────────────────────────────────────────────────

vi.mock("@/components/languages/languageProvider", () => ({
  useLanguage: () => ({
    t: {
      settings: { loading: "Loading...", saveChanges: "Save Changes" },
      journal: { categoryAll: "All" },
      readingPlan: { day: "Day" },
      common: { loading: "Loading...", error: "Error" },
    },
    lang: "en",
    setLanguage: vi.fn(),
    isLoading: false,
    isRtl: false,
  }),
  LanguageProvider: ({ children }: { children: ReactNode }) => children,
}));

// ── Mock useRTL ───────────────────────────────────────────────────────────────

vi.mock("@/providers/RTLProvider", () => ({
  useRTL: () => ({ isRtl: false }),
  RTLProvider: ({ children }: { children: ReactNode }) => children,
}));

// ── Mock useToast ─────────────────────────────────────────────────────────────

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn(), dismiss: vi.fn() }),
}));

// ── Helper: create mock API response ──────────────────────────────────────────

export function createMockResponse(data: any, returnCode = 200) {
  return { returnCode, returnData: data, returnMessage: "OK", success: true };
}

export function createMockError(message = "Error", returnCode = 500) {
  return { returnCode, returnData: null, returnMessage: message, success: false };
}

// ── Helper: reset all mocks ───────────────────────────────────────────────────

export function resetMocks() {
  mockSendPostRequest.mockReset();
}

// ── Re-export testing utilities ───────────────────────────────────────────────

export { renderHook, act } from "@testing-library/react";
export { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
