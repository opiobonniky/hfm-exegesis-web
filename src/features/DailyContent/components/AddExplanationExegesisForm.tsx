import { Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AddExplanationExegesisFormProps } from "../types";
import { CharCount } from "./CharCount";
import { tt } from '@/components/languages/hardcodedTranslate';

const EXPLANATION_MAX = 20000;
const APPLICATION_MAX = 10000;

export function AddExplanationExegesisForm({ explanationText, applicationText, errors = {}, updateNested }: AddExplanationExegesisFormProps) {
  const h = {
    form: { exegesis: { explanationText, applicationText } },
    updateNested,
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">{tt("Main explanation")}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold text-foreground">{tt("Explanation")}</Label>
          <CharCount value={h.form.exegesis.explanationText} max={EXPLANATION_MAX} />
        </div>
        <p className="text-xs text-muted-foreground">{tt("Give the core theological insight, interpretive flow, and supporting detail for the verse.")}</p>
        <Textarea
          aria-invalid={!!errors.explanationText}
          aria-describedby={errors.explanationText ? "explanation-error" : undefined}
          placeholder={tt("Type the heart of the explanation here...")}
          value={h.form.exegesis.explanationText}
          onChange={(e) => h.updateNested("exegesis", "explanationText", e.target.value)}
          rows={16}
          maxLength={EXPLANATION_MAX}
          className={`resize-y border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.explanationText ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {errors.explanationText && <p id="explanation-error" role="status" className="text-xs text-destructive">{tt(errors.explanationText)}</p>}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{tt("Minimum 20 characters")}</span>
          <span>{h.form.exegesis.explanationText.trim().length}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold text-foreground">{tt("Application")}</Label>
          <CharCount value={h.form.exegesis.applicationText} max={APPLICATION_MAX} />
        </div>
        <Textarea
          aria-invalid={!!errors.applicationText}
          aria-describedby={errors.applicationText ? "application-error" : undefined}
          placeholder={tt("How should this truth shape daily living?")}
          value={h.form.exegesis.applicationText}
          onChange={(e) => h.updateNested("exegesis", "applicationText", e.target.value)}
          rows={10}
          maxLength={APPLICATION_MAX}
          className={`resize-y border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.applicationText ? "border-destructive focus-visible:ring-destructive" : ""}`}
        />
        {errors.applicationText && <p id="application-error" role="status" className="text-xs text-destructive">{tt(errors.applicationText)}</p>}
      </div>
    </div>
  );
}
