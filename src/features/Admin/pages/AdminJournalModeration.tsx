// AdminJournalModeration — thin page composing hook + components (responsive)
"use client";

import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Loader2, Trash2, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAdminJournalModeration } from "../hooks/useAdminJournalModeration";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
} from "../components";
import { JournalEntryRow } from "../components/JournalEntryRow";

export default function AdminJournalModeration() {
  const h = useAdminJournalModeration();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Journal Moderation"
        subtitle={`${h.totalCount || h.entries.length} entries`}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => {}}
        addLabel=""
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={h.search}
              onChange={(e) => h.setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && h.handleSearch()}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" onClick={h.handleSearch} className="h-9 gap-1 text-xs shrink-0">
            Search
          </Button>
        </div>

        {h.loading && h.entries.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.entries.length === 0 ? (
          <AdminEmptyState
            icon={<BookOpen className="w-12 h-12" />}
            title="No entries found"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Title</th>
                    <th className="text-left p-3 text-sm font-medium">Category</th>
                    <th className="text-left p-3 text-sm font-medium">Visibility</th>
                    <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {h.entries.map((entry) => (
                    <JournalEntryRow
                      key={entry.id}
                      entry={entry}
                      actionLoading={h.actionLoading}
                      onTogglePublication={() => h.handleTogglePublication(entry)}
                      onDelete={() => h.setDeleteTarget(entry)}
                      onView={() => navigate(`/admin/journal-moderation/${entry.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {h.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-xl p-3 bg-card"
                  onClick={() => navigate(`/admin/journal-moderation/${entry.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{entry.title || "Untitled"}</p>
                      {entry.bookName && (
                        <p className="text-xs text-muted-foreground">{entry.bookName} {entry.chapter}</p>
                      )}
                    </div>
                    <Badge variant={entry.isPublished ? "default" : "outline"} className="text-[10px] shrink-0">
                      {entry.isPublished ? <Globe className="w-2.5 h-2.5 mr-0.5" /> : <Lock className="w-2.5 h-2.5 mr-0.5" />}
                      {entry.isPublished ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{entry.category || "general"}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.createdOn ? new Date(entry.createdOn).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => h.handleTogglePublication(entry)}
                        disabled={h.actionLoading === entry.id}
                      >
                        {h.actionLoading === entry.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : entry.isPublished ? (
                          <Lock className="w-3.5 h-3.5" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                        onClick={() => h.setDeleteTarget(entry)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={h.sentinelRef} className="h-4" />
            {h.loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!h.hasMore && h.entries.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">All entries loaded</p>
            )}
          </>
        )}
      </div>

      {/* Delete dialog */}
      <Dialog open={!!h.deleteTarget} onOpenChange={(o) => !o && h.setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this entry? This action cannot be undone.
          </p>
          {h.deleteTarget && <p className="text-sm font-medium">&ldquo;{h.deleteTarget.title}&rdquo;</p>}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => h.setDeleteTarget(null)} disabled={h.deleting}>Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting} className="gap-2">
              {h.deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
