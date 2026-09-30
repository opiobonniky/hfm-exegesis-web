import { CheckCircle2, Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { tt } from '@/components/languages/hardcodedTranslate';

interface Reflection { id: number; question: string; reflectionText: string; }

interface Props {
  reflections: Reflection[];
  onAnswerChange: (id: number, value: string) => void;
}

export default function DailyReadingReflections({ reflections, onAnswerChange }: Props) {
  if (!reflections.length) return null;
  return (
    <div className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-bold"><Lightbulb className="h-4 w-4 text-amber-500" />{tt("Reflect and respond")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{tt("Write a response to each prompt. Drafts are saved on this device.")}</p>
      </div>
      {reflections.map((r) => {
        const answered = r.reflectionText.trim().length > 0;
        return (
          <div key={r.id} className={`rounded-2xl border bg-card p-4 transition-colors ${answered ? "border-green-300/80" : "border-border/60"}`}>
            <div className="mb-3 flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{r.id + 1}</span>
              <p className="pt-0.5 text-sm font-semibold leading-relaxed">{r.question}</p>
              {answered && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-green-600" />}
            </div>
            <Textarea
              value={r.reflectionText}
              onChange={(event) => onAnswerChange(r.id, event.target.value)}
              placeholder={tt("Write what stood out to you, what it means, or how you will apply it...")}
              rows={4}
              className="min-h-28 resize-y"
              aria-label={`Response to reflection ${r.id + 1}`}
            />
            <p className="mt-2 text-right text-[11px] text-muted-foreground">{r.reflectionText.trim().length}{tt("characters")}</p>
          </div>
        );
      })}
    </div>
  );
}
