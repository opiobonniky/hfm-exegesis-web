"use client";

import Gate from "@/components/Gate";
import { PageLayout } from "@/components/PageLayout";
import { PageHeader } from "@/components/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAddReadingPlanPage } from "../hooks/useAddReadingPlanPage";
import { PlanStepIndicator } from "../components/PlanStepIndicator";
import { PlanStepMeta } from "../components/PlanStepMeta";
import { PlanStepDays } from "../components/PlanStepDays";
import { PlanStepReview } from "../components/PlanStepReview";
import { BookOpen } from "lucide-react";

const AddReadingPlan = () => {
  const { data: h, actions } = useAddReadingPlanPage();

  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Create a new reading plan.">
      <PageLayout isRtl={h.isRtl} accentColor="teal">
        <PageHeader
          back={h.t.common?.back || "Back"}
          onBack={() => h.navigate("/reading-plans")}
          icon={<BookOpen className="h-5 w-5 text-teal-700" />}
          iconBg="bg-teal-100"
          title={h.t.readingPlan?.createPlanTitle || "Create Plan"}
          subtitle={h.t.readingPlan?.adminPlanBuilder || "Plan Builder"}
        />

        <PlanStepIndicator currentStep={h.step} t={h.t} />

        {h.step === 1 && (
          <PlanStepMeta meta={h.meta} updateMeta={actions.updateMeta} onNext={actions.goToStep2} t={h.t} />
        )}
        {h.step === 2 && (
          <PlanStepDays
            meta={h.meta} days={h.days} expandedDay={h.expandedDay} setExpandedDay={actions.setExpandedDay}
            handleUpdateDay={actions.handleUpdateDay} onPrev={() => actions.setStep(1)} onNext={actions.goToStep3} t={h.t} isRtl={h.isRtl}
          />
        )}
        {h.step === 3 && (
          <PlanStepReview
            meta={h.meta} days={h.days} submitting={h.submitting}
            onPrev={() => actions.setStep(2)} onSubmit={actions.handleSubmit} t={h.t} isRtl={h.isRtl}
          />
        )}
      </PageLayout>
    </Gate>
  );
};

export default AddReadingPlan;
