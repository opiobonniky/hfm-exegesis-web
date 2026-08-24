"use client";

import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddReadingPlanPage } from "../hooks/useAddReadingPlanPage";
import { PlanStepIndicator } from "../components/PlanStepIndicator";
import { PlanStepMeta } from "../components/PlanStepMeta";
import { PlanStepDays } from "../components/PlanStepDays";
import { PlanStepReview } from "../components/PlanStepReview";
const AddReadingPlan = () => {
  const h = useAddReadingPlanPage();
  const { t, isRtl } = h;
  const { step, setStep, submitting, meta, updateMeta, days, expandedDay, setExpandedDay, handleUpdateDay, goToStep2, goToStep3, handleSubmit } = h;
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        <div className="flex items-center gap-4">
          <Link to="/reading-plans" className="text-muted-foreground/70 hover:text-foreground/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors">
            <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />{t.common.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {t.readingPlan.createPlanTitle}
              </h1>
              <p className="text-muted-foreground/70 text-xs mt-0.5 font-medium">{t.readingPlan.adminPlanBuilder}</p>
          </div>
        </div>
        <PlanStepIndicator currentStep={step} t={t} />
        {step === 1 && <PlanStepMeta meta={meta} updateMeta={updateMeta} onNext={goToStep2} t={t} />}
        {step === 2 && (
          <PlanStepDays
            meta={meta} days={days} expandedDay={expandedDay} setExpandedDay={setExpandedDay}
            handleUpdateDay={handleUpdateDay} onPrev={() => setStep(1)} onNext={goToStep3} t={t} isRtl={isRtl}
          />
        )}
        {step === 3 && (
          <PlanStepReview
            meta={meta} days={days} submitting={submitting}
            onPrev={() => setStep(2)} onSubmit={handleSubmit} t={t} isRtl={isRtl}
      </div>
    </div>
  );
};
export default AddReadingPlan;
