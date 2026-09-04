// BookPrologueDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useBookPrologueDetail } from "../hooks/useBookPrologueDetail";
import { DetailLoading, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { PrologueDetailContent } from "../components/PrologueDetailContent";
import { BookPrologueHero } from "../components/BookPrologueHero";
import { BookProloguePageShell } from "../components/BookProloguePageShell";

export default function BookPrologueDetail() {
  const h = useBookPrologueDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.item) return null;

  const p = h.item;

  return (
    <div className="min-h-screen bg-background">
      <BookProloguePageShell>
        <BookPrologueHero
          item={p}
          onBack={() => h.navigate("/admin/book-prologues")}
          onEdit={() =>
            h.navigate(`/admin/edit-book-prologue/${encodeURIComponent(p.bookName)}`)
          }
        />

        <DetailContent className="max-w-5xl mx-auto px-0 py-0 space-y-4 sm:space-y-5">
          <PrologueDetailContent item={p} />

          <DetailMetadataGrid
            fields={[
              { label: "Date Written", value: p.dateWritten },
              { label: "Location", value: p.locationWritten },
              { label: "Created By", value: p.createdBy },
              { label: "Created", value: p.createdOn, format: "datetime" },
              { label: "Updated", value: p.updatedOn, format: "datetime" },
            ]}
          />

          <DetailBackButton
            label="Back to Prologues"
            onClick={() => h.navigate("/admin/book-prologues")}
          />
        </DetailContent>
      </BookProloguePageShell>
    </div>
  );
}
