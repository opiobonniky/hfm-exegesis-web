"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useEditReadingPlanPage } from "../hooks/useEditReadingPlanPage";
import { EditPlanMetaSection } from "../components/EditPlanMetaSection";
import { EditPlanDaysSection } from "../components/EditPlanDaysSection";
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
          questionsEnabled={data.meta.questionsEnabled}
          updateDay={actions.updateDay}
          handleSaveDay={actions.handleSaveDay}
          savingDay={data.savingDay}
        />
      </PageLayout>
    </Gate>
  );
}
