"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Smartphone,
  Monitor,
  LogIn,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";

interface ActivitySession {
  id: number;
  username: string;
  email: string;
  loggedInAt: string;
  loggedOutAt: string | null;
  deviceType: string;
  deviceName: string | null;
  ipAddress: string | null;
  location: string | null;
  success: boolean;
  failureReason: string | null;
  browser: string | null;
  os: string | null;
}

interface ActivitySummary {
  successCount: number;
  failedCount: number;
  onlineCount: number;
}

const AdminActivityLog = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [searchUsername, setSearchUsername] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadActivity = useCallback(async (pg: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-all-activity", {
        page: pg,
        pageSize,
        username: searchUsername || undefined,
        deviceType: deviceFilter !== "all" ? deviceFilter : undefined,
        success: statusFilter === "success" ? true : statusFilter === "failed" ? false : undefined,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setSessions(res.returnData.sessions || []);
        setTotal(res.returnData.totalCount || 0);
        setTotalPages(res.returnData.totalPages || 1);
        setSummary(res.returnData.summary || null);
      }
    } catch {
      toast({ title: "Failed to load activity", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchUsername, deviceFilter, statusFilter, pageSize, toast]);

  useEffect(() => { loadActivity(page); }, [loadActivity, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("admin", "delete-activity", { activityId: deleteTarget });
      if (res?.returnCode === 200) {
        toast({ title: "Activity deleted" });
        setDeleteTarget(null);
        loadActivity(page);
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchUsername("");
    setDeviceFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "mobile": return <Smartphone className="w-3.5 h-3.5" />;
      case "tablet": return <Smartphone className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Activity Log</h1>
          <p className="text-sm text-muted-foreground">View all user login activity across the platform</p>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-lg font-bold">{summary.successCount}</p>
                <p className="text-xs text-muted-foreground">Successful</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-lg font-bold">{summary.failedCount}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <LogIn className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="text-lg font-bold">{summary.onlineCount}</p>
                <p className="text-xs text-muted-foreground">Currently Online</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activity Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sessions ({total})</CardTitle>
              <Button variant="outline" size="sm" className="sm:hidden" onClick={() => setFiltersOpen(v => !v)}>
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by username..." value={searchUsername} onChange={e => { setSearchUsername(e.target.value); setPage(1); }} className="pl-9 h-9 text-sm" />
              </div>
              <div className="hidden sm:flex gap-2">
                <Select value={deviceFilter} onValueChange={v => { setDeviceFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Device" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {filtersOpen && (
              <div className="sm:hidden grid grid-cols-2 gap-2">
                <Select value={deviceFilter} onValueChange={v => { setDeviceFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Devices</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <Activity className="w-10 h-10 mb-3 text-muted-foreground/40" />
              <p className="font-medium">No activity found</p>
              {(searchUsername || deviceFilter !== "all" || statusFilter !== "all") && (
                <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={clearFilters}>Clear filters</Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>User</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Location/IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id} className="border-border/40">
                      <TableCell>
                        <div className="font-medium text-sm">{s.username}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(s.loggedInAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {s.loggedOutAt ? (
                          Math.round((new Date(s.loggedOutAt).getTime() - new Date(s.loggedInAt).getTime()) / 60000) + " min"
                        ) : (
                          <span className="text-emerald-600 font-medium">Active</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {getDeviceIcon(s.deviceType)}
                          <span>{s.deviceType || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {s.ipAddress || "—"}
                      </TableCell>
                      <TableCell>
                        {s.success ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Success</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(s.id)}>
                          <Trash2 className="w-4 h-4 text-foreground/60" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Delete Session</DialogTitle>
            <DialogDescription>Remove this activity log entry. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2 w-full sm:w-auto">
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4 text-foreground/60" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminActivityLog;
