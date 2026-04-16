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
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

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
  isVerified: boolean; // ← email verification flag
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
const ROLE_FILTERS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
];
const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];
const VERIFIED_FILTERS = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
];
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const NONE = "__NONE__";
const DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 10;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const safeTrim = (v: any) => String(v ?? "").trim();
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
// Skeleton row
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
// Verification badge + toggle button
// ─────────────────────────────────────────────
interface VerifiedCellProps {
  user: User;
  onToggle: (user: User) => void;
  toggling: boolean;
  disabled?: boolean;
}

const VerifiedCell = ({ user, onToggle, toggling, disabled }: VerifiedCellProps) => (
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
          {user.isVerified ? "Verified" : "Unverified"}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {disabled
          ? "You cannot verify your own account"
          : user.isVerified
            ? "Click to revoke email verification"
            : "Click to manually verify this email"}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// ─────────────────────────────────────────────
// Pagination bar
// ─────────────────────────────────────────────
interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
}

const PaginationBar = ({
  page,
  pageSize,
  totalCount,
  totalPages,
  onPage,
  onPageSize,
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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border/40 bg-muted/10">
      <p className="text-sm text-muted-foreground shrink-0">
        {totalCount === 0 ? (
          "No results"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-foreground">
              {from}–{to}
            </span>{" "}
            of <span className="font-medium text-foreground">{totalCount}</span>{" "}
            users
          </>
        )}
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="hidden sm:inline shrink-0">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              onPageSize(Number(v));
              onPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-16 text-xs">
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

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPage(1)}
            disabled={page === 1}
            aria-label="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>

          {pageNums.map((p, i) => {
            const prev = pageNums[i - 1];
            const showEllipsis = prev && p - prev > 1;
            return (
              <div key={p} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-1 text-muted-foreground text-sm select-none">
                    …
                  </span>
                )}
                <Button
                  variant={p === page ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-xs",
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
            className="h-8 w-8"
            onClick={() => onPage(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPage(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
        </div>
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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  // Per-row verification toggle loading set (keyed by username)
  const [togglingVerified, setTogglingVerified] = useState<Set<string>>(
    new Set(),
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadUsers = useCallback(
    async (query: string, pg: number, pgSize: number) => {
      setLoading(true);
      try {
        const res: any = await sendPostRequest("admin", "get-users-by-admin", {
          search: query.trim() || null,
          page: pg,
          pageSize: pgSize,
        });
        if (res?.returnCode === 200 && res?.returnData) {
          const data = res.returnData;
          let rawUsers: any[] = [];
          if (Array.isArray(data)) {
            rawUsers = data;
          } else if (data?.users && Array.isArray(data.users)) {
            rawUsers = data.users;
          } else {
            console.warn("Unexpected user data format:", data);
            rawUsers = [];
          }
          const sanitizeDate = (val: any) => {
            if (!val) return "";
            if (typeof val === "string") return val;
            if (val instanceof Date) return val.toISOString();
            if (typeof val === "object" && val.toISOString) {
              try { return val.toISOString(); } catch { return ""; }
            }
            return "";
          };

          const safeString = (val: any, fallback = "") => {
            if (val === null || val === undefined) return fallback;
            if (typeof val === "string") return val;
            if (typeof val === "number") return String(val);
            return fallback;
          };

          const usersWithVerified = rawUsers.map((u: any) => ({
            ...u,
            isVerified: u.emailVerified ?? false,
            createdOn: safeString(u.createdOn),
            updatedOn: safeString(u.updatedOn),
            lastLogin: safeString(u.lastLogin),
            roleName: u.userRole === 1n || u.userRole === 1 ? "admin" : "user",
            roleId: u.userRole === 1n || u.userRole === 1 ? 1 : 2,
          }));
          setUsers(usersWithVerified);
          setTotalCount(data?.totalCount ?? rawUsers.length);
          setTotalPages(data?.totalPages ?? Math.ceil(rawUsers.length / pageSize));
        } else {
          toast({
            title: "Failed to load users",
            description: res?.returnMessage ?? "Unknown error",
            variant: "destructive",
          });
          setUsers([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (e: any) {
        toast({
          title: "Network error",
          description: e?.message ?? "Unknown error",
          variant: "destructive",
        });
        setUsers([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [toast],
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

  // ── Search & pagination handlers ───────────────────────────────────────────
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
  const totalAdmins = users.filter((u) => u.roleName === "admin").length;
  const totalActive = users.filter((u) => !!u.status).length;
  const totalMembers = users.filter((u) => u.roleName === "user").length;
  const totalVerified = users.filter((u) => !!u.isVerified).length;

  const stats = useMemo(
    () => [
      {
        label: "Total Users",
        value: totalCount,
        icon: Users,
        color: "bg-primary/10 text-primary",
      },
      {
        label: "Admins",
        value: totalAdmins,
        icon: ShieldCheck,
        color: "bg-violet-500/10 text-violet-600",
      },
      {
        label: "Members",
        value: totalMembers,
        icon: Shield,
        color: "bg-sky-500/10 text-sky-600",
      },
      {
        label: "Active",
        value: totalActive,
        icon: UserCheck,
        color: "bg-emerald-500/10 text-emerald-600",
      },
    ],
    [totalCount, totalAdmins, totalMembers, totalActive],
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
      toast({ title: "Username does not match", variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      const res: any = await sendPostRequest("admin", "delete-user", {
        username: deleteTarget.username,
      });
      if (res?.returnCode === 200) {
        toast({
          title: "User deleted",
          description: `${deleteTarget.firstName} ${deleteTarget.lastName} has been removed.`,
        });
        setDeleteTarget(null);
        loadUsers(searchQuery, page, pageSize);
      } else {
        toast({
          title: "Delete failed",
          description: res?.returnMessage ?? "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e?.message ?? "Unknown error",
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
        title: "First and last name are required",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res: any = await sendPostRequest("admin", "update-user", {
        username: editTarget.username,
        ...editForm,
      });
      if (res?.returnCode === 200) {
        toast({
          title: "User updated",
          description: `${editForm.firstName} ${editForm.lastName} has been updated.`,
        });
        setEditTarget(null);
        loadUsers(searchQuery, page, pageSize);
      } else {
        toast({
          title: "Update failed",
          description: res?.returnMessage ?? "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active status ───────────────────────────────────────────────────
  const toggleStatus = async (user: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.username === user.username ? { ...u, status: !u.status } : u,
      ),
    );
    try {
      const res: any = await sendPostRequest("admin", "toggle-user-status", {
        username: user.username,
        status: !user.status,
        email: user.email.trim(),
      });
      if (res?.returnCode === 200) {
        toast({
          title: user.status ? "User deactivated" : "User activated",
          description: `${user.firstName} ${user.lastName} is now ${user.status ? "inactive" : "active"}.`,
        });
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.username === user.username ? { ...u, status: user.status } : u,
          ),
        );
        toast({
          title: "Failed to update status",
          description: res?.returnMessage ?? "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username ? { ...u, status: user.status } : u,
        ),
      );
      toast({
        title: "Network error",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    }
  };

  // ── Toggle email verification ──────────────────────────────────────────────
  const toggleVerified = async (user: User) => {
    setTogglingVerified((prev) => new Set(prev).add(user.username));

    // Optimistic update
    const next = !user.isVerified;
    setUsers((prev) =>
      prev.map((u) =>
        u.username === user.username ? { ...u, isVerified: next } : u,
      ),
    );

    try {
      const res: any = await sendPostRequest(
        "admin",
        "toggle-user-verification",
        {
          username: user.username,
          isVerified: next,
        },
      );
      if (res?.returnCode === 200) {
        toast({
          title: next ? "Email verified" : "Verification revoked",
          description: next
            ? `${user.firstName} ${user.lastName}'s email has been manually verified.`
            : `${user.firstName} ${user.lastName}'s verification has been revoked.`,
        });
      } else {
        // Revert on failure
        setUsers((prev) =>
          prev.map((u) =>
            u.username === user.username
              ? { ...u, isVerified: user.isVerified }
              : u,
          ),
        );
        toast({
          title: "Failed to update verification",
          description: res?.returnMessage ?? "Unknown error",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      setUsers((prev) =>
        prev.map((u) =>
          u.username === user.username
            ? { ...u, isVerified: user.isVerified }
            : u,
        ),
      );
      toast({
        title: "Network error",
        description: e?.message ?? "Unknown error",
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
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="opacity-0 fade-up">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage accounts, roles, and access
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-0 fade-up stagger-1">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-5">
              {loading ? (
                <>
                  {" "}
                  <Skeleton className="w-10 h-10 rounded-lg mb-3" />{" "}
                  <Skeleton className="h-7 w-12 rounded mb-1.5" />{" "}
                  <Skeleton className="h-3.5 w-20 rounded" />{" "}
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                      s.color,
                    )}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold font-[family-name:var(--font-heading)]">
                    {s.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Card */}
      <Card className="opacity-0 fade-up stagger-2 border-border/50">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> All Users
              </CardTitle>
              <CardDescription>
                {loading ? (
                  <Skeleton className="h-3.5 w-40 rounded mt-1 inline-block" />
                ) : (
                  <>
                    <span className="font-medium text-foreground">
                      {totalCount}
                    </span>{" "}
                    total user{totalCount !== 1 ? "s" : ""}
                    {" · "}
                    <span className="text-emerald-600 font-medium">
                      {totalVerified} verified
                    </span>
                    {searchQuery && (
                      <span className="ml-2 text-primary font-medium">
                        · matching "{searchQuery}"
                      </span>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {/* Search */}
            <div className="relative flex-1">
              {loading && searchInput ? (
                <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
              <Input
                placeholder="Search by name, email or username…"
                value={searchInput}
                onChange={handleSearchChange}
                className="pl-9 pr-9"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Role filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_FILTERS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Verification filter */}
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <BadgeCheck className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VERIFIED_FILTERS.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-[220px]">User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                        <p className="font-medium">No users found</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery
                            ? `No results for "${searchQuery}".`
                            : "Try adjusting your filters."}
                        </p>
                        {(searchQuery ||
                          roleFilter !== "all" ||
                          statusFilter !== "all" ||
                          verifiedFilter !== "all") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-3 text-primary"
                            onClick={() => {
                              clearSearch();
                              setRoleFilter("all");
                              setStatusFilter("all");
                              setVerifiedFilter("all");
                            }}
                          >
                            Clear all filters
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
                          <Avatar className="w-9 h-9">
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
                              {user.firstName}{" "}
                              {user.middleName ? user.middleName + " " : ""}
                              {user.lastName}
                            </p>
                            <div className="space-y-0.5">
                              <p className="text-[11px] text-muted-foreground/80 font-mono truncate">
                               { `ID-> ${user.id}` }
                              </p>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{user.phoneNumber}</span>
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
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {user.createdOn ? new Date(user.createdOn).toLocaleDateString() : "—"}
                        </div>
                      </TableCell>

                      {/* Email Verified — clickable toggle */}
                      <TableCell>
                        <VerifiedCell
                          user={user}
                          onToggle={toggleVerified}
                          toggling={togglingVerified.has(user.username)}
                          disabled={user.username === currentUsername}
                        />
                      </TableCell>

                      {/* Active status */}
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
                            {user.status ? "Active" : "Inactive"}
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

          {!loading && totalCount > 0 && (
            <PaginationBar
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
              onPage={handlePageChange}
              onPageSize={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {/* ══ DELETE DIALOG ══════════════════════════════════════════════════════ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Delete User
            </DialogTitle>
            <DialogDescription>
              This permanently removes the account and all associated activity.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 p-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback
                    className={cn(
                      "text-white text-sm font-semibold",
                      avatarColor(deleteTarget.username),
                    )}
                  >
                    {getInitials(deleteTarget.firstName, deleteTarget.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {deleteTarget.firstName} {deleteTarget.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    @{deleteTarget.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deleteTarget.email}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Type{" "}
                  <span className="font-mono font-bold">
                    {deleteTarget.username}
                  </span>{" "}
                  to confirm
                </Label>
                <Input
                  placeholder="Type username here…"
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
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleting || deleteConfirmText !== deleteTarget?.username
              }
              onClick={confirmDelete}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete User
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit User
            </DialogTitle>
            <DialogDescription>
              Update user details. Username cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {editTarget && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Username (read-only)
                </Label>
                <Input
                  value={editTarget.username}
                  readOnly
                  className="bg-muted/40 text-muted-foreground font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.firstName ?? ""}
                    onChange={(e) =>
                      updateField("firstName", e.target.value as any)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={editForm.lastName ?? ""}
                    onChange={(e) =>
                      updateField("lastName", e.target.value as any)
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Middle Name</Label>
                <Input
                  value={editForm.middleName ?? ""}
                  onChange={(e) =>
                    updateField("middleName", e.target.value as any)
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Email (read-only)
                  </Label>
                  <Input
                    type="email"
                    value={editForm.email ?? ""}
                    readOnly
                    className="bg-muted/40 text-muted-foreground font-mono text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    value={editForm.phoneNumber ?? ""}
                    onChange={(e) =>
                      updateField("phoneNumber", e.target.value as any)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select
                    value={(editForm.gender ?? NONE) as string}
                    onValueChange={(v) =>
                      updateField(
                        "gender",
                        (v === NONE ? "Not Specified" : v) as any,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— Not set —</SelectItem>
                      {["Male", "Female", "Not Specified"].map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Marital Status</Label>
                  <Select
                    value={(editForm.maritalStatus ?? NONE) as string}
                    onValueChange={(v) =>
                      updateField(
                        "maritalStatus",
                        (v === NONE ? null : v) as any,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— Not set —</SelectItem>
                      {["Single", "Married", "Divorced", "Widowed"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={(editForm.roleName ?? "user") as string}
                  onValueChange={(v) => {
                    updateField("roleName", v as any);
                    updateField("roleId", (v === "admin" ? 1 : 2) as any);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
                <div>
                  <p className="text-sm font-medium">Account Active</p>
                  <p className="text-xs text-muted-foreground">
                    Allow this user to log in
                  </p>
                </div>
                <Switch
                  checked={editForm.status ?? true}
                  onCheckedChange={(v) => updateField("status", v as any)}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditTarget(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={
                saving ||
                !safeTrim(editForm.firstName) ||
                !safeTrim(editForm.lastName)
              }
              className="gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
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
