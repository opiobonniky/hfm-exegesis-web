// ─── User Management Types ─────────────────────────────────────────────────────

export interface RawUser {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  username: string;
  gender: string;
  status: boolean;
  emailVerified: boolean;
  userRole?: number;
  accountStatus: string;
  subscriptionTier: string;
  profilePhotoUrl?: string;
  createdOn: string;
  lastLogin?: string;
  loginCount?: number;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: "user" | "admin" | "superadmin";
  isVerified: boolean;
  isActive: boolean;
  subscription?: string;
  lastActive?: string;
  createdAt: string;
  username?: string;
}

export interface UsersResponse {
  users: RawUser[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  content: T[];
  currentPage: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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
  };
}
