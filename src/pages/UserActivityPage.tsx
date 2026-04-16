// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND: Updated React page
// File: UserActivityPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Search,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  LogIn,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Filter,
  X,
  MapPin,
  Wifi,
  Eye,
  EyeOff,
  Cpu,
  Languages,
  ShieldAlert,
  Clock3,
  User,
  Mail,
  Hash,
  Laptop2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";

interface ActivityRecord {
  id: number;
  userId: number;
  username: string;
  email?: string;
  ip: string;
  browserName: string;
  os: string;
  deviceType: string;
  deviceName: string;
  engine: string;
  locale: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  loggedInAt: string;
  loggedOutAt?: string | null;
  isOnline?: boolean;
  sessionDurationMs?: number | null;
  statusLabel?: string;
  hasUserAgent?: boolean;
  hasFailureReason?: boolean;
}

interface TopSummaryItem {
  label: string;
  count: number;
}

interface ActivitySummary {
  successCount: number;
  failedCount: number;
  onlineCount: number;
  topBrowsers?: TopSummaryItem[];
  topOperatingSystems?: TopSummaryItem[];
  topDeviceTypes?: TopSummaryItem[];
  topLocales?: TopSummaryItem[];
  topIps?: TopSummaryItem[];
}

interface PagedActivity {
  sessions: ActivityRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary?: ActivitySummary;
}

const SUCCESS_FILTERS = [
  { value: "all", label: "All Attempts" },
  { value: "success", label: "Successful" },
  { value: "failed", label: "Failed" },
];
const DEVICE_FILTERS = [
  { value: "all", label: "All Devices" },
  { value: "DESKTOP", label: "Desktop" },
  { value: "MOBILE", label: "Mobile" },
  { value: "TABLET", label: "Tablet" },
  { value: "BOT", label: "Bot" },
];
const SESSION_FILTERS = [
  { value: "all", label: "All Sessions" },
  { value: "online", label: "Online now" },
  { value: "ended", label: "Ended" },
];
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEBOUNCE_MS = 400;
const DEFAULT_PAGE_SIZE = 20;

const timeAgo = (ts: string | number | null | undefined) => {
  if (!ts) return "—";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "—";
  const m = Math.floor((Date.now() - date.getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const formatDate = (ts: string | number | null | undefined) => {
  if (!ts) return "—";
  const date = new Date(ts);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sessionDuration = (start: string | number | null | undefined, end?: string | number | null) => {
  if (!end) return null;
  const startDate = new Date(start as string);
  const endDate = new Date(end as string);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
  const m = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
  if (m < 1) return "< 1m";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const sessionDurationMsLabel = (ms: number | null | undefined) => {
  if (ms == null || isNaN(ms)) return "—";
  const m = Math.floor(ms / 60000);
  if (m < 1) return "< 1m";
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};

const avatarColor = (u: string) => {
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
  for (let i = 0; i < u.length; i++) h += u.charCodeAt(i);
  return p[h % p.length];
};

const DeviceIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  const t = (type ?? "").toUpperCase();
  if (t === "MOBILE") return <Smartphone className={className} />;
  if (t === "TABLET") return <Tablet className={className} />;
  if (t === "BOT") return <Globe className={className} />;
  return <Monitor className={className} />;
};

const DeviceBadge = ({ type }: { type: string }) => {
  const t = (type ?? "UNKNOWN").toUpperCase();
  const map: Record<string, string> = {
    DESKTOP: "bg-indigo-50 text-indigo-700 border-indigo-200",
    MOBILE: "bg-emerald-50 text-emerald-700 border-emerald-200",
    TABLET: "bg-amber-50 text-amber-700 border-amber-200",
    BOT: "bg-rose-50 text-rose-600 border-rose-200",
    UNKNOWN: "bg-stone-50 text-stone-500 border-stone-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide",
        map[t] ?? map.UNKNOWN,
      )}
    >
      <DeviceIcon type={t} className="w-3 h-3" />
      {t}
    </span>
  );
};

const SuccessBadge = ({
  success,
  reason,
}: {
  success: boolean;
  reason?: string;
}) =>
  success ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
      <CheckCircle2 className="w-3 h-3" /> Login
    </span>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded cursor-help">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        </TooltipTrigger>
        {reason && (
          <TooltipContent>
            <p className="text-xs">{reason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

const SessionBadge = ({ record }: { record: ActivityRecord }) => {
  if (!record.success) return null;
  if (record.loggedOutAt) {
    const dur = sessionDuration(record.loggedInAt, record.loggedOutAt);
    return (
      <div className="space-y-0.5">
        <span className="inline-flex items-center gap-1 text-[10px] text-stone-500 bg-stone-50 border border-stone-200 px-1.5 py-0.5 rounded font-medium">
          <LogOut className="w-2.5 h-2.5" />
          {dur ?? "ended"}
        </span>
        <p className="text-[10px] text-muted-foreground font-mono leading-tight">
          out {timeAgo(record.loggedOutAt)}
        </p>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
      Online
    </span>
  );
};

const SummaryChips = ({
  items,
  emptyLabel,
}: {
  items?: TopSummaryItem[];
  emptyLabel: string;
}) => {
  if (!items || items.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <Badge
          key={`${item.label}-${idx}`}
          variant="secondary"
          className="text-[11px]"
        >
          {item.label}: {item.count}
        </Badge>
      ))}
    </div>
  );
};

const SkeletonRow = () => (
  <TableRow className="border-border/40">
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-12" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-16 rounded" />
    </TableCell>
    <TableCell>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-20 rounded" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-12" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-16 rounded" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-28" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-3.5 w-28" />
    </TableCell>
    <TableCell>
      <div className="flex justify-end gap-1">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-7 rounded" />
      </div>
    </TableCell>
  </TableRow>
);

const ActivityDetailDialog = ({
  record,
  open,
  onClose,
}: {
  record: ActivityRecord | null;
  open: boolean;
  onClose: () => void;
}) => {
  const [showUA, setShowUA] = useState(false);
  if (!record) return null;

  const Row = ({
    label,
    value,
    mono = false,
    icon,
  }: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground font-medium w-32 shrink-0 pt-0.5 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "text-sm text-foreground flex-1 break-all",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold",
                avatarColor(record.username ?? ""),
              )}
            >
              {(record.username ?? "?")[0].toUpperCase()}
            </div>
            Session Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-0 mt-2">
          <Row
            label="Record ID"
            value={record.id ?? "—"}
            mono
            icon={<Hash className="w-3.5 h-3.5" />}
          />
          <Row
            label="User ID"
            value={record.userId ?? "—"}
            mono
            icon={<User className="w-3.5 h-3.5" />}
          />
          <Row
            label="Username"
            value={
              <span className="font-mono font-bold">
                @{record.username ?? "—"}
              </span>
            }
            icon={<User className="w-3.5 h-3.5" />}
          />
          <Row
            label="Email"
            value={record.email || "—"}
            icon={<Mail className="w-3.5 h-3.5" />}
          />
          <Row
            label="Status"
            value={
              <SuccessBadge
                success={record.success}
                reason={record.failureReason}
              />
            }
            icon={<ShieldAlert className="w-3.5 h-3.5" />}
          />
          {record.failureReason && (
            <Row
              label="Failure reason"
              value={record.failureReason}
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
            />
          )}
          <Row
            label="Logged in"
            value={formatDate(record.loggedInAt)}
            icon={<LogIn className="w-3.5 h-3.5" />}
          />
          <Row
            label="Logged out"
            value={
              record.loggedOutAt ? (
                formatDate(record.loggedOutAt)
              ) : (
                <SessionBadge record={record} />
              )
            }
            icon={<LogOut className="w-3.5 h-3.5" />}
          />
          <Row
            label="Duration"
            value={
              record.loggedOutAt
                ? (sessionDuration(record.loggedInAt, record.loggedOutAt) ??
                  "—")
                : "Active session"
            }
            icon={<Clock3 className="w-3.5 h-3.5" />}
          />
          <Row
            label="IP Address"
            value={record.ip || "—"}
            mono
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
          <Row
            label="Browser"
            value={record.browserName || "—"}
            icon={<Globe className="w-3.5 h-3.5" />}
          />
          <Row
            label="Operating system"
            value={record.os || "—"}
            icon={<Monitor className="w-3.5 h-3.5" />}
          />
          <Row
            label="Device type"
            value={<DeviceBadge type={record.deviceType} />}
            icon={<Laptop2 className="w-3.5 h-3.5" />}
          />
          <Row
            label="Device name"
            value={record.deviceName || "—"}
            icon={<Smartphone className="w-3.5 h-3.5" />}
          />
          <Row
            label="Engine"
            value={record.engine || "—"}
            icon={<Cpu className="w-3.5 h-3.5" />}
          />
          <Row
            label="Locale"
            value={record.locale || "—"}
            icon={<Languages className="w-3.5 h-3.5" />}
          />

          <div className="py-2.5">
            <button
              onClick={() => setShowUA(!showUA)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showUA ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              {showUA ? "Hide" : "Show"} User-Agent
            </button>
            {showUA && (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground bg-muted/30 rounded p-2 break-all leading-relaxed">
                {record.userAgent || "—"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Pagination = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPage: (p: number) => void;
}) => {
  const from = Math.min((page - 1) * pageSize + 1, totalCount);
  const to = Math.min(page * pageSize, totalCount);
  const pages: (number | "…")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 pt-4">
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-medium text-foreground">
          {from}–{to}
        </span>{" "}
        of{" "}
        <span className="font-medium text-foreground">
          {totalCount.toLocaleString()}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-muted-foreground text-sm">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8 text-xs"
              onClick={() => onPage(p as number)}
            >
              {p}
            </Button>
          ),
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPage(totalPages)}
          disabled={page >= totalPages}
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

const UserActivityPage = () => {
  const { toast } = useToast();

  const [records, setRecords] = useState<ActivityRecord[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successFilter, setSuccessFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [detail, setDetail] = useState<ActivityRecord | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ActivityRecord | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (record: ActivityRecord) => {
    setDeleting(true);
    try {
      const res: any = await sendPostRequest("admin", "delete-activity", {
        id: record.id,
      });
      if (res?.returnCode === 200) {
        setRecords((prev) => prev.filter((r) => r.id !== record.id));
        setTotalCount((prev) => prev - 1);
        toast({
          title: "Record deleted",
          description: `Activity #${record.id} removed.`,
        });
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
        description: e?.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmDelete(null);
    }
  };

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageStats = useMemo(
    () => ({
      success: summary?.successCount ?? records.filter((r) => r.success).length,
      failed: summary?.failedCount ?? records.filter((r) => !r.success).length,
      online:
        summary?.onlineCount ??
        records.filter((r) => r.success && !r.loggedOutAt).length,
      mobile: records.filter(
        (r) => (r.deviceType ?? "").toUpperCase() === "MOBILE",
      ).length,
    }),
    [records, summary],
  );

  const loadActivity = useCallback(
    async (
      query: string,
      pg: number,
      pgSize: number,
      sF: string,
      dF: string,
      sesF: string,
    ) => {
      setLoading(true);
      try {
        const payload: Record<string, any> = { page: pg, pageSize: pgSize };

        if (query.trim()) payload.username = query.trim();
        if (sF !== "all") payload.success = sF === "success";
        if (dF !== "all") payload.deviceType = dF;
        if (sesF === "online") payload.onlineOnly = true;
        if (sesF === "ended") payload.endedOnly = true;

        const res: any = await sendPostRequest(
          "admin",
          "get-all-activity",
          payload,
        );

        if (res?.returnCode === 200 && res?.returnData) {
          const data = res.returnData;
          const recordsArray = Array.isArray(data) ? data : (data?.sessions ?? []);
          setRecords(recordsArray);
          setSummary(Array.isArray(data) ? null : (data?.summary ?? null));
          setTotalCount(Array.isArray(data) ? data.length : (data?.totalCount ?? 0));
          setTotalPages(Array.isArray(data) ? Math.ceil(data.length / 20) : (data?.totalPages ?? 1));
        } else {
          toast({
            title: "Failed to load activity",
            description: res?.returnMessage ?? "Unknown error",
            variant: "destructive",
          });
          setRecords([]);
          setSummary(null);
          setTotalCount(0);
          setTotalPages(1);
        }
      } catch (e: any) {
        toast({
          title: "Network error",
          description: e?.message,
          variant: "destructive",
        });
        setRecords([]);
        setSummary(null);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    loadActivity(
      searchQuery,
      page,
      pageSize,
      successFilter,
      deviceFilter,
      sessionFilter,
    );
  }, [
    searchQuery,
    page,
    pageSize,
    successFilter,
    deviceFilter,
    sessionFilter,
    loadActivity,
  ]);

  const clearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSuccessFilter("all");
    setDeviceFilter("all");
    setSessionFilter("all");
    setPage(1);
  };

  const hasFilters =
    !!searchQuery ||
    successFilter !== "all" ||
    deviceFilter !== "all" ||
    sessionFilter !== "all";

  return (
    <TooltipProvider>
      <div className="p-6 lg:p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              Login Activity
            </h1>
            <p className="text-muted-foreground">
              Full audit log — login sessions, device context, session status,
              and browser fingerprints
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() =>
              loadActivity(
                searchQuery,
                page,
                pageSize,
                successFilter,
                deviceFilter,
                sessionFilter,
              )
            }
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Records",
              value: totalCount,
              icon: Activity,
              color: "bg-primary/10 text-primary",
            },
            {
              label: "Successful Logins",
              value: pageStats.success,
              icon: CheckCircle2,
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              label: "Failed Attempts",
              value: pageStats.failed,
              icon: AlertTriangle,
              color: "bg-rose-100 text-rose-600",
            },
            {
              label: "Online Now",
              value: pageStats.online,
              icon: Wifi,
              color: "bg-teal-100 text-teal-600",
            },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-5">
                {loading ? (
                  <>
                    <Skeleton className="w-10 h-10 rounded-lg mb-3" />
                    <Skeleton className="h-7 w-12 rounded mb-1.5" />
                    <Skeleton className="h-3.5 w-24 rounded" />
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
                      {s.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {s.label}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold">
                  Top Browsers & Operating Systems
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Browsers</p>
                  <SummaryChips
                    items={summary.topBrowsers}
                    emptyLabel="No browser data"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Operating Systems
                  </p>
                  <SummaryChips
                    items={summary.topOperatingSystems}
                    emptyLabel="No OS data"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <h3 className="text-sm font-semibold">
                  Top Device Types, Locales & IPs
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Device Types
                  </p>
                  <SummaryChips
                    items={summary.topDeviceTypes}
                    emptyLabel="No device data"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Locales</p>
                  <SummaryChips
                    items={summary.topLocales}
                    emptyLabel="No locale data"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Top IPs</p>
                  <SummaryChips
                    items={summary.topIps}
                    emptyLabel="No IP data"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select
                  value={successFilter}
                  onValueChange={(v) => {
                    setSuccessFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUCCESS_FILTERS.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        className="text-xs"
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={deviceFilter}
                  onValueChange={(v) => {
                    setDeviceFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEVICE_FILTERS.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        className="text-xs"
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={sessionFilter}
                  onValueChange={(v) => {
                    setSessionFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-36 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_FILTERS.map((f) => (
                      <SelectItem
                        key={f.value}
                        value={f.value}
                        className="text-xs"
                      >
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 gap-1.5 text-muted-foreground text-xs"
                    onClick={clearFilters}
                  >
                    <X className="w-3 h-3" /> Clear
                  </Button>
                )}
              </div>

              <div className="ml-auto flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground hidden lg:block">
                  Rows
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)} className="text-xs">
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {searchQuery && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    User: {searchQuery}
                    <button
                      onClick={() => {
                        setSearchInput("");
                        setSearchQuery("");
                      }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {successFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {
                      SUCCESS_FILTERS.find((f) => f.value === successFilter)
                        ?.label
                    }
                    <button onClick={() => setSuccessFilter("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {deviceFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {deviceFilter}
                    <button onClick={() => setDeviceFilter("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {sessionFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    {
                      SESSION_FILTERS.find((f) => f.value === sessionFilter)
                        ?.label
                    }
                    <button onClick={() => setSessionFilter("all")}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30">
                    <TableHead className="pl-6 w-56">User</TableHead>
                    <TableHead className="w-20">User ID</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="min-w-[180px]">
                      Browser / OS
                    </TableHead>
                    <TableHead className="w-32">IP Address</TableHead>
                    <TableHead className="w-24">Device</TableHead>
                    <TableHead className="w-44">Device Name</TableHead>
                    <TableHead className="w-24">Locale</TableHead>
                    <TableHead className="w-28">Session</TableHead>
                    <TableHead className="w-36">Logged In</TableHead>
                    <TableHead className="w-36">Logged Out</TableHead>
                    <TableHead className="w-20 pr-4 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: Math.min(pageSize, 10) }).map(
                      (_, i) => <SkeletonRow key={i} />,
                    )
                  ) : records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={12}>
                        <div className="flex flex-col items-center py-16 text-muted-foreground">
                          <Activity className="w-10 h-10 mb-3 opacity-30" />
                          <p className="font-medium">
                            No activity records found
                          </p>
                          {hasFilters && (
                            <p className="text-sm mt-1">
                              Try clearing your filters
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((r) => (
                      <TableRow
                        key={r.id}
                        className={cn(
                          "border-border/40 hover:bg-muted/20 transition-colors",
                          !r.success && "bg-rose-50/30 hover:bg-rose-50/50",
                        )}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0",
                                avatarColor(r.username ?? "?"),
                              )}
                            >
                              {(r.username ?? "?")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {r.username ?? "—"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate font-mono">
                                {r.email ?? (
                                  <span className="italic opacity-50">
                                    no email
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-mono">
                            {r.userId ?? "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <SuccessBadge
                              success={r.success}
                              reason={r.failureReason}
                            />
                            {!r.success && r.failureReason && (
                              <p className="text-[11px] text-rose-600 line-clamp-1 max-w-[140px]">
                                {r.failureReason}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium truncate max-w-[180px]">
                              {r.browserName || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {r.os || "Unknown"}
                              {r.engine ? ` · ${r.engine}` : ""}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="text-xs font-mono">
                              {r.ip || "—"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <DeviceBadge type={r.deviceType} />
                        </TableCell>

                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {r.deviceName || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="text-xs font-medium">
                            {r.locale || "—"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <SessionBadge record={r} />
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <LogIn className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                              <span className="font-medium text-foreground">
                                {timeAgo(r.loggedInAt)}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground pl-3.5">
                              {formatDate(r.loggedInAt).split(",")[0]}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          {r.loggedOutAt ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <LogOut className="w-2.5 h-2.5 text-rose-400 shrink-0" />
                                <span className="font-medium text-foreground">
                                  {timeAgo(r.loggedOutAt)}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground pl-3.5">
                                {formatDate(r.loggedOutAt).split(",")[0]}
                              </p>
                            </div>
                          ) : r.success ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                              Online
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="pr-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setDetail(r)}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">View details</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                  onClick={() => setConfirmDelete(r)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Delete record</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && totalCount > 0 && (
              <div className="px-6 pb-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPage={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <ActivityDetailDialog
          record={detail}
          open={!!detail}
          onClose={() => setDetail(null)}
        />

        {/* ── Delete confirmation dialog ── */}
        <Dialog
          open={!!confirmDelete}
          onOpenChange={(open) => {
            if (!open) setConfirmDelete(null);
          }}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-4 h-4" /> Delete Activity Record
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-1">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to permanently delete activity record{" "}
                <span className="font-mono font-semibold text-foreground">
                  #{confirmDelete?.id}
                </span>{" "}
                for user{" "}
                <span className="font-semibold text-foreground">
                  @{confirmDelete?.username}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(null)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => confirmDelete && handleDelete(confirmDelete)}
                  disabled={deleting}
                  className="gap-1.5"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                      Deleting…
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default UserActivityPage;
