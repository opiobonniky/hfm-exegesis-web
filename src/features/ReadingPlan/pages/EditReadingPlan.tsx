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
  const { data, actions } = p;

  if (data.loading) return <PageLoadingState />;
  if (!data.meta) return <PageLoadingState message="Plan not found" />;

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Edit reading plan.">
      <PageLayout isRtl={false} accentColor="teal">
        <PageHeader
          back="Back"
          onBack={() => data.navigate(-1)}
          title="Edit Plan"
          action={
            <SaveButton
              label={data.savingMeta ? "Saving..." : "Save"}
              loading={data.savingMeta}
              onClick={actions.handleSaveMeta}
            />
          }
        />

        <EditPlanMetaSection meta={data.meta} updateMeta={actions.updateMeta} />

        <EditPlanDaysSection
          days={data.days}
          expandedDay={data.expandedDay}
          setExpandedDay={actions.setExpandedDay}
          updateDay={actions.updateDay}
          updateChapter={actions.updateChapter}
          handleSaveDay={actions.handleSaveDay}
          savingDay={data.savingDay}
          setDeleteQuizTarget={actions.setDeleteQuizTarget}
        />

        <EditQuizDeleteModal
          visible={!!data.deleteQuizTarget}
          deleting={data.deletingQuiz}
          onConfirm={actions.handleDeleteQuiz}
          onCancel={() => actions.setDeleteQuizTarget(null)}
        />
      </PageLayout>
    </Gate>
  );
}
