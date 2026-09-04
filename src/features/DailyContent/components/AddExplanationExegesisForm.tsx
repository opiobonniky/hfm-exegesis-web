import { Lightbulb } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ReturnType } from "react";
import { useAddExplanation } from "../hooks/useAddExplanation";
import { CharCount } from "./CharCount";

type Model = ReturnType<typeof useAddExplanation>;

interface Props {
  model: Model;
}

const EXPLANATION_MAX = 20000;
const APPLICATION_MAX = 10000;

export function AddExplanationExegesisForm({ model: h }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <Lightbulb className="h-4 w-4" />
        <span className="text-sm font-medium">Main explanation</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold text-foreground">Explanation</Label>
          <CharCount value={h.form.exegesis.explanationText} max={EXPLANATION_MAX} />
        </div>
        <p className="text-xs text-muted-foreground">Give the core theological insight, interpretive flow, and supporting detail for the verse.</p>
        <Textarea
          placeholder="Type the heart of the explanation here..."
          value={h.form.exegesis.explanationText}
          onChange={(e) => h.updateNested("exegesis", "explanationText", e.target.value)}
          rows={16}
          maxLength={EXPLANATION_MAX}
          className="resize-y border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Minimum 20 characters</span>
          <span>{h.form.exegesis.explanationText.trim().length}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-base font-semibold text-foreground">Application</Label>
          <CharCount value={h.form.exegesis.applicationText} max={APPLICATION_MAX} />
        </div>
        <Textarea
          placeholder="How should this truth shape daily living?"
          value={h.form.exegesis.applicationText}
          onChange={(e) => h.updateNested("exegesis", "applicationText", e.target.value)}
          rows={10}
          maxLength={APPLICATION_MAX}
          className="resize-y border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
