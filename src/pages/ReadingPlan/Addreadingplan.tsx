"use client";

import { useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Chapter {
  book: string;
  chapter: number;
}
interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
}
interface DayAssignment {
  dayNumber: number;
  title: string;
  chapters: Chapter[];
  reflectionQuestions: string[];
  quizQuestions: QuizQuestion[];
}
interface PlanMeta {
  title: string;
  description: string;
  totalDays: number;
  questionsEnabled: boolean;
  category: string;
  difficulty: string;
}

// ─────────────────────────────────────────────
// Constants — module-level so they are never recreated
// ─────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Plan Info", icon: BookOpen },
  { id: 2, label: "Daily Content", icon: Calendar },
  { id: 3, label: "Review & Save", icon: CheckCircle2 },
];
const CATEGORIES = [
  { value: "intro", label: "Introduction" },
  { value: "whole-bible", label: "Whole Bible" },
  { value: "nt", label: "New Testament" },
  { value: "ot", label: "Old Testament" },
  { value: "book", label: "Single Book" },
  { value: "topical", label: "Topical" },
];
const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const BIBLE_BOOKS = [
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalm",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];
const DIFF_BADGE: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all shadow-sm";
const textareaCls = inputCls + " resize-none";

const emptyQuiz = (): QuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
});
const emptyDay = (n: number): DayAssignment => ({
  dayNumber: n,
  title: "",
  chapters: [{ book: "", chapter: 1 }],
  reflectionQuestions: [""],
  quizQuestions: [],
});

const isDayComplete = (d: DayAssignment) =>
  d.title.trim() !== "" && d.chapters.some((c) => c.book.trim() !== "");
const isDayPartial = (d: DayAssignment) =>
  (d.title.trim() !== "" && !d.chapters.some((c) => c.book.trim() !== "")) ||
  (d.title.trim() === "" && d.chapters.some((c) => c.book.trim() !== ""));

// ─────────────────────────────────────────────
// DayCard — defined OUTSIDE AddReadingPlan so
// React never treats it as a new component type
// on re-render, which would unmount inputs and
// cause the "loses focus after 1 character" bug.
// ─────────────────────────────────────────────
interface DayCardProps {
  day: DayAssignment;
  dayIdx: number;
  isOpen: boolean;
  questionsEnabled: boolean;
  onToggle: () => void;
  onUpdateDay: (dayIdx: number, patch: Partial<DayAssignment>) => void;
}

const DayCard = ({
  day,
  dayIdx,
  isOpen,
  questionsEnabled,
  onToggle,
  onUpdateDay,
}: DayCardProps) => {
  const complete = isDayComplete(day);
  const partial = isDayPartial(day);

  const addChapter = () =>
    onUpdateDay(dayIdx, {
      chapters: [...day.chapters, { book: "", chapter: 1 }],
    });
  const removeChapter = (ci: number) =>
    onUpdateDay(dayIdx, { chapters: day.chapters.filter((_, x) => x !== ci) });
  const updateChapter = (ci: number, p: Partial<Chapter>) =>
    onUpdateDay(dayIdx, {
      chapters: day.chapters.map((c, x) => (x === ci ? { ...c, ...p } : c)),
    });

  const addReflection = () =>
    onUpdateDay(dayIdx, {
      reflectionQuestions: [...day.reflectionQuestions, ""],
    });
  const removeReflection = (ri: number) =>
    onUpdateDay(dayIdx, {
      reflectionQuestions: day.reflectionQuestions.filter((_, x) => x !== ri),
    });
  const updateReflection = (ri: number, v: string) =>
    onUpdateDay(dayIdx, {
      reflectionQuestions: day.reflectionQuestions.map((r, x) =>
        x === ri ? v : r,
      ),
    });

  const addQuiz = () =>
    onUpdateDay(dayIdx, { quizQuestions: [...day.quizQuestions, emptyQuiz()] });
  const removeQuiz = (qi: number) =>
    onUpdateDay(dayIdx, {
      quizQuestions: day.quizQuestions.filter((_, x) => x !== qi),
    });
  const updateQuiz = (qi: number, patch: Partial<QuizQuestion>) =>
    onUpdateDay(dayIdx, {
      quizQuestions: day.quizQuestions.map((q, x) =>
        x === qi ? { ...q, ...patch } : q,
      ),
    });
  const updateQuizOption = (qi: number, oi: number, val: string) => {
    const opts = [...day.quizQuestions[qi].options] as [
      string,
      string,
      string,
      string,
    ];
    opts[oi] = val;
    updateQuiz(qi, { options: opts });
  };

  return (
    <div
      className={cn(
        "rounded-xl border overflow-hidden transition-all",
        isOpen
          ? "border-teal-300 bg-white shadow-[0_2px_8px_rgba(20,184,166,0.12)]"
          : complete
            ? "border-emerald-200 bg-emerald-50/30"
            : partial
              ? "border-amber-200 bg-amber-50/30"
              : "border-stone-100 bg-white",
      )}
    >
      {/* ── Header ── */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-stone-50/60 transition-colors"
      >
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
            complete
              ? "bg-emerald-100 text-emerald-700"
              : partial
                ? "bg-amber-100 text-amber-700"
                : "bg-stone-100 text-stone-500",
          )}
        >
          {complete ? <CheckCircle2 className="w-4 h-4" /> : day.dayNumber}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-semibold",
              complete ? "text-stone-800" : "text-stone-500",
            )}
          >
            {day.title || `Day ${day.dayNumber}`}
          </p>
          {complete && (
            <p className="text-xs text-stone-400 truncate">
              {day.chapters
                .filter((c) => c.book)
                .map((c) => `${c.book} ${c.chapter}`)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {complete && (
            <span className="text-[10px] text-emerald-600 font-bold border border-emerald-200 bg-emerald-50 rounded px-1.5 py-0.5">
              Ready
            </span>
          )}
          {partial && (
            <span className="text-[10px] text-amber-600 font-bold border border-amber-200 bg-amber-50 rounded px-1.5 py-0.5">
              Partial
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </button>

      {/* ── Expanded body ── */}
      {isOpen && (
        <div className="border-t border-stone-100 p-4 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-stone-700">
              Day Title <span className="text-red-500">*</span>
            </label>
            <input
              value={day.title}
              onChange={(e) => onUpdateDay(dayIdx, { title: e.target.value })}
              placeholder="e.g. Creation — In the beginning"
              className={inputCls}
            />
          </div>

          {/* Chapters */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">
              Chapters <span className="text-red-500">*</span>
            </label>
            {day.chapters.map((ch, ci) => (
              <div key={ci} className="flex items-center gap-2">
                <Select
                  value={ch.book}
                  onValueChange={(v) => updateChapter(ci, { book: v })}
                >
                  <SelectTrigger className="flex-1 rounded-xl border-stone-200 bg-white text-sm focus:ring-teal-400/30">
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {BIBLE_BOOKS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="number"
                  min={1}
                  value={ch.chapter}
                  onChange={(e) =>
                    updateChapter(ci, {
                      chapter: parseInt(e.target.value) || 1,
                    })
                  }
                  className={cn(inputCls, "w-20 text-center")}
                  placeholder="Ch"
                />
                {day.chapters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChapter(ci)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addChapter}
              className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold mt-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Chapter
            </button>
          </div>

          {/* Reflections */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stone-700">
              Reflection Questions
            </label>
            {day.reflectionQuestions.map((q, ri) => (
              <div key={ri} className="flex items-center gap-2">
                <input
                  value={q}
                  onChange={(e) => updateReflection(ri, e.target.value)}
                  placeholder={`Reflection question ${ri + 1}`}
                  className={cn(inputCls, "flex-1")}
                />
                {day.reflectionQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReflection(ri)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addReflection}
              className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Reflection
            </button>
          </div>

          {/* Quiz questions */}
          {questionsEnabled && (
            <div className="space-y-3">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-500" />
                Quiz Questions
              </label>
              {day.quizQuestions.map((quiz, qi) => (
                <div
                  key={qi}
                  className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                      Q{qi + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuiz(qi)}
                      className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={quiz.question}
                    onChange={(e) =>
                      updateQuiz(qi, { question: e.target.value })
                    }
                    placeholder="Question text…"
                    rows={2}
                    className={textareaCls}
                  />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {quiz.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuiz(qi, { correctAnswer: oi })}
                          className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            quiz.correctAnswer === oi
                              ? "border-teal-500 bg-teal-500"
                              : "border-stone-300 hover:border-teal-400",
                          )}
                        >
                          {quiz.correctAnswer === oi && (
                            <CircleDot className="w-3 h-3 text-white" />
                          )}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) =>
                            updateQuizOption(qi, oi, e.target.value)
                          }
                          placeholder={`Option ${oi + 1}`}
                          className={cn(
                            inputCls,
                            "flex-1",
                            quiz.correctAnswer === oi &&
                              "border-teal-400 ring-1 ring-teal-400/30",
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <textarea
                    value={quiz.explanation}
                    onChange={(e) =>
                      updateQuiz(qi, { explanation: e.target.value })
                    }
                    placeholder="Explanation (optional)"
                    rows={2}
                    className={textareaCls}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addQuiz}
                className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Quiz Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// AddReadingPlan — main page component
// ─────────────────────────────────────────────
const AddReadingPlan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [meta, setMeta] = useState<PlanMeta>({
    title: "",
    description: "",
    totalDays: 1,
    questionsEnabled: true,
    category: "intro",
    difficulty: "easy",
  });
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [expandedDay, setExpandedDay] = useState<number | undefined>(undefined);

  const updateMeta = <K extends keyof PlanMeta>(key: K, val: PlanMeta[K]) =>
    setMeta((m) => ({ ...m, [key]: val }));

  const normaliseDays = (total: number) =>
    setDays((prev) => {
      const next = [...prev];
      while (next.length < total) next.push(emptyDay(next.length + 1));
      if (next.length > total) next.splice(total);
      return next;
    });

  // useCallback keeps the same function reference so DayCard never re-mounts
  const handleUpdateDay = useCallback(
    (dayIdx: number, patch: Partial<DayAssignment>) =>
      setDays((p) => p.map((d, x) => (x === dayIdx ? { ...d, ...patch } : d))),
    [],
  );

  // ── Navigation ──────────────────────────────
  const goToStep2 = () => {
    if (!meta.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (meta.totalDays < 1) {
      toast({ title: "At least 1 day required", variant: "destructive" });
      return;
    }
    if (meta.totalDays > 365) {
      toast({ title: "Maximum 365 days", variant: "destructive" });
      return;
    }
    normaliseDays(meta.totalDays);
    setExpandedDay(1);
    setStep(2);
  };

  const goToStep3 = () => {
    for (let i = 0; i < days.length; i++) {
      if (isDayPartial(days[i])) {
        toast({
          title: `Day ${days[i].dayNumber} is incomplete`,
          description: "Add both a title and at least one chapter",
          variant: "destructive",
        });
        setExpandedDay(days[i].dayNumber);
        return;
      }
    }
    if (days.filter(isDayComplete).length === 0) {
      toast({ title: "Complete at least 1 day", variant: "destructive" });
      setExpandedDay(1);
      return;
    }
    setStep(3);
  };

  // ── Submit ──────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const planRes = await sendPostRequest("reading-plans", "create", {
        title: meta.title,
        description: meta.description,
        totalDays: meta.totalDays,
        questionsEnabled: meta.questionsEnabled,
        category: meta.category,
        difficulty: meta.difficulty,
      });
      if (planRes.returnCode !== 200) {
        toast({
          title: "Failed to create plan",
          description: planRes.returnMessage,
          variant: "destructive",
        });
        return;
      }
      const planId: string = planRes.returnData?.planId;

      for (const day of days.filter(isDayComplete)) {
        const aRes = await sendPostRequest("reading-plans", "add-assignment", {
          planId,
          dayNumber: day.dayNumber,
          title: day.title,
          chapters: day.chapters,
          reflectionQuestions: day.reflectionQuestions.filter((r) => r.trim()),
        });
        if (aRes.returnCode !== 200) {
          toast({
            title: `Day ${day.dayNumber} failed`,
            description: aRes.returnMessage,
            variant: "destructive",
          });
          return;
        }
        if (meta.questionsEnabled && day.quizQuestions.length > 0) {
          const qRes = await sendPostRequest(
            "reading-plans",
            "add-quiz-questions",
            {
              planId,
              dayNumber: day.dayNumber,
              questions: day.quizQuestions,
            },
          );
          if (qRes.returnCode !== 200) {
            toast({
              title: `Quiz for Day ${day.dayNumber} failed`,
              description: qRes.returnMessage,
              variant: "destructive",
            });
            return;
          }
        }
      }
      toast({ title: "Reading plan created! 🎉" });
      navigate(routes.readingPlans.path);
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f7f5f2]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/reading-plans"
            className="text-stone-400 hover:text-stone-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-stone-800 tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Create Reading Plan
              </h1>
              <p className="text-stone-400 text-xs mt-0.5 font-medium">
                Admin — full plan builder
              </p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div
                key={s.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                      : done
                        ? "text-emerald-600"
                        : "text-stone-400",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      active
                        ? "bg-white/20"
                        : done
                          ? "bg-emerald-100"
                          : "bg-stone-100",
                    )}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <span className="hidden sm:block">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mx-2",
                      step > s.id ? "bg-emerald-200" : "bg-stone-200",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ══ STEP 1 ══ */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
              <h2 className="font-bold text-stone-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                Plan Details
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Basic metadata for the reading plan
              </p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={meta.title}
                  onChange={(e) => updateMeta("title", e.target.value)}
                  placeholder="e.g. One Week Bible Highlights"
                  className={inputCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  Description
                </label>
                <textarea
                  value={meta.description}
                  onChange={(e) => updateMeta("description", e.target.value)}
                  placeholder="Brief description of this plan…"
                  rows={3}
                  className={textareaCls}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-stone-700">
                  Total Days <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={meta.totalDays}
                  onChange={(e) =>
                    updateMeta(
                      "totalDays",
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className={cn(inputCls, "w-32")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-stone-700">
                    Category
                  </label>
                  <Select
                    value={meta.category}
                    onValueChange={(v) => updateMeta("category", v)}
                  >
                    <SelectTrigger className="rounded-xl border-stone-200 focus:ring-teal-400/30 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-stone-700">
                    Difficulty
                  </label>
                  <Select
                    value={meta.difficulty}
                    onValueChange={(v) => updateMeta("difficulty", v)}
                  >
                    <SelectTrigger className="rounded-xl border-stone-200 focus:ring-teal-400/30 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 bg-stone-50">
                <div>
                  <p className="text-sm font-semibold text-stone-700">
                    Quiz Questions
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Enable daily quizzes for readers
                  </p>
                </div>
                <Switch
                  checked={meta.questionsEnabled}
                  onCheckedChange={(v) => updateMeta("questionsEnabled", v)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={goToStep2}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all hover:-translate-y-px"
                >
                  Daily Content <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2 ══ */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-stone-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Daily Content — {meta.totalDays} Days
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Assign chapters and questions per day
                  </p>
                </div>
                <span className="text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 font-bold">
                  {days.filter(isDayComplete).length}/{meta.totalDays} ready
                </span>
              </div>
              <div className="p-4 space-y-2">
                {days.map((day, dayIdx) => (
                  <DayCard
                    key={day.dayNumber}
                    day={day}
                    dayIdx={dayIdx}
                    isOpen={expandedDay === day.dayNumber}
                    questionsEnabled={meta.questionsEnabled}
                    onToggle={() =>
                      setExpandedDay(
                        expandedDay === day.dayNumber
                          ? undefined
                          : day.dayNumber,
                      )
                    }
                    onUpdateDay={handleUpdateDay}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-sm font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={goToStep3}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all hover:-translate-y-px"
              >
                Review Plan <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 ══ */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                <h2 className="font-bold text-stone-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Review & Confirm
                </h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="rounded-xl border border-stone-100 bg-stone-50 p-4 space-y-3">
                  <h3 className="font-bold text-stone-800 text-base">
                    {meta.title}
                  </h3>
                  {meta.description && (
                    <p className="text-sm text-stone-500">{meta.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] border border-stone-200 bg-white text-stone-600 rounded-lg px-2 py-0.5 font-semibold">
                      {meta.totalDays} days
                    </span>
                    <span className="text-[11px] border border-stone-200 bg-white text-stone-600 rounded-lg px-2 py-0.5 font-semibold">
                      {CATEGORIES.find((c) => c.value === meta.category)?.label}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] border rounded-lg px-2 py-0.5 font-bold",
                        DIFF_BADGE[meta.difficulty],
                      )}
                    >
                      {
                        DIFFICULTIES.find((d) => d.value === meta.difficulty)
                          ?.label
                      }
                    </span>
                    {meta.questionsEnabled && (
                      <span className="text-[11px] border border-violet-200 bg-violet-50 text-violet-700 rounded-lg px-2 py-0.5 font-bold">
                        Quiz enabled
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Day Assignments
                    </p>
                    {days.filter(isDayComplete).length < meta.totalDays && (
                      <p className="text-xs text-stone-400">
                        <span className="text-teal-600 font-bold">
                          {days.filter(isDayComplete).length}
                        </span>{" "}
                        will save ·{" "}
                        <span className="font-semibold">
                          {meta.totalDays - days.filter(isDayComplete).length}
                        </span>{" "}
                        pending
                      </p>
                    )}
                  </div>
                  <div className="rounded-xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
                    {days.map((day) => {
                      const ok = isDayComplete(day);
                      return (
                        <div
                          key={day.dayNumber}
                          className={cn(
                            "flex items-start gap-3 p-3",
                            ok ? "bg-white" : "bg-stone-50",
                          )}
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              ok
                                ? "bg-teal-100 text-teal-700"
                                : "bg-stone-100 text-stone-400",
                            )}
                          >
                            {day.dayNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            {ok ? (
                              <>
                                <p className="font-semibold text-sm text-stone-800">
                                  {day.title}
                                </p>
                                <p className="text-xs text-stone-400 mt-0.5">
                                  {day.chapters
                                    .filter((c) => c.book)
                                    .map((c) => `${c.book} ${c.chapter}`)
                                    .join(", ")}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-stone-400 italic">
                                Not configured — can add via Edit after saving
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            {ok &&
                              day.reflectionQuestions.filter((r) => r.trim())
                                .length > 0 && (
                                <span className="text-[10px] border border-sky-200 bg-sky-50 text-sky-700 rounded px-1.5 py-0.5 font-semibold">
                                  {
                                    day.reflectionQuestions.filter((r) =>
                                      r.trim(),
                                    ).length
                                  }{" "}
                                  reflect.
                                </span>
                              )}
                            {ok && day.quizQuestions.length > 0 && (
                              <span className="text-[10px] border border-violet-200 bg-violet-50 text-violet-700 rounded px-1.5 py-0.5 font-semibold">
                                {day.quizQuestions.length} quiz
                              </span>
                            )}
                            {!ok && (
                              <span className="text-[10px] border border-stone-200 text-stone-400 rounded px-1.5 py-0.5 font-semibold">
                                pending
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 text-sm font-semibold transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-sm shadow-teal-600/20 transition-all hover:-translate-y-px disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Reading Plan
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddReadingPlan;
