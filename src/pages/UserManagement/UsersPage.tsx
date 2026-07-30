"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Shield,
  ShieldCheck,
  UserX,
  UserCheck,
  Loader2,
  Trash2,
  Edit2,
  Save,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  Filter,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BadgeCheck,
  BadgeX,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  email: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  createdOn: string;
  roleId: number;
  roleName: string;
  maritalStatus: string | null;
  status: boolean;
  isVerified: boolean;
}

interface PagedResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const NONE = "__NONE__";
const DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 10;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const safeTrim = (v: unknown) => String(v ?? "").trim();
const getInitials = (f: string, l: string) =>
  `${f?.charAt(0) ?? "?"}${l?.charAt(0) ?? "?"}`.toUpperCase();

const roleStyle = (role: string) =>
  role === "admin"
    ? "bg-violet-100 text-violet-700 border-violet-200"
    : "bg-sky-100 text-sky-700 border-sky-200";

const avatarColor = (username: string) => {
  const p = [
    "bg-violet-500",
    "bg-sky-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  let h = 0;
  for (let i = 0; i < username.length; i++) h += username.charCodeAt(i);
  return p[h % p.length];
};

// ─────────────────────────────────────────────
// Skeleton — table row (desktop)
// ─────────────────────────────────────────────
const SkeletonRow = () => (
  <TableRow className="border-border/40">
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-36 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-16 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-3 w-24 rounded" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </TableCell>
  </TableRow>
);

// ─────────────────────────────────────────────
// Skeleton — mobile card
// ─────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="p-4 border border-border/40 rounded-xl space-y-3 bg-card">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-3/4 rounded" />
    </div>
    <div className="flex gap-2 pt-1">
      <Skeleton className="h-7 w-20 rounded-full" />
      <Skeleton className="h-7 w-20 rounded-full" />
    </div>
    <div className="flex justify-end gap-2 pt-1 border-t border-border/40">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Verified badge + toggle
// ─────────────────────────────────────────────
interface VerifiedCellProps {
  user: User;
  onToggle: (user: User) => void;
  toggling: boolean;
  disabled?: boolean;
  compact?: boolean;
  t: any;
}

const VerifiedCell = ({
  user,
  onToggle,
  toggling,
  disabled,
  compact,
  t,
}: VerifiedCellProps) => (
  <TooltipProvider delayDuration={200}>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onToggle(user)}
          disabled={toggling || disabled}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            user.isVerified
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
            (toggling || disabled) && "opacity-50 cursor-not-allowed",
          )}
        >
          {toggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : user.isVerified ? (
            <BadgeCheck className="w-3.5 h-3.5" />
          ) : (
            <BadgeX className="w-3.5 h-3.5" />
          )}
          {!compact && (user.isVerified ? t.userManagement.verified : t.userManagement.unverified)}
          {compact && (user.isVerified ? t.userManagement.verified : t.userManagement.unverified)}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {disabled
          ? t.userManagement.cannotVerifySelf
          : user.isVerified
            ? t.userManagement.clickToRevoke
            : t.userManagement.clickToVerify}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ─────────────────────────────────────────────
// Mobile user card
// ─────────────────────────────────────────────
interface UserCardProps {
  user: User;
  currentUsername: string | undefined;
  toggling: boolean;
  onToggleVerified: (u: User) => void;
  onToggleStatus: (u: User) => void;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  t: any;
}

const UserCard = ({
  user,
  currentUsername,
  toggling,
  onToggleVerified,
  onToggleStatus,
  onEdit,
  onDelete,
  t,
}: UserCardProps) => {
  const isSelf = user.username === currentUsername;
  return (
    <div className="p-4 border border-border/40 rounded-xl bg-card hover:bg-muted/10 transition-colors space-y-3">
      {/* Top row: avatar + name + role badge */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback
            className={cn(
              "text-white text-xs font-semibold",
              avatarColor(user.username),
            )}
          >
            {getInitials(user.firstName, user.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm leading-tight truncate">
              {user.firstName} {user.middleName ? user.middleName + " " : ""}
              {user.lastName}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">
            ID→ {user.id}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-medium capitalize shrink-0",
            roleStyle(user.roleName),
          )}
        >
          {user.roleName === "admin" ? (
            <ShieldCheck className="w-3 h-3 mr-1" />
          ) : (
            <Shield className="w-3 h-3 mr-1" />
          )}
          {user.roleName}
        </Badge>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
          <span>{user.phoneNumber || "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/60" />
          <span>
            {user.createdOn
              ? new Date(user.createdOn).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>

      {/* Status row */}
      <div className="flex items-center gap-2 flex-wrap">
        <VerifiedCell
          user={user}
          onToggle={onToggleVerified}
          toggling={toggling}
          disabled={isSelf}
          t={t}
        />
        {/* Active toggle inline */}
        <button
          onClick={() => !isSelf && onToggleStatus(user)}
          disabled={isSelf}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border transition-all",
            user.status
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/70",
            isSelf && "opacity-50 cursor-not-allowed",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              user.status ? "bg-emerald-500" : "bg-muted-foreground",
            )}
          />
          {user.status ? t.common.active : t.common.inactive}
        </button>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary disabled:opacity-40"
          disabled={isSelf}
          onClick={() => onEdit(user)}
        >
          <Edit2 className="w-3.5 h-3.5" />
          {t.userManagement.edit}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-destructive disabled:opacity-40"
          disabled={isSelf}
          onClick={() => onDelete(user)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t.userManagement.delete}
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Pagination bar (responsive)
// ─────────────────────────────────────────────
interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  t: any;
}

const PaginationBar = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPage,
  onPageSize,
  t,
}: PaginationProps) => {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pageNums = useMemo(() => {
    const s = new Set<number>();
    s.add(1);
    s.add(totalPages);
    for (
      let i = Math.max(1, page - 1);
      i <= Math.min(totalPages, page + 1);
      i++
    )
      s.add(i);
    return [...s].sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div className="flex flex-col gap-3 px-4 py-3 border-t border-border/40 bg-muted/10 sm:flex-row sm:items-center sm:justify-between">
      {/* Info + page size */}
      <div className="flex items-center justify-between sm:justify-start gap-4">
        <p className="text-xs text-muted-foreground">
          {totalCount === 0 ? (
            t.common.noResults
          ) : (
            <>
              <span className="font-medium text-foreground">
                {from}–{to}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalCount}</span>
            </>
          )}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{t.userManagement.rowsLabel}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSize(Number(v));
              onPage(1);
            }}
          >
            <SelectTrigger className="h-7 w-14 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)} className="text-xs">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Page buttons */}
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPage(1)}
          disabled={page === 1}
          aria-label={t.userManagement.tableUser}
        >
          <ChevronsLeft className="w-3 h-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label={t.userManagement.clearSearch}
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>

        {pageNums.map((p, i) => {
          const prev = pageNums[i - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <div key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-muted-foreground text-xs select-none">
                  …
                </span>
              )}
              <Button
                variant={p === page ? "default" : "outline"}
                size="icon"
                className={cn(
                  "h-7 w-7 text-xs",
                  p === page && "pointer-events-none",
                )}
                onClick={() => onPage(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </Button>
            </div>
          );
        })}

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label={t.userManagement.clearAllFilters}
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
          aria-label={t.userManagement.clearAll}
        >
          <ChevronsRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const UsersPage = () => {
  const { toast } = useToast();
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const currentUsername = userInfo?.username;

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  const [togglingVerified, setTogglingVerified] = useState<Set<string>>(
    new Set(),
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active filter count for badge
  const activeFilterCount = [
    roleFilter !== "all",
    statusFilter !== "all",
    verifiedFilter !== "all",
  ].filter(Boolean).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadUsers = useCallback(
    async (query: string, pg: number, pgSize: number) => {
      setLoading(true);
      try {
        const res = await sendPostRequest("admin", "get-users-by-admin", {
          search: query.trim() || null,
          page: pg,
          pageSize: pgSize,
        });
        if (res?.returnCode === 200 && res?.returnData) {
          const data = res.returnData;
          let rawUsers: any[] = [];
          if (Array.isArray(data)) rawUsers = data;
          else if (data?.users && Array.isArray(data.users))
            rawUsers = data.users;
          else rawUsers = [];

          const sanitizeDate = (val: unknown) => {
            if (!val) return "";
            if (typeof val === "string") return val;
            if (val instanceof Date) return val.toISOString();
            if (typeof val === "object" && (val as Record<string, unknown>).toISOString) {
              try {
                return (val as Date).toISOString();
              } catch {
                return "";
              }
            }
            return "";
          };
          const safeString = (val: unknown, fallback = "") => {
            if (val === null || val === undefined) return fallback;
            if (typeof val === "string") return val;
            if (typeof val === "number") return String(val);
            return fallback;
          };

          const usersWithVerified = rawUsers.map((u: Record<string, unknown>) => ({
            ...u,
            isVerified: u.emailVerified ?? false,
            createdOn: safeString(u.createdOn),
            updatedOn: safeString(u.updatedOn),
            lastLogin: safeString(u.lastLogin),
            roleName: u.userRole === 1n || u.userRole === 1 ? "admin" : "user",
            roleId: u.userRole === 1n || u.userRole === 1 ? 1 : 2,
          }));
          setUsers(usersWithVerified as unknown as User[]);
          setTotalCount(data?.totalCount ?? rawUsers.length);
          setTotalPages(
            data?.totalPages ?? Math.ceil(rawUsers.length / pageSize),
          );
        } else {
          toast({
            title: t.userManagement.failedToLoadUsers,
            description: res?.returnMessage ?? t.userManagement.unknownError,
            variant: "destructive",
          });
          setUsers([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (e) {
        toast({
          title: t.userManagement.networkError,
          description: (e as Error)?.message ?? t.userManagement.unknownError,
          variant: "destructive",
        });
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [toast, t],
  );

  useEffect(() => {
    loadUsers("", 1, DEFAULT_PAGE_SIZE);
  }, [loadUsers]);
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  // ── Search & pagination ────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchInput(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(v);
      setPage(1);
      loadUsers(v, 1, pageSize);
    }, DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
    loadUsers("", 1, pageSize);
  };

  const clearAllFilters = () => {
    clearSearch();
    setRoleFilter("all");
    setStatusFilter("all");
    setVerifiedFilter("all");
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    loadUsers(searchQuery, p, pageSize);
  };
  const handlePageSizeChange = (s: number) => {
    setPageSize(s);
    setPage(1);
    loadUsers(searchQuery, 1, s);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalActive = users.filter((u) => !!u.status).length;
  const totalMembers = users.filter((u) => u.roleName === "user").length;
  const totalVerified = users.filter((u) => !!u.isVerified).length;
  const tTotalUsers = t.dashboard.totalUsers;
  const tAdmins = t.dashboard.admins;
  const tMembers = t.dashboard.members;
  const tActive = t.common.active;
  const totalAdmins = users.filter((u) => u.roleName === "admin").length;

  const stats = useMemo(
    () => [
      {
        label: tTotalUsers,
        value: totalCount,
        icon: Users,
        color: "bg-primary/10 text-primary",
      },
      {
        label: tAdmins,
        value: totalAdmins,
        icon: ShieldCheck,
        color: "bg-violet-500/10 text-violet-600",
      },
      {
        label: tMembers,
        value: totalMembers,
        icon: Shield,
        color: "bg-sky-500/10 text-sky-600",
      },
      {
        label: tActive,
        value: totalActive,
        icon: UserCheck,
        color: "bg-emerald-500/10 text-emerald-600",
      },
    ],
    [totalCount, totalAdmins, totalMembers, totalActive, tTotalUsers, tAdmins, tMembers, tActive],
  );

  // ── Client-side filters ────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchRole = roleFilter === "all" || u.roleName === roleFilter;
        const matchStatus =
          statusFilter === "all" ||
          (statusFilter === "active" ? !!u.status : !u.status);
        const matchVerified =
          verifiedFilter === "all" ||
          (verifiedFilter === "verified" ? !!u.isVerified : !u.isVerified);
        return matchRole && matchStatus && matchVerified;
      }),
    [users, roleFilter, statusFilter, verifiedFilter],
  );

  // ── Delete ─────────────────────────────────────────────────────────────────
  const openDelete = (user: User) => {
    setDeleteTarget(user);
    setDeleteConfirmText("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleteConfirmText !== deleteTarget.username) {
      toast({ title: t.userManagement.usernameMismatch, variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-user", {
        username: deleteTarget.username,
      });
      if (res?.returnCode === 200) {
        toast({
          title: t.userManagement.userDeleted,
          description: t.userManagement.userDeletedDesc.replace('{firstName}', deleteTarget.firstName).replace('{lastName}', deleteTarget.lastName),
        });
        setDeleteTarget(null);
        loadUsers(searchQuery, page, pageSize);
      } else {
        toast({
          title: t.userManagement.deleteFailed,
          description: res?.returnMessage ?? t.userManagement.unknownError,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: t.userManagement.networkError,
        description: (e as Error)?.message ?? t.userManagement.unknownError,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────────
  const openEdit = (user: User) => {
    setEditTarget(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      maritalStatus: user.maritalStatus,
      roleId: user.roleId,
      roleName: user.roleName,
      status: user.status,
    });
  };

  const updateField = <K extends keyof User>(key: K, val: User[K]) =>
    setEditForm((prev) => ({ ...prev, [key]: val }));

  const confirmEdit = async () => {
    if (!editTarget) return;
    if (!safeTrim(editForm.firstName) || !safeTrim(editForm.lastName)) {
      toast({
        title: t.userManagement.nameRequired,
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await sendPostRequest("admin", "update-user", {
        username: editTarget.username,
        ...editForm,
      });
      if (res?.returnCode === 200) {
        toast({
          title: t.userManagement.userUpdated,
          description: t.userManagement.userUpdatedDesc.replace('{firstName}', editForm.firstName ?? '').replace('{lastName}', editForm.lastName ?? ''),
        });
        setEditTarget(null);
        loadUsers(searchQuery, page, pageSize);
      } else {
        toast({
          title: t.userManagement.updateFailed,
          description: res?.returnMessage ?? t.userManagement.unknownError,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({                      title: t.userManagement.networkError,
        description: e?.message ?? t.userManagement.unknownError,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleStatus = async (user: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username === user.username ? { ...u, status: !u.status } : u,
      ),
    );
    try {
      const res = await sendPostRequest("admin", "toggle-user-status", {
        username: user.username,
        status: !user.status,
        email: user.email.trim(),
      });
      if (res?.returnCode === 200) {
        toast({
          title: user.status ? t.userManagement.userDeactivated : t.userManagement.userActivated,
          description: (user.status ? t.userManagement.statusInactiveDesc : t.userManagement.statusActiveDesc)
            .replace('{firstName}', user.firstName)
            .replace('{lastName}', user.lastName),
        });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.username === user.username ? { ...u, status: user.status } : u,
          ),
        );
        toast({
          title: t.userManagement.failedToUpdateStatus,
          description: res?.returnMessage ?? t.userManagement.unknownError,
          variant: "destructive",
        });
      }
    } catch (e) {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username ? { ...u, status: user.status } : u,
        ),
      );
      toast({
        title: t.userManagement.networkError,
        description: (e as Error)?.message ?? t.userManagement.unknownError,
        variant: "destructive",
      });
    }
  };

  // ── Toggle verified ────────────────────────────────────────────────────────
  const toggleVerified = async (user: User) => {
    setTogglingVerified((prev) => new Set(prev).add(user.username));
    const next = !user.isVerified;
    setUsers((prev) =>
      prev.map((u) =>
        u.username === user.username ? { ...u, isVerified: next } : u,
      ),
    );
    try {
      const res = await sendPostRequest(
        "admin",
        "toggle-user-verification",
        { username: user.username, isVerified: next },
      );
      if (res?.returnCode === 200) {
        toast({
          title: next ? t.userManagement.emailVerifiedTitle : t.userManagement.verificationRevokedTitle,
          description: (next ? t.userManagement.emailVerifiedDesc : t.userManagement.verificationRevokedDesc)
            .replace('{firstName}', user.firstName)
            .replace('{lastName}', user.lastName),
        });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.username === user.username
              ? { ...u, isVerified: user.isVerified }
              : u,
          ),
        );
        toast({
          title: t.userManagement.failedToUpdateVerification,
          description: res?.returnMessage ?? t.userManagement.unknownError,
          variant: "destructive",
        });
      }
    } catch (e) {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username
            ? { ...u, isVerified: user.isVerified }
            : u,
        ),
      );
      toast({
        title: t.userManagement.networkError,
        description: (e as Error)?.message ?? t.userManagement.unknownError,
        variant: "destructive",
      });
    } finally {
      setTogglingVerified((prev) => {
        const s = new Set(prev);
        s.delete(user.username);
        return s;
      });
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="opacity-0 fade-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
              {t.userManagement.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t.userManagement.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {/* 2-col on mobile, 4-col on lg+ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 opacity-0 fade-up stagger-1">
        {stats.map((s, idx) => (
          <Card key={idx} className="border-border/50">
            <CardContent className="p-4 sm:p-5">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="w-9 h-9 rounded-lg" />
                  <Skeleton className="h-6 w-12 rounded mt-2" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center",
                      s.color,
                    )}
                  >
                    <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">
                      {s.value}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Table Card ─────────────────────────────────────────────────────── */}
      <Card className="opacity-0 fade-up stagger-2 border-border/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-0">
          {/* Title row */}
          <div className="flex flex-col gap-1 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t.userManagement.allUsers}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm mt-0.5">
                {loading ? (
                  <Skeleton className="h-3.5 w-40 rounded inline-block" />
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {totalCount}
                    </span>{" "}
                    {totalCount === 1 ? t.userManagement.user : t.userManagement.users}
                    {" · "}
                    <span className="text-emerald-600 font-medium">
                      {totalVerified} {t.dashboard.verifiedLabel}
                    </span>
                    {searchQuery && (
                      <span className={cn("text-primary font-medium", isRtl ? "mr-1.5" : "ml-1.5")}>
                        · "{searchQuery}"
                      </span>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
          </div>

          {/* ── Search + filter toggle ──────────────────────────────────────── */}
          <div className="space-y-2 pb-3">
            <div className="flex gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                {loading && searchInput ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                )}
                <Input
                  placeholder={t.userManagement.searchUsers}
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-9 pr-9 h-9 text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t.userManagement.clearSearch}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter toggle button — always visible */}
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 gap-1.5 shrink-0 sm:hidden",
                  filtersOpen && "bg-muted",
                )}
                onClick={() => setFiltersOpen((v) => !v)}
                aria-label={t.userManagement.toggleFilters}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {activeFilterCount > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Desktop: always-visible filter selects */}
              <div className="hidden sm:flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                  <SelectItem value="all">{t.userManagement.filterAllRoles}</SelectItem>
                    <SelectItem value="admin">{t.common.admin}</SelectItem>
                    <SelectItem value="user">{t.common.user}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.userManagement.filterAllStatus}</SelectItem>
                    <SelectItem value="active">{t.common.active}</SelectItem>
                    <SelectItem value="inactive">{t.common.inactive}</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={verifiedFilter}
                  onValueChange={setVerifiedFilter}
                >
                  <SelectTrigger className="h-9 w-32 text-sm">
                    <BadgeCheck className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.userManagement.filterAll}</SelectItem>
                    <SelectItem value="verified">{t.userManagement.filterVerified}</SelectItem>
                    <SelectItem value="unverified">{t.userManagement.filterUnverified}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>              {/* Mobile collapsible filter panel */}
              {filtersOpen && (
                <div className="sm:hidden grid grid-cols-3 gap-2 pt-1">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t.userManagement.role} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t.userManagement.filterAllRoles}</SelectItem>
                      <SelectItem value="admin" className="text-xs">{t.common.admin}</SelectItem>
                      <SelectItem value="user" className="text-xs">{t.common.user}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t.common.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t.userManagement.filterAllStatus}</SelectItem>
                      <SelectItem value="active" className="text-xs">{t.common.active}</SelectItem>
                      <SelectItem value="inactive" className="text-xs">{t.common.inactive}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={verifiedFilter}
                    onValueChange={setVerifiedFilter}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={t.userManagement.tableVerified} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">{t.userManagement.filterAll}</SelectItem>
                      <SelectItem value="verified" className="text-xs">{t.userManagement.filterVerified}</SelectItem>
                      <SelectItem value="unverified" className="text-xs">{t.userManagement.filterUnverified}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {roleFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs border border-border/50">
                    {t.userManagement.role}: {roleFilter}
                    <button
                      onClick={() => setRoleFilter("all")}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs border border-border/50">
                    {statusFilter}
                    <button
                      onClick={() => setStatusFilter("all")}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {verifiedFilter !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs border border-border/50">
                    {verifiedFilter}
                    <button
                      onClick={() => setVerifiedFilter("all")}
                      className="text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-primary hover:underline ml-1"
                >
                  {t.userManagement.clearAll}
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ── Mobile: card list (hidden on sm+) ──────────────────────────── */}
          <div className="sm:hidden">
            {loading ? (
              <div className="p-3 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <UserX className="w-10 h-10 mb-3 text-muted-foreground/40" />
                <p className="font-medium text-sm">{t.userManagement.noUsersFound}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {searchQuery
                    ? t.userManagement.noResultsFor.replace('{query}', searchQuery)
                    : t.userManagement.tryAdjustingFilters}
                </p>
                {(searchQuery || activeFilterCount > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 text-primary text-xs"
                    onClick={clearAllFilters}
                  >
                    {t.userManagement.clearAllFilters}
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {filtered.map((user) => (
                  <UserCard
                    key={user.username}
                    user={user}
                    currentUsername={currentUsername}
                    toggling={togglingVerified.has(user.username)}
                    onToggleVerified={toggleVerified}
                    onToggleStatus={toggleStatus}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    t={t}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Desktop: table (hidden below sm) ───────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[200px]">{t.userManagement.tableUser}</TableHead>
                  <TableHead>{t.userManagement.tableContact}</TableHead>
                  <TableHead>{t.userManagement.tableRole}</TableHead>
                  <TableHead>{t.userManagement.tableJoined}</TableHead>
                  <TableHead>{t.userManagement.tableVerified}</TableHead>
                  <TableHead>{t.userManagement.tableStatus}</TableHead>
                  <TableHead className="text-right">{t.userManagement.tableActions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <UserX className="w-12 h-12 mb-3 text-muted-foreground/40" />
                        <p className="font-medium">{t.userManagement.noUsersFound}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery
                            ? t.userManagement.noResultsFor.replace('{query}', searchQuery)
                            : t.userManagement.tryAdjustingFilters}
                        </p>
                        {(searchQuery || activeFilterCount > 0) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-primary"
                            onClick={clearAllFilters}
                          >
                            {t.userManagement.clearAllFilters}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow
                      key={user.username}
                      className="border-border/40 hover:bg-muted/20 transition-colors"
                    >
                      {/* User */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarFallback
                              className={cn(
                                "text-white text-xs font-semibold",
                                avatarColor(user.username),
                              )}
                            >
                              {getInitials(user.firstName, user.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {user.firstName}
                              {user.middleName
                                ? " " + user.middleName
                                : ""}{" "}
                              {user.lastName}
                            </p>
                            <p className="text-[11px] text-muted-foreground/80 font-mono truncate">
                              ID→ {user.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[160px]">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{user.phoneNumber || "—"}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium capitalize",
                            roleStyle(user.roleName),
                          )}
                        >
                          {user.roleName === "admin" ? (
                            <ShieldCheck className="w-3 h-3 mr-1" />
                          ) : (
                            <Shield className="w-3 h-3 mr-1" />
                          )}
                          {user.roleName}
                        </Badge>
                      </TableCell>

                      {/* Joined */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                          <Calendar className="w-3 h-3" />
                          {user.createdOn
                            ? new Date(user.createdOn).toLocaleDateString()
                            : "—"}
                        </div>
                      </TableCell>

                      {/* Verified */}
                      <TableCell>
                        <VerifiedCell
                          user={user}
                          onToggle={toggleVerified}
                          toggling={togglingVerified.has(user.username)}
                          disabled={user.username === currentUsername}
                          t={t}
                        />
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={user.status}
                            onCheckedChange={() => toggleStatus(user)}
                            disabled={user.username === currentUsername}
                            className="scale-90"
                          />
                          <span
                            className={cn(
                              "text-xs font-medium",
                              user.status
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                            )}
                          >
                            {user.status ? t.common.active : t.common.inactive}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={user.username === currentUsername}
                            onClick={() => openEdit(user)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={user.username === currentUsername}
                            onClick={() => openDelete(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && totalCount > 0 && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPage={handlePageChange}
              onPageSize={handlePageSizeChange}
              t={t}
            />
          )}
        </CardContent>
      </Card>

      {/* ══ DELETE DIALOG ══════════════════════════════════════════════════════ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md mx-4 sm:mx-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> {t.userManagement.deleteUserTitle}
            </DialogTitle>
            <DialogDescription>
              {t.userManagement.deleteUserDesc}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-white text-sm font-semibold",
                      avatarColor(deleteTarget.username),
                    )}
                  >
                    {getInitials(deleteTarget.firstName, deleteTarget.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {deleteTarget.firstName} {deleteTarget.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    @{deleteTarget.username}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {deleteTarget.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  {t.userManagement.typeToConfirm.replace('{username}', deleteTarget.username)}
                </Label>
                <Input                      placeholder={t.userManagement?.confirmDeletePlaceholder || 'Type username here…'}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className={cn(
                    deleteConfirmText &&
                      (deleteConfirmText === deleteTarget.username
                        ? "border-destructive ring-1 ring-destructive/30"
                        : "border-muted-foreground/40"),
                  )}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="w-full sm:w-auto"
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleting || deleteConfirmText !== deleteTarget?.username
              }
              onClick={confirmDelete}
              className="gap-2 w-full sm:w-auto"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.userManagement.deleting}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> {t.userManagement.deleteUserTitle}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT DIALOG ════════════════════════════════════════════════════════ */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent className="sm:max-w-lg mx-4 sm:mx-auto max-h-[90dvh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> {t.userManagement.editUserTitle}
            </DialogTitle>
            <DialogDescription>
              {t.userManagement.editUserDesc}
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  {t.userManagement.usernameReadOnly}
                </Label>
                <Input
                  value={editTarget.username}
                  readOnly
                  className="bg-muted/40 text-muted-foreground font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    {t.userManagement.firstName} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.firstName ?? ""}
                    onChange={(e) =>
                      updateField("firstName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {t.userManagement.lastName} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.lastName ?? ""}
                    onChange={(e) =>
                      updateField("lastName", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.userManagement.middleName}</Label>
                <Input
                  value={editForm.middleName ?? ""}
                  onChange={(e) =>
                    updateField("middleName", e.target.value)
                  }
                  placeholder={t.userManagement.optional}
                />
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {t.userManagement.emailReadOnly}
                  </Label>
                  <Input
                    type="email"
                    value={editForm.email ?? ""}
                    readOnly
                    className="bg-muted/40 text-muted-foreground font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.userManagement.phone}</Label>
                  <Input
                    value={editForm.phoneNumber ?? ""}
                    onChange={(e) =>
                      updateField("phoneNumber", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t.userManagement.gender}</Label>
                  <Select
                    value={(editForm.gender ?? NONE) as string}
                    onValueChange={(v) =>
                      updateField(
                        "gender",
                        v === NONE ? "Not Specified" : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.userManagement.select} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t.userManagement.notSet}</SelectItem>
                      {(["Male", "Female", "Not Specified"] as const).map((g) => (
                        <SelectItem key={g} value={g}>
                          {g === "Male" ? t.userManagement.genderMale : g === "Female" ? t.userManagement.genderFemale : t.userManagement.genderNotSpecified}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t.userManagement.maritalStatus}</Label>
                  <Select
                    value={(editForm.maritalStatus ?? NONE) as string}
                    onValueChange={(v) =>
                      updateField(
                        "maritalStatus",
                        v === NONE ? null : v,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.userManagement.select} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>{t.userManagement.notSet}</SelectItem>
                      {(["Single", "Married", "Divorced", "Widowed"] as const).map((m) => (
                        <SelectItem key={m} value={m}>
                          {m === "Single" ? t.userManagement.maritalSingle : m === "Married" ? t.userManagement.maritalMarried : m === "Divorced" ? t.userManagement.maritalDivorced : t.userManagement.maritalWidowed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.userManagement.role}</Label>
                <Select
                  value={(editForm.roleName ?? "user") as string}
                  onValueChange={(v) => {
                    updateField("roleName", v);
                    updateField("roleId", v === "admin" ? 1 : 2);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.userManagement.select} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t.common.admin}</SelectItem>
                    <SelectItem value="user">{t.common.user}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
                <div>
                  <p className="text-sm font-medium">{t.userManagement.accountActive}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.userManagement.allowLogin}
                  </p>
                </div>
                <Switch
                  checked={editForm.status ?? true}
                  onCheckedChange={(v) => updateField("status", v)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={saving}
              className="w-full sm:w-auto"
            >
              {t.common.cancel}
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={
                saving ||
                !safeTrim(editForm.firstName) ||
                !safeTrim(editForm.lastName)
              }
              className="gap-2 w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.userManagement.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {t.userManagement.saveChanges}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
