import { CheckCircle2, Sparkles } from "lucide-react";
import type { ReturnType } from "react";
import { useAddExplanation } from "../hooks/useAddExplanation";

type Model = ReturnType<typeof useAddExplanation>;

interface Props {
  model: Model;
  completionPercent: number;
}

export function AddExplanationProgressCard({ model: h, completionPercent }: Props) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Verse reference</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {h.form.bookName ? `${h.form.bookName} ${h.form.chapter || "?"}:${h.form.verseNumber || "?"}` : "Choose a passage"}
            </h2>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {completionPercent}% complete
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 transition-all" style={{ width: `${completionPercent}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-100">
        <div className="flex items-center gap-2 text-sky-700 dark:text-sky-200">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs uppercase tracking-[0.22em]">Quick notes</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-sky-800 dark:text-sky-100">
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" /> Reference the verse before writing the insight.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" /> Keep the explanation clear and practical.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" /> Add cross-references and themes to enrich study.</li>
        </ul>
      </div>
    </div>
  );
}
