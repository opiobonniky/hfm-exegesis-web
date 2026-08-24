// ─── User Management Types ─────────────────────────────────────────────────────

/** Raw user object from backend SystemUser table */
export interface RawUser {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  username: string;
  gender: string;
  status: boolean;            // isActive
  emailVerified: boolean;     // isVerified
  userRole?: number;          // 1=admin, 2=user etc
  accountStatus: string;      // active | disabled | suspended
  subscriptionTier: string;   // free | legacy_sower | covenant_sower
  profilePhotoUrl?: string;
  createdOn: string;
  lastLogin?: string;
  loginCount?: number;
}
/** Mapped user for UI display */
export interface User {
  name: string;
  phone?: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin";
  isVerified: boolean;
  isActive: boolean;
  subscription?: string;
  lastActive?: string;
  createdAt: string;
/** Backend paginated response for users */
export interface UsersResponse {
  users: RawUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
export interface PagedResponse<T> {
  content: T[];
  currentPage: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
export interface UserFilters {
  search?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
/** Map raw backend user to UI User */
export function mapUser(raw: RawUser): User {
  const roleMap: Record<number, "user" | "admin" | "superadmin"> = {
    1: "admin",
    2: "user",
    3: "superadmin",
  };
  return {
    id: raw.id,
    name: [raw.firstName, raw.lastName].filter(Boolean).join(" ") || raw.username,
    email: raw.email,
    phone: raw.phoneNumber,
    profileImage: raw.profilePhotoUrl,
    role: roleMap[raw.userRole ?? 2] || "user",
    isVerified: raw.emailVerified,
    isActive: raw.status,
    subscription: raw.subscriptionTier,
    lastActive: raw.lastLogin,
    createdAt: raw.createdOn,
    username: raw.username,
