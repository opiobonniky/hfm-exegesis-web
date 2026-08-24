import { ArrowRight, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PLAN_CATEGORIES, PLAN_DIFFICULTIES, INPUT_CLS, TEXTAREA_CLS } from "../constants";
import type { PlanMeta } from "../hooks/useAddReadingPlanPage";

interface Props {
  meta: PlanMeta;
  updateMeta: <K extends keyof PlanMeta>(key: K, val: PlanMeta[K]) => void;
  onNext: () => void;
  t: any;
}
export function PlanStepMeta({ meta, updateMeta, onNext, t }: Props) {
  const tl = (key: string) => t.readingPlan[key as keyof typeof t.readingPlan] as string;
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="px-6 py-4 border-b border-border/50 bg-muted/50">
        <h2 className="font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />{t.readingPlan.planDetails}
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">{t.readingPlan.planDetailsDesc}</p>
      </div>
      <div className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground/80">{t.common.title} <span className="text-red-500">*</span></label>
          <input value={meta.title} onChange={(e) => updateMeta("title", e.target.value)} placeholder={t.readingPlan.titlePlaceholder} className={INPUT_CLS} />
        </div>
          <label className="text-sm font-semibold text-foreground/80">{t.readingPlan.description}</label>
          <textarea value={meta.description} onChange={(e) => updateMeta("description", e.target.value)} placeholder={t.readingPlan.descriptionPlaceholder} rows={3} className={TEXTAREA_CLS} />
          <label className="text-sm font-semibold text-foreground/80">{t.readingPlan.totalDays} <span className="text-red-500">*</span></label>
          <input type="number" min={1} max={365} value={meta.totalDays} onChange={(e) => updateMeta("totalDays", Math.max(1, parseInt(e.target.value) || 1))} className={cn(INPUT_CLS, "w-32")} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">{t.readingPlan.category}</label>
            <Select value={meta.category} onValueChange={(v) => updateMeta("category", v)}>
              <SelectTrigger className="rounded-xl border-border focus:ring-teal-400/30 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLAN_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{tl(c.labelKey)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
            <label className="text-sm font-semibold text-foreground/80">{t.readingPlan.difficulty}</label>
            <Select value={meta.difficulty} onValueChange={(v) => updateMeta("difficulty", v)}>
                {PLAN_DIFFICULTIES.map((d) => (
                  <SelectItem key={d.value} value={d.value}>{tl(d.labelKey)}</SelectItem>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-muted">
          <div>
            <p className="text-sm font-semibold text-foreground/80">{t.readingPlan.quizQuestions}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{t.readingPlan.quizDesc}</p>
          <Switch checked={meta.questionsEnabled} onCheckedChange={(v) => updateMeta("questionsEnabled", v)} />
        <div className="flex justify-end pt-2">
          <button type="button" onClick={onNext} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all hover:-translate-y-px">
            {t.readingPlan.stepDailyContent} <ArrowRight className="w-4 h-4" />
          </button>
    </div>
  );
