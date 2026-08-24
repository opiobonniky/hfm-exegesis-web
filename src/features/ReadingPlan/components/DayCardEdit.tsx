import {
  CheckCircle2, ChevronDown, ChevronUp, CircleDot, HelpCircle, Plus, Trash2, X,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { BIBLE_BOOKS, INPUT_CLS, TEXTAREA_CLS } from "../constants";
import { emptyQuiz, isDayComplete, isDayPartial } from "../hooks/useAddReadingPlanPage";
import type { DayAssignment, Chapter, QuizQuestion } from "../types";

export interface DayCardEditProps {
  day: DayAssignment;
  dayIdx: number;
  isOpen: boolean;
  questionsEnabled: boolean;
  onToggle: () => void;
  onUpdateDay: (dayIdx: number, patch: Partial<DayAssignment>) => void;
}
export function DayCardEdit({
  day, dayIdx, isOpen, questionsEnabled, onToggle, onUpdateDay,
}: DayCardEditProps) {
  const { t } = useLanguage();
  const complete = isDayComplete(day);
  const partial = isDayPartial(day);
  const addChapter = () =>
    onUpdateDay(dayIdx, { chapters: [...day.chapters, { book: "", chapter: 1 }] });
  const removeChapter = (ci: number) =>
    onUpdateDay(dayIdx, { chapters: day.chapters.filter((_, x) => x !== ci) });
  const updateChapter = (ci: number, p: Partial<Chapter>) =>
    onUpdateDay(dayIdx, {
      chapters: day.chapters.map((c, x) => (x === ci ? { ...c, ...p } : c)),
    });
  const addReflection = () =>
    onUpdateDay(dayIdx, { reflectionQuestions: [...day.reflectionQuestions, ""] });
  const removeReflection = (ri: number) =>
    onUpdateDay(dayIdx, { reflectionQuestions: day.reflectionQuestions.filter((_, x) => x !== ri) });
  const updateReflection = (ri: number, v: string) =>
      reflectionQuestions: day.reflectionQuestions.map((r, x) => (x === ri ? v : r)),
  const addQuiz = () =>
    onUpdateDay(dayIdx, { quizQuestions: [...day.quizQuestions, emptyQuiz()] });
  const removeQuiz = (qi: number) =>
    onUpdateDay(dayIdx, { quizQuestions: day.quizQuestions.filter((_, x) => x !== qi) });
  const updateQuiz = (qi: number, patch: Partial<QuizQuestion>) =>
      quizQuestions: day.quizQuestions.map((q, x) => (x === qi ? { ...q, ...patch } : q)),
  const updateQuizOption = (qi: number, oi: number, val: string) => {
    const opts = [...day.quizQuestions[qi].options] as [string, string, string, string];
    opts[oi] = val;
    updateQuiz(qi, { options: opts });
  };
  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isOpen
          ? "border-teal-300 bg-card shadow-[0_2px_8px_rgba(20,184,166,0.12)]"
          : complete
            ? "border-emerald-200 bg-emerald-50/30"
            : partial
              ? "border-amber-200 bg-amber-50/30"
              : "border-border/50 bg-card",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/60 transition-colors"
      >
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            complete ? "bg-emerald-100 text-emerald-700"
              : partial ? "bg-amber-100 text-amber-700"
                : "bg-muted text-muted-foreground",
          )}
        >
          {complete ? <CheckCircle2 className="w-4 h-4" /> : day.dayNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", complete ? "text-foreground" : "text-muted-foreground")}>
            {day.title || `Day ${day.dayNumber}`}
          </p>
          {complete && (
            <p className="text-xs text-muted-foreground/70 truncate">
              {day.chapters.filter((c) => c.book).map((c) => `${c.book} ${c.chapter}`).join(", ")}
            </p>
        <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] text-emerald-600 font-bold border border-emerald-200 bg-emerald-50 rounded px-1.5 py-0.5">
              {t.readingPlan.readyLabel}
            </span>
          {partial && (
            <span className="text-[10px] text-amber-600 font-bold border border-amber-200 bg-amber-50 rounded px-1.5 py-0.5">
              {t.readingPlan.partialLabel}
          {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground/70" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/70" />}
      </button>
      {isOpen && (
        <div className="border-t border-border/50 p-4 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground/80">
              {t.readingPlan.dayTitle} <span className="text-red-500">*</span>
            </label>
            <input
              value={day.title}
              onChange={(e) => onUpdateDay(dayIdx, { title: e.target.value })}
              placeholder={t.readingPlan.dayTitlePlaceholder}
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-2">
              {t.readingPlan.chapters} <span className="text-red-500">*</span>
            {day.chapters.map((ch, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <Select value={ch.book} onValueChange={(v) => updateChapter(ci, { book: v })}>
                  <SelectTrigger className="flex-1 rounded-xl border-border bg-card text-sm focus:ring-teal-400/30">
                    <SelectValue placeholder={t.readingPlan.bookPlaceholder} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {BIBLE_BOOKS.map((b) => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="number"
                  min={1}
                  value={ch.chapter}
                  onChange={(e) => updateChapter(ci, { chapter: parseInt(e.target.value) || 1 })}
                  className={cn(INPUT_CLS, "w-20 text-center")}
                  placeholder={t.readingPlan.chapterShort}
                />
                {day.chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(ci)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground/70 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addChapter} className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold mt-1 transition-colors">
              <Plus className="w-3.5 h-3.5" />{t.readingPlan.addChapter}
            </button>
            <label className="text-sm font-semibold text-foreground/80">{t.readingPlan.reflectionQuestions}</label>
            {day.reflectionQuestions.map((q, ri) => (
              <div key={ri} className="flex items-center gap-2">
                  value={q}
                  onChange={(e) => updateReflection(ri, e.target.value)}
                  placeholder={`${t.readingPlan.reflectionQuestions} ${ri + 1}`}
                  className={cn(INPUT_CLS, "flex-1")}
                {day.reflectionQuestions.length > 1 && (
                    onClick={() => removeReflection(ri)}
            <button type="button" onClick={addReflection} className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" />{t.readingPlan.addReflection}
          {questionsEnabled && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-500" />{t.readingPlan.quizQuestions}
              </label>
              {day.quizQuestions.map((quiz, qi) => (
                <div key={qi} className="rounded-xl border border-border/50 bg-muted p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Q{qi + 1}</span>
                    <button type="button" onClick={() => removeQuiz(qi)} className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground/70 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={quiz.question}
                    onChange={(e) => updateQuiz(qi, { question: e.target.value })}
                    placeholder={t.readingPlan.questionPlaceholder}
                    rows={2}
                    className={TEXTAREA_CLS}
                  />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {quiz.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuiz(qi, { correctAnswer: oi })}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            quiz.correctAnswer === oi ? "border-teal-500 bg-teal-500" : "border-border hover:border-teal-400",
                          )}
                        >
                          {quiz.correctAnswer === oi && <CircleDot className="w-3 h-3 text-white" />}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => updateQuizOption(qi, oi, e.target.value)}
                          placeholder={t.readingPlan.optionLabel.replace("{n}", String(oi + 1))}
                          className={cn(INPUT_CLS, "flex-1", quiz.correctAnswer === oi && "border-teal-400 ring-1 ring-teal-400/30")}
                        />
                      </div>
                    value={quiz.explanation}
                    onChange={(e) => updateQuiz(qi, { explanation: e.target.value })}
                    placeholder={`${t.readingPlan.explanation} (${t.userManagement.optional.toLowerCase()})`}
                </div>
              ))}
              <button type="button" onClick={addQuiz} className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                <Plus className="w-3.5 h-3.5" />{t.readingPlan.addQuestion}
              </button>
            </div>
    </div>
  );
