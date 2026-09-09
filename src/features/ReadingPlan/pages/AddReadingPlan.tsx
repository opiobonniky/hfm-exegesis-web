"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { useAddReadingPlanPage } from "../hooks/useAddReadingPlanPage";
import { PlanStepIndicator } from "../components/PlanStepIndicator";
import { PlanStepMeta } from "../components/PlanStepMeta";
import { PlanStepDays } from "../components/PlanStepDays";
import { PlanStepReview } from "../components/PlanStepReview";
import { BookOpen } from "lucide-react";

export default function AddReadingPlan() {
  const { data, actions } = useAddReadingPlanPage();

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Create a new reading plan.">
      <PageLayout isRtl={data.isRtl} accentColor="teal">
        <PageHeader
          back={data.t.common?.back || "Back"}
          onBack={() => data.navigate("/reading-plans")}
          icon={<BookOpen className="h-5 w-5 text-teal-700" />}
          iconBg="bg-teal-100"
          title={data.t.readingPlan?.createPlanTitle || "Create Plan"}
          subtitle={data.t.readingPlan?.adminPlanBuilder || "Plan Builder"}
        />

        <PlanStepIndicator currentStep={data.step} t={data.t} />

        {data.step === 1 && (
          <PlanStepMeta meta={data.meta} updateMeta={actions.updateMeta} onNext={actions.goToStep2} t={data.t} />
        )}
        {data.step === 2 && (
          <PlanStepDays
            meta={data.meta} days={data.days} expandedDay={data.expandedDay} setExpandedDay={actions.setExpandedDay}
            handleUpdateDay={actions.handleUpdateDay} onPrev={() => actions.setStep(1)} onNext={actions.goToStep3} t={data.t} isRtl={data.isRtl}
          />
        )}
        {data.step === 3 && (
          <PlanStepReview
            meta={data.meta} days={data.days} submitting={data.submitting}
            onPrev={() => actions.setStep(2)} onSubmit={actions.handleSubmit} t={data.t} isRtl={data.isRtl}
          />
        )}
      </PageLayout>
    </Gate>
  );
}
