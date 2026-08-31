"use client";

// VerseExplanations — browse and manage verse explanations
import { Button } from "@/components/ui/button";
import { useVerseExplanationsPage } from "../hooks/useVerseExplanationsPage";
import ExplanationList from "../components/ExplanationList";
import { PageHeader } from "@/components/PageHeader";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";

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

      <DeleteConfirmDialog
        open={!!h.deleteTarget}
        title={h.t.verseExplanations?.deleteDialogTitle || "Delete Explanation"}
        description={`This will permanently delete the explanation for ${h.deleteTarget?.bookName} ${h.deleteTarget?.chapter}:${h.deleteTarget?.verseNumber}.`}
        loading={h.deleting}
        onConfirm={h.confirmDelete}
        onClose={() => h.setDeleteTarget(null)}
      >
        {h.deleteTarget && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="font-semibold text-sm">{h.deleteTarget.bookName} {h.deleteTarget.chapter}:{h.deleteTarget.verseNumber}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{h.deleteTarget.explanation}</p>
          </div>
        )}
      </DeleteConfirmDialog>
    </div>
  );
};

export default VerseExplanations;
