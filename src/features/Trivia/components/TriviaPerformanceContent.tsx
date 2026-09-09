import { useState } from "react";
import { BarChart3, CheckCircle2, CircleX, Clock3, Search, Trophy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS } from "../constants";
import { triviaPerformanceTheme as theme } from "../theme/theme";
import type { TriviaAnswerHistory, TriviaPerformanceStats } from "../types";

const statsConfig = [
  ["Answered", "totalAnswered", BarChart3],
  ["Correct", "correct", CheckCircle2],
  ["Incorrect", "incorrect", CircleX],
  ["Accuracy", "percentage", Trophy],
] as const;

export function TriviaPerformanceContent({ stats, answers, hasNext, loadingMore, search, onSearch, onLoadMore }: {
  stats: TriviaPerformanceStats; answers: TriviaAnswerHistory[]; hasNext: boolean; loadingMore: boolean; search: string; onSearch: (value: string) => void; onLoadMore: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {statsConfig.map(([label, key, Icon]) => <div key={label} className={cn(theme.card, "flex items-center gap-3 p-4")}><Icon className="h-5 w-5 text-primary" /><div><p className="text-2xl font-black">{key === "percentage" ? `${stats[key]}%` : stats[key]}</p><p className="text-xs text-muted-foreground">{label}</p></div></div>)}
    </div>
    <section className={cn(theme.card, "p-4 sm:p-6")}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-bold">Answered questions</h2><p className="text-xs text-muted-foreground">Review your recent trivia activity.</p></div><Clock3 className="hidden h-5 w-5 text-primary/60 sm:block" /></div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search answered questions..." className="h-10 w-full rounded-xl border border-primary/15 bg-background/50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
      </div>
      {answers.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No answered trivia questions yet.</p> : <div className="space-y-2">{answers.map((answer) => {
        const expanded = expandedId === answer.id;
        let options: string[] = [];
        try { options = answer.optionsJson ? JSON.parse(answer.optionsJson) : []; } catch { options = []; }
        return <div key={answer.id} className="rounded-xl border border-primary/10 bg-primary/[0.04]">
          <button type="button" onClick={() => setExpandedId(expanded ? null : answer.id)} className="flex w-full items-start gap-3 p-3 text-left">
            <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", answer.isCorrect ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600")}>{answer.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <CircleX className="h-4 w-4" />}</div>
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{answer.question}</p><div className="mt-1 flex flex-wrap gap-2 text-[11px] text-muted-foreground">{answer.category && <span>{answer.category}</span>}{answer.difficulty && <span>{DIFFICULTY_LABELS[answer.difficulty] || answer.difficulty}</span>}<span>{new Date(answer.answeredOn).toLocaleDateString()}</span></div></div>
            <span className={cn("text-xs font-bold", answer.isCorrect ? "text-emerald-600" : "text-rose-600")}>{answer.isCorrect ? "Correct" : "Incorrect"}</span><ChevronDown className={cn("mt-0.5 h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
          </button>
          {expanded && <div className="border-t border-primary/10 px-3 pb-3 pt-3 sm:pl-14">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Answer options</p>
            <div className="space-y-2">{options.map((option, index) => <div key={`${answer.id}-${index}`} className={cn("rounded-lg border px-3 py-2 text-sm", index === answer.correctAnswer && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", index === answer.selectedAnswer && index !== answer.correctAnswer && "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300")}>{option}{index === answer.correctAnswer && " (Correct answer)"}{index === answer.selectedAnswer && index !== answer.correctAnswer && " (Your answer)"}</div>)}</div>
            {answer.explanation && <div className="mt-3 rounded-lg bg-primary/10 p-3 text-sm text-foreground"><span className="font-bold">Explanation: </span>{answer.explanation}</div>}
          </div>}
        </div>;
      })}</div>}
      {hasNext && <button onClick={onLoadMore} disabled={loadingMore} className={cn(theme.primaryButton, "mt-4 w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-60")}>{loadingMore ? "Loading..." : "Load more history"}</button>}
    </section>
  </div>;
}
