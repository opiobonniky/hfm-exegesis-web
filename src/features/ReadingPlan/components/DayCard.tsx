"use client";

import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { SectionLabel } from "./PlanDetailUI";
import type { DayAssignment } from "../types";

interface DayCardProps {
  day: DayAssignment;
  isCompleted: boolean;
  questionsEnabled: boolean;
}

export default function DayCard({ day, isCompleted, questionsEnabled }: DayCardProps) {
  const [open, setOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState<number | null>(null);
  const { t } = useLanguage();
  const hasChapters = day.chapters?.some((c) => c.book);
  const hasReflections = day.reflectionQuestions?.some((r) => r.trim());
  const hasQuiz = day.quizQuestions?.length > 0;
  const exists = day.exists ?? false;

  if (!exists) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-background">
        <div className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-xs font-bold text-muted-foreground/70 shrink-0">
          {day.dayNumber}
        </div>
        <p className="text-xs text-muted-foreground italic">
          {t.readingPlan.day} {day.dayNumber} — {t.readingPlan.dayNotConfigured}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-colors duration-200 bg-card",
        isCompleted
          ? "border-emerald-200 bg-emerald-50/60"
          : open
            ? "border-violet-200 bg-violet-50/50"
            : "border-border",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
            isCompleted
              ? "bg-emerald-100 border-emerald-200 text-emerald-700"
              : "bg-violet-100 border-violet-200 text-violet-700",
          )}
        >
          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : day.dayNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground/80 truncate group-hover:text-foreground transition-colors">
            {day.title || `Day ${day.dayNumber}`}
          </p>
          {hasChapters && (
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {day.chapters
                .filter((c) => c.book)
                .map((c) => `${c.book} ${c.startChapter ?? c.chapter}`)
                .join(" · ")}
            </p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          {hasReflections && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-sky-200 bg-sky-50 text-sky-700">
              <MessageSquare className="w-2.5 h-2.5" />
              {day.reflectionQuestions.filter((r) => r.trim()).length}
            </span>
          )}
          {questionsEnabled && hasQuiz && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border border-amber-200 bg-amber-50 text-amber-700">
              <HelpCircle className="w-2.5 h-2.5" />
              {day.quizQuestions.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground/70 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-5">
          <div>
            <SectionLabel>{t.readingPlan.scriptureReading}</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {day.chapters
                .filter((c) => c.book)
                .map((ch, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-xs font-medium text-violet-700"
                  >
                    <BookOpen className="w-3 h-3 opacity-70" />
                    {ch.book} {ch.chapter}
                  </div>
                ))}
            </div>
          </div>

          {hasReflections && (
            <div>
              <SectionLabel>{t.readingPlan.reflectionQuestions}</SectionLabel>
              <div className="space-y-2">
                {day.reflectionQuestions
                  .filter((r) => r.trim())
                  .map((q, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className="mt-0.5 w-5 h-5 rounded-full border border-sky-200 bg-sky-50 text-[10px] font-bold text-sky-700 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {questionsEnabled && hasQuiz && (
            <div>
              <SectionLabel>
                {t.readingPlan.quizQuestionsLabel.replace("{n}", String(day.quizQuestions.length))}
              </SectionLabel>
              <div className="space-y-2">
                {day.quizQuestions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-border bg-muted/70 overflow-hidden">
                    <button
                      onClick={() => setQuizOpen(quizOpen === qi ? null : qi)}
                      className="w-full flex items-start gap-2.5 px-3 py-3 text-left"
                    >
                      <span className="w-5 h-5 rounded-full border border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="flex-1 text-sm text-foreground/80 leading-snug">{q.question}</p>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-muted-foreground/70 shrink-0 mt-0.5 transition-transform",
                          quizOpen === qi && "rotate-180",
                        )}
                      />
                    </button>
                    {quizOpen === qi && (
                      <div className="border-t border-border px-3 pb-3 pt-2.5 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {q.options.map((opt, oi) => (
                            <div
                              key={oi}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs",
                                oi === q.correctAnswer
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-border bg-card text-muted-foreground",
                              )}
                            >
                              {oi === q.correctAnswer ? (
                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border border-border shrink-0" />
                              )}
                              {opt}
                            </div>
                          ))}
                        </div>
                        {q.explanation && (
                          <div className="px-2.5 py-2 rounded-lg bg-indigo-50 border border-indigo-200">
                            <p className="text-[10px] font-semibold text-indigo-700 mb-0.5 uppercase tracking-wider">
                              {t.readingPlan.explanation}
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}