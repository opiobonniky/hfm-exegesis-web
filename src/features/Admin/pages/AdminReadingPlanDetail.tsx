// AdminReadingPlanDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useAdminReadingPlanDetail } from "../hooks/useAdminReadingPlanDetail";
import { DetailLoading, DetailPageHeader, DetailContent, DetailBackButton } from "../components/DetailPageLayout";
import { DetailMetadataGrid } from "../components/DetailSection";
import { ReadingPlanInfoCard } from "../components/ReadingPlanInfoCard";
import { ReadingPlanAssignmentsCard } from "../components/ReadingPlanAssignmentsCard";
import { ReadingPlanQuizCard } from "../components/ReadingPlanQuizCard";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function AdminReadingPlanDetail() {
  const h = useAdminReadingPlanDetail();

  if (h.loading) return <DetailLoading />;
  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<Calendar className="w-5 h-5 text-primary" />}
        title={h.item.title}
        subtitle={h.item.category || undefined}
        badge={h.item.isPublished !== undefined ? {
          label: h.item.isPublished ? "Published" : "Draft",
          variant: h.item.isPublished ? "default" : "secondary",
        } : undefined}
        onBack={() => h.navigate("/admin/reading-plans")}
      />

      <DetailContent>
        <ReadingPlanInfoCard
          title={h.item.title}
          category={h.item.category}
          durationDays={h.item.durationDays}
          description={h.item.description}
        />

        {h.item.assignments && h.item.assignments.length > 0 && (
          <ReadingPlanAssignmentsCard assignments={h.item.assignments} />
        )}

        {h.item.questions && h.item.questions.length > 0 && (
          <ReadingPlanQuizCard questions={h.item.questions} />
        )}

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: h.item.createdOn, format: "datetime" },
          ]}
        />

        <DetailBackButton label="Back to Reading Plans" onClick={() => h.navigate("/admin/reading-plans")} />
      </DetailContent>
    </div>
  );
}
