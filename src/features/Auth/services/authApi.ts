// Auth authApi — API endpoints for authApi operations
import { sendPostRequest } from "@/services/api";

export const authApi = {
  login: (email: string, password: string) =>
    sendPostRequest("auth", "login", { username: email, password }),
  register: (data: any) =>
    sendPostRequest("auth", "register", data),
  googleLogin: (credential: string, clientId: string) =>
    sendPostRequest("auth", "google-login", { credential, clientId }),
  forgotPassword: (email: string) =>
    sendPostRequest("auth", "forgot-password", { email }),
  verifyAccount: (code: string, email: string) =>
    sendPostRequest("auth", "verify-account", { code, email }),
  getCurrentUser: () =>
    sendPostRequest("auth", "get-current-user", {}),
  updateCurrentUser: (data: any) =>
    sendPostRequest("auth", "update-current-user", data),
  updatePassword: (data: any) =>
    sendPostRequest("auth", "update-password", data),
};
