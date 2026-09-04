// VerseExplanationDetail — thin page composing hook + components (no inline HTML)
"use client";

import { Lightbulb } from "lucide-react";
import { useVerseExplanationDetail } from "../hooks/useVerseExplanationDetail";
import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { VerseExplanationDetailContent } from "../components/VerseExplanationDetailContent";

export default function VerseExplanationDetail() {
  const h = useVerseExplanationDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<Lightbulb className="w-5 h-5 text-primary" />}
        title="Verse Explanation"
        subtitle={`${h.item.bookName} ${h.item.chapter}:${h.item.verseNumber}`}
        badge={{
          label: h.item.isPublished !== false ? "Published" : "Draft",
          variant: h.item.isPublished !== false ? "default" : "secondary",
        }}
        onBack={() => h.navigate("/admin/verse-explanations")}
        containerClassName="max-w-full mx-auto px-3 sm:px-4 lg:px-6"
      />

      <DetailContent className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <VerseExplanationDetailContent item={h.item} />

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: h.item.createdOn, format: "datetime" },
            { label: "Updated", value: h.item.updatedOn, format: "datetime" },
          ]}
        />

        <DetailBackButton label="Back to Explanations" onClick={() => h.navigate("/admin/verse-explanations")} />
      </DetailContent>
    </div>
  );
}
