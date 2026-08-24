// AdminActivityLog — thin page composing hooks + components
"use client";
import { Activity, Search, Loader2, Trash2, ChevronLeft, ChevronRight, Filter, X, Smartphone, Monitor, LogIn, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAdminActivityLog } from "../hooks/useAdminActivityLog";
import { ACTIVITY_PAGE_SIZE } from "../constants";

const AdminActivityLog = () => {
  const { isRtl } = useLanguage();
  const h = useAdminActivityLog();
  const deviceIcon = (d: string) => d === "mobile" ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />;
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Activity Log</h1>
          <p className="text-sm text-muted-foreground">Track user sessions and login activity</p>
      </div>
      {/* Summary cards */}
      {h.summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Successful", value: h.summary.successCount, icon: CheckCircle2, color: "bg-emerald-500/10 text-emerald-600" },
            { label: "Failed", value: h.summary.failedCount, icon: AlertCircle, color: "bg-red-500/10 text-red-600" },
            { label: "Online Now", value: h.summary.onlineCount, icon: LogIn, color: "bg-primary/10 text-primary" },
          ].map(s => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="w-4 h-4" /></div>
                <div><p className="text-lg font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
      )}
      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by username..." value={h.searchUsername} onChange={e => h.setSearchUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && h.handleSearch()} className="pl-9 h-9 text-sm" />
            </div>
            <Button variant="outline" size="sm" onClick={() => h.setFiltersOpen(!h.filtersOpen)}>
              <Filter className="w-4 h-4 mr-1" /> Filters
            </Button>
            <Button variant="outline" size="sm" onClick={h.handleSearch}><Search className="w-4 h-4 mr-1" /> Search</Button>
          </div>
          {h.filtersOpen && (
            <div className="flex gap-2 mt-2">
              <Select value={h.deviceFilter} onValueChange={h.setDeviceFilter}>
                <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Device" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All Devices</SelectItem><SelectItem value="mobile">Mobile</SelectItem><SelectItem value="desktop">Desktop</SelectItem></SelectContent>
              </Select>
              <Select value={h.statusFilter} onValueChange={h.setStatusFilter}>
                <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent>
              <Button variant="ghost" size="sm" onClick={h.handleClearFilters}><X className="w-3 h-3 mr-1" /> Clear</Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {h.loading ? (
            <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
          ) : h.sessions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center"><Activity className="w-10 h-10 mb-3 text-muted-foreground/40" /><p className="font-medium">No activity found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/30">
                  <TableHead>User</TableHead><TableHead>Device</TableHead><TableHead>IP</TableHead><TableHead>Login</TableHead><TableHead>Logout</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {h.sessions.map(s => (
                    <TableRow key={s.id} className="border-border/40">
                      <TableCell><div className="font-medium text-sm">{s.username}</div><div className="text-xs text-muted-foreground">{s.email}</div></TableCell>
                      <TableCell><div className="flex items-center gap-1.5">{deviceIcon(s.deviceType)}<span className="text-xs capitalize">{s.deviceType}</span></div></TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{s.ipAddress || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.loggedInAt ? new Date(s.loggedInAt).toLocaleString() : "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{s.loggedOutAt ? new Date(s.loggedOutAt).toLocaleString() : "—"}</TableCell>
                      <TableCell>{s.success ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Success</Badge>
                      ) : <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200">Failed</Badge>}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => h.setDeleteTarget(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          {h.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">Page {h.page} of {h.totalPages} · {h.total} total</p>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.page <= 1} onClick={() => h.setPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.page >= h.totalPages} onClick={() => h.setPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
              </div>
        </CardContent>
      </Card>
      {/* Delete dialog */}
      <Dialog open={!!h.deleteTarget} onOpenChange={o => !o && h.setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Delete Session</DialogTitle>
            <DialogDescription>This will remove the session record.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => h.setDeleteTarget(null)} disabled={h.deleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting} className="gap-2 w-full sm:w-auto">
              {h.deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminActivityLog;
