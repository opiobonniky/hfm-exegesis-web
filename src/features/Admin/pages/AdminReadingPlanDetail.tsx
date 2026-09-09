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
  const { data, actions } = useAdminReadingPlanDetail();

  if (data.loading) return <DetailLoading />;
  if (!data.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <DetailPageHeader
        icon={<Calendar className="w-5 h-5 text-primary" />}
        title={data.item.title}
        subtitle={data.item.category || undefined}
        badge={data.item.isPublished !== undefined ? {
          label: data.item.isPublished ? "Published" : "Draft",
          variant: data.item.isPublished ? "default" : "secondary",
        } : undefined}
        onBack={() => actions.navigate("/admin/reading-plans")}
      />

      <DetailContent>
        <ReadingPlanInfoCard
          title={data.item.title}
          category={data.item.category}
          durationDays={data.item.durationDays}
          description={data.item.description}
        />

        {data.item.assignments && data.item.assignments.length > 0 && (
          <ReadingPlanAssignmentsCard assignments={data.item.assignments} />
        )}

        {data.item.questions && data.item.questions.length > 0 && (
          <ReadingPlanQuizCard questions={data.item.questions} />
        )}

        <DetailMetadataGrid
          fields={[
            { label: "Created", value: data.item.createdOn, format: "datetime" },
          ]}
        />

        <DetailBackButton label="Back to Reading Plans" onClick={() => actions.navigate("/admin/reading-plans")} />
      </DetailContent>
    </div>
  );
}
