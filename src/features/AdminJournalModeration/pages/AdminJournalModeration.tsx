"use client";

import { useAdminJournalModerationPage, FILTERS } from "../hooks/useAdminJournalModerationPage";
import {
  Search, Loader2, Filter, CheckCircle2, XCircle, Eye, BookOpen, RefreshCw, User, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LoadingState, EmptyState } from "@/components/ui/states";

const FILTER_OPTIONS = [
  { label: "All Entries", value: "all" },
  { label: "Public", value: "public" },
  { label: "Flagged", value: "flagged" },
  { label: "Unpublished", value: "unpublished" },
];

export default function AdminJournalModerationPage() {
  const h = useAdminJournalModerationPage();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Journal Moderation</h1>
          <p className="text-sm text-muted-foreground">Review and moderate public journal entries</p>
        </div>
        <Button variant="outline" onClick={() => h.fetchEntries(true)} disabled={h.refreshing}>
          <RefreshCw className={cn("mr-2 h-4 w-4", h.refreshing && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search entries..." value={h.search} onChange={(e) => h.setSearch(e.target.value)}
            className="pl-9" onKeyDown={(e) => e.key === "Enter" && h.fetchEntries()} />
        </div>
        <Select value={h.filter} onValueChange={h.setFilter}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTER_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {h.loading ? (
        <LoadingState message="Loading journal entries..." />
      ) : h.filteredEntries.length === 0 ? (
        <EmptyState title="No entries found" message="No journal entries match your filters." icon={BookOpen} />
      ) : (
        <div className="grid gap-4">
          {h.filteredEntries.map((entry) => (
            <Card key={entry.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{entry.title}</h3>
                      {entry.flags > 0 && <Badge variant="destructive" className="text-xs">{entry.flags} flag{entry.flags > 1 ? "s" : ""}</Badge>}
                      <Badge variant={entry.isPublished ? "default" : "secondary"} className="text-xs">{entry.isPublished ? "Published" : "Draft"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {entry.userName}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(entry.createdOn).toLocaleDateString()}</span>
                      <span>📌 {entry.verseReference}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => h.setViewEntry(entry)}><Eye className="h-4 w-4" /></Button>
                    <Button variant={entry.isPublished ? "outline" : "default"} size="sm"
                      disabled={h.actionLoading === entry.id}
                      onClick={() => h.togglePublication(entry.id, !entry.isPublished)}>
                      {h.actionLoading === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : entry.isPublished ? <><XCircle className="mr-1 h-3 w-3" /> Unpublish</> : <><CheckCircle2 className="mr-1 h-3 w-3" /> Publish</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!h.viewEntry} onOpenChange={() => h.setViewEntry(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{h.viewEntry?.title}</DialogTitle>
            <DialogDescription>By {h.viewEntry?.userName} • {h.viewEntry && new Date(h.viewEntry.createdOn).toLocaleDateString()}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Verse Reference</p>
              <p className="text-sm">{h.viewEntry?.verseReference}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Content</p>
              <div className="text-sm whitespace-pre-wrap rounded-lg bg-muted p-4">{h.viewEntry?.content}</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setViewEntry(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
