"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { useEditReadingPlanPage } from "../hooks/useEditReadingPlanPage";
import { EditPlanMetaSection } from "../components/EditPlanMetaSection";
import { EditPlanDaysSection } from "../components/EditPlanDaysSection";
import { EditQuizDeleteModal } from "../components/EditQuizDeleteModal";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditReadingPlan() {
  const p = useEditReadingPlanPage();

  if (p.loading) return <div className="min-h-screen bg-background flex items-center justify-center"><LoadingState /></div>;
  if (!p.meta) return <div className="min-h-screen bg-background flex items-center justify-center"><LoadingState message="Plan not found" /></div>;

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Edit reading plan.">
      <PageLayout isRtl={false} accentColor="teal">
        <PageHeader
          back="Back"
          onBack={() => p.navigate(-1)}
          title="Edit Plan"
          action={
            <Button size="sm" onClick={p.handleSaveMeta} disabled={p.savingMeta} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> {p.savingMeta ? "Saving..." : "Save"}
            </Button>
          }
        />

        <EditPlanMetaSection meta={p.meta} updateMeta={p.updateMeta} />

        <EditPlanDaysSection
          days={p.days}
          expandedDay={p.expandedDay}
          setExpandedDay={p.setExpandedDay}
          updateDay={p.updateDay}
          updateChapter={p.updateChapter}
          handleSaveDay={p.handleSaveDay}
          savingDay={p.savingDay}
          setDeleteQuizTarget={p.setDeleteQuizTarget}
        />

        <EditQuizDeleteModal
          visible={!!p.deleteQuizTarget}
          deleting={p.deletingQuiz}
          onConfirm={p.handleDeleteQuiz}
          onCancel={() => p.setDeleteQuizTarget(null)}
        />
      </PageLayout>
    </Gate>
  );
}
