"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2, Globe, Lock, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid } from "../components";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  bookName?: string;
  chapter?: number;
  category?: string;
  isPublished: boolean;
  userId: string;
  createdOn: string;
}

export default function AdminJournalModeration() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadEntries = useCallback(async (pageNum: number, q: string, append = false) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("journal", "admin/get-all", {
        page: pageNum, size: 20, search: q || undefined,
      });
      const data = res?.returnData;
      const items = data?.entries || data?.content || data || [];
      setEntries(prev => append ? [...prev, ...items] : items);
      setHasMore(items.length === 20);
    } catch {
      toast({ title: "Failed to load entries", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadEntries(0, search); }, []);

  const handleSearch = () => { setPage(0); loadEntries(0, search); };

  const handleTogglePublication = async (entry: JournalEntry) => {
    setActionLoading(entry.id);
    try {
      const res = await sendPostRequest("journal", "admin/set-publication", {
        id: entry.id, isPublished: !entry.isPublished,
      });
      if (res.returnCode === 200) {
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, isPublished: !e.isPublished } : e));
        toast({ title: entry.isPublished ? "Made private" : "Made public" });
      }
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "delete", { id: deleteTarget.id });
      if (res.returnCode === 200) {
        setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
        toast({ title: "Deleted" });
        setDeleteTarget(null);
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Journal Moderation"
        subtitle={`${entries.length} entries`}
        icon={<BookOpen className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => {}}
        addLabel=""
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="h-9 gap-1 text-xs">Search</Button>
        </div>

        {/* Entries list */}
        {loading && entries.length === 0 ? (
          <AdminLoadingGrid />
        ) : entries.length === 0 ? (
          <AdminEmptyState icon={<BookOpen className="w-12 h-12" />} title="No entries found" />
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Title</th>
                    <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Category</th>
                    <th className="text-left p-3 text-sm font-medium">Visibility</th>
                    <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Date</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium text-sm line-clamp-1">{entry.title || "Untitled"}</div>
                        {entry.bookName && (
                          <div className="text-xs text-muted-foreground">{entry.bookName} {entry.chapter}</div>
                        )}
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <Badge variant="secondary">{entry.category || "general"}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={entry.isPublished ? "default" : "outline"}>
                          {entry.isPublished ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                          {entry.isPublished ? "Public" : "Private"}
                        </Badge>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {entry.createdOn ? new Date(entry.createdOn).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleTogglePublication(entry)}
                            disabled={actionLoading === entry.id}
                            title={entry.isPublished ? "Make private" : "Make public"}
                          >
                            {actionLoading === entry.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : entry.isPublished ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(entry)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => { const np = page + 1; setPage(np); loadEntries(np, search, true); }} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete this entry? This action cannot be undone.</p>
          {deleteTarget && <p className="text-sm font-medium">&ldquo;{deleteTarget.title}&rdquo;</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
