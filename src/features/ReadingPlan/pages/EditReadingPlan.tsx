"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEditReadingPlanPage } from "../hooks/useEditReadingPlanPage";
import { EditPlanMetaSection } from "../components/EditPlanMetaSection";
import { EditPlanDaysSection } from "../components/EditPlanDaysSection";
import { EditQuizDeleteModal } from "../components/EditQuizDeleteModal";
import { PageLoadingState } from "../components";
import { SaveButton } from "../components/SaveButton";

export default function EditReadingPlan() {
  const p = useEditReadingPlanPage();

  if (p.loading) return <PageLoadingState />;
  if (!p.meta) return <PageLoadingState message="Plan not found" />;

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Edit reading plan.">
      <PageLayout isRtl={false} accentColor="teal">
        <PageHeader
          back="Back"
          onBack={() => p.navigate(-1)}
          title="Edit Plan"
          action={
            <SaveButton
              label={p.savingMeta ? "Saving..." : "Save"}
              loading={p.savingMeta}
              onClick={p.handleSaveMeta}
            />
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
