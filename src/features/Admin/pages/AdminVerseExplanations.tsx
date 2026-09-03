// AdminVerseExplanations — card grid with page-based pagination
"use client";

import { useState } from "react";
import {
  Lightbulb,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useVerseExplanationList } from "../hooks/useVerseExplanationList";

const PAGE_SIZE = 20;

export default function AdminVerseExplanations() {
  const h = useVerseExplanationList(PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null);

  const pages = Array.from({ length: h.data.totalPages }, (_, i) => i + 1);
  const startIdx = (h.page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(h.page * PAGE_SIZE, h.data.totalCount);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={h.goBack}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <div>
                <h1 className="text-lg font-bold">Verse Explanations Manager</h1>
                <p className="text-xs text-muted-foreground">
                  {h.data.totalCount} explanation{h.data.totalCount !== 1 ? "s" : ""} total
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => h.navigate("/admin/add-verse-explanation")}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Search */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by book name..."
            value={h.search}
            onChange={(e) => h.setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Loading state */}
        {h.loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : h.data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <h2 className="text-lg font-semibold">No explanations found</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {h.search ? "Try a different search" : "Create your first explanation"}
            </p>
            {!h.search && (
              <Button className="mt-4 gap-2" onClick={() => h.navigate("/admin/add-verse-explanation")}>
                <Plus className="w-4 h-4" /> Add Explanation
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {h.data.items.map((item) => (
                <div
                  key={item.id}
                  className="group border rounded-xl p-4 bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">
                        {item.bookName} {item.chapter}:{item.verseNumber}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.bibleVersion || "BSB"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
                    {item.exegesis?.explanationText || "No explanation yet"}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground/60">
                      {item.createdOn ? new Date(item.createdOn).toLocaleDateString() : ""}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => h.viewItem(item)}
                        title="View"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => h.editItem(item)}
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() =>
                          setDeleteTarget({
                            id: item.id,
                            label: `${item.bookName} ${item.chapter}:${item.verseNumber}`,
                          })
                        }
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {h.data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-xs text-muted-foreground">
                  Showing {startIdx}–{endIdx} of {h.data.totalCount}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={h.page === 1}
                    onClick={() => h.goToPage(h.page - 1)}
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  {pages.map((p) => (
                    <Button
                      key={p}
                      variant={p === h.page ? "default" : "outline"}
                      size="sm"
                      className="min-w-[32px]"
                      onClick={() => h.goToPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={h.page === h.data.totalPages}
                    onClick={() => h.goToPage(h.page + 1)}
                  >
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Verse Explanation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.label}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={h.deleting !== null}
              onClick={async () => {
                if (!deleteTarget) return;
                const item = h.data.items.find((i) => i.id === deleteTarget.id);
                if (item) {
                  const ok = await h.deleteItem(item);
                  if (ok) setDeleteTarget(null);
                }
              }}
            >
              {h.deleting !== null ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
