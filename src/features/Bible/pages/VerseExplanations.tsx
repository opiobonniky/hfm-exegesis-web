"use client";

// VerseExplanations — browse and manage verse explanations
import { Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useVerseExplanationsPage } from "../hooks/useVerseExplanationsPage";
import ExplanationList from "../components/ExplanationList";
import { PageHeader } from "@/components/PageHeader";

const VerseExplanations = () => {
  const h = useVerseExplanationsPage();

  return (
    <div className="min-h-screen bg-background" dir={h.t.layoutDirection === "rtl" ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <PageHeader
          title={h.t.verseExplanations?.title || "Verse Explanations"}
          subtitle={`${h.explanations.length} explanations`}
          onBack={() => h.goToAdd()}
          action={<Button size="sm" onClick={h.goToAdd} className="gap-1.5 text-xs">+ Add</Button>}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <ExplanationList
          explanations={h.explanations} filtered={h.filtered} loading={h.loading}
          search={h.search} bookFilter={h.bookFilter} isAdmin={h.isAdmin}
          onSearchChange={h.setSearch} onBookFilterChange={h.setBookFilter}
          onEdit={h.goToEdit}
          onDelete={h.setDeleteTarget}
          onAddFirst={h.goToAdd}
        />
      </div>

      {/* Delete dialog */}
      <Dialog open={!!h.deleteTarget} onOpenChange={(o) => !o && h.setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> {h.t.verseExplanations?.deleteDialogTitle || "Delete Explanation"}
            </DialogTitle>
            <DialogDescription>
              {`This will permanently delete the explanation for ${h.deleteTarget?.bookName} ${h.deleteTarget?.chapter}:${h.deleteTarget?.verseNumber}.`}
            </DialogDescription>
          </DialogHeader>
          {h.deleteTarget && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="font-semibold text-sm">{h.deleteTarget.bookName} {h.deleteTarget.chapter}:{h.deleteTarget.verseNumber}</p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{h.deleteTarget.explanation}</p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => h.setDeleteTarget(null)} disabled={h.deleting}>Cancel</Button>
            <Button variant="destructive" onClick={h.confirmDelete} disabled={h.deleting} className="gap-2">
              {h.deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerseExplanations;
