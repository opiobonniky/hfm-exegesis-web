// AdminVerseExplanations — thin page composing hook + shared admin components
"use client";

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { useVerseExplanationList, type VerseExplanationListItem } from "../hooks/useVerseExplanationList";
import {
  AdminPageHeader,
  AdminPageContent,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  PaginationControls,
  VerseExplanationTable,
  VerseExplanationDeleteDialog,
} from "../components";

const PAGE_SIZE = 20;

export default function AdminVerseExplanations() {
  const navigate = useNavigate();
  const h = useVerseExplanationList(PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<VerseExplanationListItem | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // intersection observer to trigger loadMore when sentinel is visible
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && h.hasMore && !h.loadingMore && !h.loading) {
            h.loadMore();
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 },
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [sentinelRef, h.hasMore, h.loadingMore, h.loading, h.loadMore]);

  // Map API items to table shape
  const tableItems = h.data.items.map((it) => ({
    id: it.id,
    bookName: it.bookName,
    chapter: it.chapter,
    verseNumber: it.verseNumber,
    explanation: it.exegesis?.explanationText || "",
    learnMore: (it as any).studyMetadata?.introduction || (it as any).studyMetadata?.finalThoughts || undefined,
    isPublished: typeof (it as any).isPublished === "boolean" ? (it as any).isPublished : true,
    bibleVersion: it.bibleVersion || "BSB",
    createdOn: it.createdOn,
  }));

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="Verse Explanations Manager"
        subtitle={`${h.data.totalCount || 0} explanation${(h.data.totalCount || 0) !== 1 ? "s" : ""}`}
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
        onAdd={() => navigate("/admin/add-verse-explanation")}
        addLabel="Add"
      />

      <AdminPageContent>
        <AdminSearchBar value={h.search} onChange={h.setSearch} placeholder="Search by book name..." />

        {h.loading && h.data.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.data.items.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="w-12 h-12" />}
            title="No explanations found"
            description={h.search ? `No results for "${h.search}"` : undefined}
            actionLabel="Add Explanation"
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
