// BookPrologueDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useBookPrologueDetail } from "../hooks/useBookPrologueDetail";
import { DetailLoading, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { PrologueDetailContent } from "../components/PrologueDetailContent";
import { BookPrologueHero } from "../components/BookPrologueHero";
import { BookProloguePageShell } from "../components/BookProloguePageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { tt } from '@/components/languages/hardcodedTranslate';

export default function BookPrologueDetail() {
  const { data, actions } = useBookPrologueDetail();

  if (data.loading) return <DetailLoading />;
  if (!data.bookName) return (
    <EmptyState
      title={tt("Book Prologue Not Found")}
      message="The requested book prologue could not be found."
      actionLabel={tt("Go back")}
      onAction={() => actions.navigate(-1)}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <BookProloguePageShell>
        <BookPrologueHero
          item={data}
          onBack={() => actions.navigate("/admin/book-prologues")}
          onEdit={() =>
            actions.navigate(`/admin/edit-book-prologue/${encodeURIComponent(data.bookName)}`)
          }
        />

        <DetailContent className="max-w-5xl mx-auto px-0 py-0 space-y-4 sm:space-y-5">
          <PrologueDetailContent item={data} />

          <DetailMetadataGrid
            fields={[
              { label: tt("Date Written"), value: data.dateWritten },
              { label: tt("Location"), value: data.locationWritten },
              { label: tt("Created By"), value: data.createdBy },
              { label: tt("Created"), value: data.createdOn, format: "datetime" },
              { label: tt("Updated"), value: data.updatedOn, format: "datetime" },
            ]}
          />

          <DetailBackButton
            label={tt("Back to Prologues")}
            onClick={() => actions.navigate("/admin/book-prologues")}
          />
        </DetailContent>
      </BookProloguePageShell>
    </div>
  );
}
