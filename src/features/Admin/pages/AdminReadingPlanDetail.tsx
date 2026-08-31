// AdminReadingPlanDetail — thin page composing hook + components (no inline HTML)
"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminReadingPlanDetail } from "../hooks/useAdminReadingPlanDetail";
import { ReadingPlanDetailHeader } from "../components/ReadingPlanDetailHeader";
import { ReadingPlanInfoCard } from "../components/ReadingPlanInfoCard";
import { ReadingPlanAssignmentsCard } from "../components/ReadingPlanAssignmentsCard";
import { ReadingPlanQuizCard } from "../components/ReadingPlanQuizCard";

export default function AdminReadingPlanDetail() {
  const h = useAdminReadingPlanDetail();

  if (h.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      <ReadingPlanDetailHeader
        planId={h.item.planId || ""}
        isPublished={h.item.isPublished ?? true}
        onBack={() => h.navigate("/admin/reading-plans")}
      />

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
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

        {h.item.createdOn && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Created</p>
                <p>{new Date(h.item.createdOn).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => h.navigate("/admin/reading-plans")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reading Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
