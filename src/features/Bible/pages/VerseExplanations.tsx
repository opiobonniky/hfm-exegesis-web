"use client";

// VerseExplanations — browse and manage verse explanations
import { Button } from "@/components/ui/button";
import { useVerseExplanationsPage } from "../hooks/useVerseExplanationsPage";
import ExplanationList from "../components/ExplanationList";
import { PageHeader } from "@/components/PageHeader";
import { DeleteConfirmDialog } from "../components/DeleteConfirmDialog";
import { BiblePageLayout, BiblePageInner, DeletePreview } from "../components";

const VerseExplanations = () => {
  const h = useVerseExplanationsPage();

  return (
    <BiblePageLayout isRtl={h.t.layoutDirection === "rtl"}>
      <BiblePageInner>
        <PageHeader
          title={h.t.verseExplanations?.title || "Verse Explanations"}
          subtitle={`${h.explanations.length} explanations`}
          onBack={() => h.goToAdd()}
          action={<Button size="sm" onClick={h.goToAdd} className="gap-1.5 text-xs">+ Add</Button>}
        />
      </BiblePageInner>

      <BiblePageInner className="py-6">
        <ExplanationList
          explanations={h.explanations} filtered={h.filtered} loading={h.loading}
          search={h.search} bookFilter={h.bookFilter} isAdmin={h.isAdmin}
          onSearchChange={h.setSearch} onBookFilterChange={h.setBookFilter}
          onEdit={h.goToEdit}
          onDelete={h.setDeleteTarget}
          onAddFirst={h.goToAdd}
        />
      </BiblePageInner>

      <DeleteConfirmDialog
        open={!!h.deleteTarget}
        title={h.t.verseExplanations?.deleteDialogTitle || "Delete Explanation"}
        description={`This will permanently delete the explanation for ${h.deleteTarget?.bookName} ${h.deleteTarget?.chapter}:${h.deleteTarget?.verseNumber}.`}
        loading={h.deleting}
        onConfirm={h.confirmDelete}
        onClose={() => h.setDeleteTarget(null)}
      >
        {h.deleteTarget && (
          <DeletePreview
            title={`${h.deleteTarget.bookName} ${h.deleteTarget.chapter}:${h.deleteTarget.verseNumber}`}
            description={h.deleteTarget.explanation}
          />
        )}
      </DeleteConfirmDialog>
    </BiblePageLayout>
  );
};

export default VerseExplanations;
