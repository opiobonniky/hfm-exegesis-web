"use client";

import { useAdminVerseExplanationsPage } from "../hooks/useAdminVerseExplanationsPage";
import { Lightbulb, Trash2, Edit2, Save, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid, AdminSearchBar } from "../components";

const EMPTY_FORM = { bookName: "", chapter: "", verseNumber: "", explanation: "", learnMore: "", isPublished: true };

export default function AdminVerseExplanations() {
  const h = useAdminVerseExplanationsPage();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Verse Explanations Manager"
        subtitle="Manage verse explanations and study notes"
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={() => h.navigate("/admin")}
        onAdd={() => h.openEdit()}
        addLabel="Add Explanation"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminSearchBar value={h.search} onChange={h.setSearch} onSearch={h.refresh} placeholder="Search by book name or reference..." />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="No explanations found"
            message={h.search ? "Try a different search term" : "Create your first verse explanation"}
            onAction={!h.search ? () => h.openEdit() : undefined}
          />
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Reference</th>
                    <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Explanation</th>
                    <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Learn More</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {h.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-3">
                        <div className="font-medium">{item.bookName} {item.chapter}:{item.verseNumber}</div>
                        <div className="text-xs text-muted-foreground md:hidden line-clamp-1 mt-1">{item.explanation}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.explanation}</p>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.learnMore || "—"}</p>
                      </td>
                      <td className="p-3">
                        <Badge variant={item.isPublished ? "default" : "secondary"}>
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => h.openEdit(item)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => h.setDeleteItem(item)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {h.hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={h.loadMore} disabled={h.loading} className="gap-2">
                  {h.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!h.editItem || h.editForm.bookName !== ""} onOpenChange={(o) => { if (!o) { h.setEditItem(null); h.setEditForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{h.editItem ? "Edit Explanation" : "Add New Explanation"}</DialogTitle>
            <DialogDescription>{h.editItem ? "Update the verse explanation" : "Create a new verse explanation"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Book Name *</Label>
              <Input placeholder="Search for a book..." value={h.editForm.bookName} onChange={(e) => h.setEditForm((p) => ({ ...p, bookName: e.target.value }))} />
              {h.editForm.bookName && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {h.filteredBooks.slice(0, 10).map((book) => (
                    <button key={book} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors" onClick={() => h.setEditForm((p) => ({ ...p, bookName: book }))}>
                      {book}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chapter *</Label>
                <Input type="number" min="1" placeholder="e.g., 3" value={h.editForm.chapter} onChange={(e) => h.setEditForm((p) => ({ ...p, chapter: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Verse Number *</Label>
                <Input type="number" min="1" placeholder="e.g., 16" value={h.editForm.verseNumber} onChange={(e) => h.setEditForm((p) => ({ ...p, verseNumber: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Explanation *</Label>
              <Textarea placeholder="Write the verse explanation..." value={h.editForm.explanation} onChange={(e) => h.setEditForm((p) => ({ ...p, explanation: e.target.value }))} rows={6} className="min-h-[150px]" />
            </div>
            <div className="space-y-2">
              <Label>Learn More (optional)</Label>
              <Textarea placeholder="Additional study notes..." value={h.editForm.learnMore} onChange={(e) => h.setEditForm((p) => ({ ...p, learnMore: e.target.value }))} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { h.setEditItem(null); h.setEditForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={h.handleSave} disabled={h.saving} className="gap-2">
              {h.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {h.editItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!h.deleteItem} onOpenChange={(o) => { if (!o) h.setDeleteItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete Explanation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the explanation for <strong>{h.deleteItem?.bookName} {h.deleteItem?.chapter}:{h.deleteItem?.verseNumber}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting === h.deleteItem?.id} className="gap-2">
              {h.deleting === h.deleteItem?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
