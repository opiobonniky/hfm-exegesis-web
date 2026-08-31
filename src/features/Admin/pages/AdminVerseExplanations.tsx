// AdminVerseExplanations — thin page composing hook + components (responsive)
"use client";

import { useNavigate } from "react-router-dom";
import { Lightbulb, Trash2, Edit2, Eye, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdminVerseExplanationsPage } from "../hooks/useAdminVerseExplanationsPage";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
} from "../components";
import { VerseExplanationFormDialog } from "../components/VerseExplanationFormDialog";

const EMPTY_FORM = {
  bookName: "",
  chapter: "",
  verseNumber: "",
  explanation: "",
  learnMore: "",
  isPublished: true,
};

export default function AdminVerseExplanations() {
  const h = useAdminVerseExplanationsPage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Verse Explanations Manager"
        subtitle="Manage verse explanations and study notes"
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={() => navigate("/admin")}
        onAdd={() => h.openEdit()}
        addLabel="Add"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={h.refresh}
          placeholder="Search by book name..."
        />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="No explanations found"
            message={h.search ? "Try a different search" : "Create your first explanation"}
            onAction={!h.search ? () => h.openEdit() : undefined}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">Reference</th>
                    <th className="text-left p-3 text-sm font-medium">Explanation</th>
                    <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Learn More</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {h.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{item.bookName} {item.chapter}:{item.verseNumber}</div>
                      </td>
                      <td className="p-3">
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
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/verse-explanations/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`)} title="View">
                            <Eye className="w-4 h-4" />
                          </Button>
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

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {h.items.map((item) => (
                <div key={item.id} className="border rounded-xl p-3 bg-card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm">{item.bookName} {item.chapter}:{item.verseNumber}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{item.explanation}</p>
                    </div>
                    <Badge variant={item.isPublished ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {item.isPublished ? "Pub" : "Draft"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/verse-explanations/${encodeURIComponent(item.bookName)}/${item.chapter}/${item.verseNumber}`)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => h.openEdit(item)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => h.setDeleteItem(item)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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
            {!h.hasMore && h.items.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">All explanations loaded</p>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <VerseExplanationFormDialog
        open={!!h.editItem || h.editForm.bookName !== ""}
        editMode={!!h.editItem}
        form={h.editForm}
        filteredBooks={h.filteredBooks}
        saving={h.saving}
        onFormChange={h.setEditForm}
        onSave={h.handleSave}
        onClose={() => { h.setEditItem(null); h.setEditForm(EMPTY_FORM); }}
      />

      {/* Delete Dialog */}
      <Dialog open={!!h.deleteItem} onOpenChange={(o) => !o && h.setDeleteItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Delete
            </DialogTitle>
            <DialogDescription>
              Delete explanation for <strong>{h.deleteItem?.bookName} {h.deleteItem?.chapter}:{h.deleteItem?.verseNumber}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
