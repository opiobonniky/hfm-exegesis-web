// BookPrologueDetail — thin page composing hook + components (no inline HTML)
"use client";

import { ScrollText } from "lucide-react";
import { useBookPrologueDetail } from "../hooks/useBookPrologueDetail";
import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { PrologueDetailContent } from "../components/PrologueDetailContent";

export default function BookPrologueDetail() {
  const h = useBookPrologueDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.item) return null;

  const p = h.item;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<ScrollText className="w-5 h-5 text-primary" />}
        title={p.bookName}
        subtitle={p.title || p.bookName}
        badge={{
          label: p.isPublished !== false ? "Published" : "Draft",
          variant: p.isPublished !== false ? "default" : "secondary",
        }}
        onBack={() => h.navigate("/admin/book-prologues")}
      />

      <DetailContent>
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

        <DetailBackButton label="Back to Prologues" onClick={() => h.navigate("/admin/book-prologues")} />
      </DetailContent>
    </div>
  );
}
