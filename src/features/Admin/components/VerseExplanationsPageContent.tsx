// AdminVerseExplanations — thin page composing hook + shared admin components
"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import {
  useVerseExplanationList,
  type VerseExplanationListItem,
} from "../hooks/useVerseExplanationList";
import {
  AdminPageHeader,
  AdminPageContent,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  PaginationControls,
  VerseExplanationFilters,
  VerseExplanationTable,
  VerseExplanationDeleteDialog,
} from "../components";
import { tt } from '@/components/languages/hardcodedTranslate';

const PAGE_SIZE = 20;

export function VerseExplanationsPageContent() {
  const navigate = useNavigate();
  const { data, actions } = useVerseExplanationList(PAGE_SIZE);
  const h = { ...data, ...actions };
  const [deleteTarget, setDeleteTarget] =
    useState<VerseExplanationListItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // intersection observer to trigger loadMore when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            h.hasMore &&
            !h.loadingMore &&
            !h.loading
          ) {
            h.loadMore();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [sentinelRef, h.hasMore, h.loadingMore, h.loading, h.loadMore]);

  // Map the lean API items to the card shape. The list endpoint already
  // provides the display snippets (explanation/learnMore), so no heavy
  // nested study payloads are needed here.
  const tableItems = h.data.items.map((it) => ({
    id: it.id,
    bookName: it.bookName,
    chapter: it.chapter,
    verseNumber: it.verseNumber,
    explanation: it.explanation || "",
    learnMore: it.learnMore || undefined,
    isPublished: it.isPublished ?? true,
    bibleVersion: it.bibleVersion || "BSB",
    creatorName: it.creatorName || null,
    createdOn: it.createdOn,
    updatedOn: it.updatedOn,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title={tt("Verse Explanations Manager")}
        subtitle={`${h.data.totalCount || 0} explanation${(h.data.totalCount || 0) !== 1 ? "s" : ""}`}
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
        onAdd={() => navigate("/admin/add-verse-explanation")}
        addLabel="Add"
      />

      <AdminPageContent>
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          placeholder={tt("Search book, verse, text or creator name...")}
        />

        <VerseExplanationFilters
          bookName={h.bookName}
          chapter={h.chapter}
          creatorName={h.creatorName}
          onBookChange={h.setBookName}
          onChapterChange={h.setChapter}
          onCreatorNameChange={h.setCreatorName}
          onClear={h.clearFilters}
        />

        {h.loading && h.data.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.data.items.length === 0 ? (
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
          <>
            <VerseExplanationTable
              items={tableItems}
              loadingMore={h.loadingMore}
              hasMore={h.hasMore}
              sentinelRef={sentinelRef}
              onView={(item) => h.viewItem(item as any)}
              onEdit={(item) => h.editItem(item as any)}
              onDelete={(item) => {
                const found = h.data.items.find((i) => i.id === item.id);
                if (found) setDeleteTarget(found);
              }}
            />

            {/* keep pagination controls as a fallback / for direct page jump */}
            <PaginationControls
              page={Math.max(0, h.page - 1)}
              total={h.data.totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => h.goToPage(p + 1)}
            />
          </>
        )}
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
