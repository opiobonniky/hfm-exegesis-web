// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin";
  isVerified: boolean;
  createdAt: string;
}
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
export interface LoginCredentials {
  password: string;
export interface RegisterData {
  confirmPassword: string;
export interface GoogleAuthData {
  credential: string;
  clientId: string;
