// AdminVerseExplanations — thin page composing hook + shared admin components
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollEnd } from "@/hooks/useScrollEnd";
import { AdminCardGridSkeleton } from "./AdminCardGridSkeleton";
import {
  useVerseExplanationList,
  type VerseExplanationListItem,
} from "../hooks/useVerseExplanationList";
import {
  AdminPageHeader,
  AdminPageContent,
  AdminEmptyState,
  VerseExplanationFilters,
  VerseExplanationTable,
  VerseExplanationDeleteDialog,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

export function VerseExplanationsPageContent() {
  const navigate = useNavigate();
  const { data, actions } = useVerseExplanationList();
  const h = { ...data, ...actions };
  const [deleteTarget, setDeleteTarget] =
    useState<VerseExplanationListItem | null>(null);
  const watchEnd = h.hasMore && !h.loading && !h.loadError;
  const endRef = useScrollEnd(watchEnd, h.loadMore);

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        fullWidth
        title={tt("Verse Explanations Manager")}
        subtitle={`${h.data.totalCount || 0} explanation${(h.data.totalCount || 0) !== 1 ? "s" : ""}`}
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
        onAdd={() => navigate("/admin/add-verse-explanation")}
        addLabel={tt("Add explanation")}
      />

      <AdminPageContent fullWidth>
        <VerseExplanationFilters
          search={{ value: h.search, onChange: h.setSearch }}
          bookName={h.bookName}
          chapter={h.chapter}
          creatorName={h.creatorName}
          onBookChange={h.setBookName}
          onChapterChange={h.setChapter}
          onCreatorNameChange={h.setCreatorName}
          onClear={h.clearFilters}
        />

        {h.page === 1 && h.loading ? (
          <AdminCardGridSkeleton count={6} label={tt("Loading verse explanations…")} />
        ) : h.page === 1 && h.loadError ? null : h.data.items.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title={tt("No explanations found")}
            description={
              h.search || h.bookName || h.chapter || h.creatorName
                ? tt("No results for the current search or filters")
                : undefined
            }
            onAction={() => navigate("/admin/add-verse-explanation")}
          />
        ) : (
          <VerseExplanationTable
            items={h.data.items}
            onView={h.viewItem}
            onEdit={h.editItem}
            onDelete={setDeleteTarget}
          />
        )}
        {h.loadError && (
          <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm">
            <p>{tt("Failed to load verse explanations")}</p>
            <Button type="button" variant="outline" size="sm" onClick={h.retry}>{tt("Retry")}</Button>
          </div>
        )}
        {h.page > 1 && h.loading && (
          <AdminCardGridSkeleton count={3} label={tt("Loading more explanations…")} />
        )}
        {watchEnd && <div ref={endRef} className="h-px" aria-hidden="true" />}
      </AdminPageContent>

      <VerseExplanationDeleteDialog
        open={!!deleteTarget}
        bookName={deleteTarget?.bookName}
        chapter={deleteTarget?.chapter}
        verseNumber={deleteTarget?.verseNumber}
        deleting={h.deleting !== null}
        deletingId={h.deleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await h.deleteItem(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
