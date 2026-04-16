"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Edit2,
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  AlertTriangle,
  RefreshCw,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routePaths, routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Chapter {
  book: string;
  chapter: number;
}
interface QuizQuestion {
  questionId?: number;
  question: string;
  options: [string, string, string, string];
  correctAnswer: number;
  explanation: string;
  _dirty?: boolean;
  _new?: boolean;
}
interface DayAssignment {
  id?: number;
  dayNumber: number;
  title: string;
  chapters: Chapter[];
  reflectionQuestions: string[];
  quizQuestions: QuizQuestion[];
  _exists: boolean;
  _dirty?: boolean;
}
interface PlanMeta {
  planId: string;
  title: string;
  description: string;
  totalDays: number;
  questionsEnabled: boolean;
  category: string;
  difficulty: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CATEGORIES = [
  { value: "intro", label: "Introduction" },
  { value: "whole-bible", label: "Whole Bible" },
  { value: "nt", label: "New Testament" },
  { value: "ot", label: "Old Testament" },
  { value: "book", label: "Single Book" },
  { value: "topical", label: "Topical" },
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
const DIFF_STYLES: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};

const emptyQuiz = (): QuizQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  explanation: "",
  _new: true,
  _dirty: true,
});
const emptyDay = (n: number): DayAssignment => ({
  dayNumber: n,
  title: "",
  chapters: [{ book: "", chapter: 1 }],
  reflectionQuestions: [""],
  quizQuestions: [],
  _exists: false,
  _dirty: true,
});

// ─────────────────────────────────────────────
// Input styles
// ─────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all shadow-sm";
const textareaCls = inputCls + " resize-none";
const Field = ({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-stone-700">{label}</label>
    {hint && <p className="text-xs text-stone-400">{hint}</p>}
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const EditReadingPlan = () => {
  const { planId } = useParams<{ planId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [days, setDays] = useState<DayAssignment[]>([]);
  const [expandedDay, setExpandedDay] = useState<number>(-1);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingDay, setSavingDay] = useState<number | null>(null);
  const [deleteQuizTarget, setDeleteQuizTarget] = useState<{
    dayIdx: number;
    qIdx: number;
    questionId: number;
  } | null>(null);
  const [deletingQuiz, setDeletingQuiz] = useState(false);

  // ── Load ─────────────────────────────────────
  const loadPlan = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    try {
      const allRes = await sendPostRequest("reading-plans", "get-all", {});
      const plansData = allRes.returnData?.plans ?? allRes.returnData;
      const planMeta = (plansData as any[])?.find(
        (p: any) => p.planId === planId,
      );
      if (!planMeta) {
        toast({ title: "Plan not found", variant: "destructive" });
        navigate("/reading-plans/admin");
        return;
      }
      setMeta({
        planId: planMeta.planId,
        title: planMeta.title ?? "",
        description: planMeta.description ?? "",
        totalDays: planMeta.totalDays ?? planMeta.total_days ?? 0,
        questionsEnabled: planMeta.questionsEnabled ?? planMeta.questions_enabled ?? false,
        category: (planMeta.category ?? planMeta.category ?? "intro").toLowerCase(),
        difficulty: (planMeta.difficulty ?? planMeta.difficulty ?? "easy").toLowerCase(),
        isActive: planMeta.isActive ?? planMeta.is_active ?? false,
      });

      const total: number = planMeta.totalDays ?? 0;
      const nums = Array.from({ length: total }, (_, i) => i + 1);
      const [aResults, qResults] = await Promise.all([
        Promise.all(
          nums.map((d) =>
            sendPostRequest("reading-plans", "daily-assignment", {
              planId,
              dayNumber: d,
            }),
          ),
        ),
        Promise.all(
          nums.map((d) =>
            sendPostRequest("reading-plans", "quiz-questions", {
              planId,
              dayNumber: d,
            }),
          ),
        ),
      ]);

      setDays(
        nums.map((dayNum, i) => {
          const aRes = aResults[i];
          const qRes = qResults[i];
          const quizQuestions: QuizQuestion[] =
            qRes?.returnCode === 200 && Array.isArray(qRes?.returnData)
              ? qRes.returnData.map((q: any) => {
                  let parsedOptions: [string, string, string, string] = ["", "", "", ""];
                  try {
                    const rawOpt = q.optionsJson ?? q.options ?? "[]";
                    const opts = JSON.parse(rawOpt);
                    if (Array.isArray(opts) && opts.length >= 1) {
                      const filled = [...opts];
                      while (filled.length < 4) filled.push("");
                      parsedOptions = filled.slice(0, 4) as [string, string, string, string];
                    }
                  } catch {}
                  return {
                    questionId: q.questionId ?? q.id,
                    question: q.question ?? "",
                    options: parsedOptions,
                    correctAnswer: q.correctAnswer ?? 0,
                    explanation: q.explanation ?? "",
                    _new: false,
                    _dirty: false,
                  };
                })
              : [];
          if (aRes?.returnCode === 200 && aRes?.returnData) {
            const d = aRes.returnData;
            return {
              id: d.id,
              dayNumber: dayNum,
              title: d.title ?? "",
              chapters: Array.isArray(d.chapters)
                ? d.chapters
                : [{ book: "", chapter: 1 }],
              reflectionQuestions:
                Array.isArray(d.reflectionQuestions) &&
                d.reflectionQuestions.length
                  ? d.reflectionQuestions
                  : [""],
              quizQuestions,
              _exists: true,
            };
          }
          return emptyDay(dayNum);
        }),
      );
    } catch (e: any) {
      toast({
        title: "Load error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [planId, navigate, toast]);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  // ── Meta helpers ──────────────────────────────
  const updateMeta = <K extends keyof PlanMeta>(k: K, v: PlanMeta[K]) =>
    setMeta((m) => (m ? { ...m, [k]: v } : m));
  const saveMeta = async () => {
    if (!meta) return;
    if (!meta.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setSavingMeta(true);
    try {
      const res = await sendPostRequest("reading-plans", "update", {
        planId: meta.planId,
        title: meta.title,
        description: meta.description,
        category: meta.category,
        difficulty: meta.difficulty,
        questionsEnabled: meta.questionsEnabled,
        isActive: meta.isActive,
      });
      if (res.returnCode === 200) toast({ title: "Plan info saved ✓" });
      else
        toast({
          title: "Save failed",
          description: res.returnMessage,
          variant: "destructive",
        });
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSavingMeta(false);
    }
  };

  // ── Day helpers ───────────────────────────────
  const updateDay = (i: number, patch: Partial<DayAssignment>) =>
    setDays((p) =>
      p.map((d, x) => (x === i ? { ...d, ...patch, _dirty: true } : d)),
    );
  const addChapter = (i: number) =>
    updateDay(i, { chapters: [...days[i].chapters, { book: "", chapter: 1 }] });
  const removeChapter = (i: number, ci: number) =>
    days[i].chapters.length > 1 &&
    updateDay(i, { chapters: days[i].chapters.filter((_, x) => x !== ci) });
  const updateChapter = (i: number, ci: number, p: Partial<Chapter>) =>
    updateDay(i, {
      chapters: days[i].chapters.map((c, x) => (x === ci ? { ...c, ...p } : c)),
    });
  const addReflection = (i: number) =>
    updateDay(i, { reflectionQuestions: [...days[i].reflectionQuestions, ""] });
  const removeReflection = (i: number, ri: number) =>
    days[i].reflectionQuestions.length > 1 &&
    updateDay(i, {
      reflectionQuestions: days[i].reflectionQuestions.filter(
        (_, x) => x !== ri,
      ),
    });
  const updateReflection = (i: number, ri: number, v: string) =>
    updateDay(i, {
      reflectionQuestions: days[i].reflectionQuestions.map((r, x) =>
        x === ri ? v : r,
      ),
    });
  const addQuiz = (i: number) =>
    updateDay(i, { quizQuestions: [...days[i].quizQuestions, emptyQuiz()] });
  const updateQuiz = (i: number, qi: number, p: Partial<QuizQuestion>) =>
    updateDay(i, {
      quizQuestions: days[i].quizQuestions.map((q, x) =>
        x === qi ? { ...q, ...p, _dirty: true } : q,
      ),
    });
  const updateQuizOption = (i: number, qi: number, oi: number, v: string) => {
    const opts = [...days[i].quizQuestions[qi].options] as [
      string,
      string,
      string,
      string,
    ];
    opts[oi] = v;
    updateQuiz(i, qi, { options: opts });
  };
  const openDeleteQuiz = (
    dayIdx: number,
    qIdx: number,
    questionId?: number,
  ) => {
    if (!questionId) {
      updateDay(dayIdx, {
        quizQuestions: days[dayIdx].quizQuestions.filter((_, x) => x !== qIdx),
      });
      return;
    }
    setDeleteQuizTarget({ dayIdx, qIdx, questionId });
  };
  const confirmDeleteQuiz = async () => {
    if (!deleteQuizTarget) return;
    setDeletingQuiz(true);
    const t = deleteQuizTarget;
    try {
      const res = await sendPostRequest(
        "reading-plans",
        "delete-quiz-question",
        { questionId: t.questionId },
      );
      if (res.returnCode === 200) {
        toast({ title: "Question deleted" });
        setDays((prev) =>
          prev.map((d, i) =>
            i === t.dayIdx
              ? {
                  ...d,
                  quizQuestions: d.quizQuestions.filter((_, x) => x !== t.qIdx),
                }
              : d,
          ),
        );
        setDeleteQuizTarget(null);
      } else {
        toast({
          title: "Delete failed",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeletingQuiz(false);
    }
  };

  // ── Save day ──────────────────────────────────
  const saveDay = async (dayIdx: number) => {
    if (!meta || !planId) return;
    const day = days[dayIdx];
    if (!day.title.trim()) {
      toast({
        title: `Day ${day.dayNumber}: title required`,
        variant: "destructive",
      });
      return;
    }
    if (day.chapters.some((c) => !c.book.trim())) {
      toast({
        title: `Day ${day.dayNumber}: all chapters need a book`,
        variant: "destructive",
      });
      return;
    }

    setSavingDay(day.dayNumber);
    try {
      const ep = day._exists ? "update-assignment" : "add-assignment";
      const payload: any = {
        planId,
        dayNumber: day.dayNumber,
        title: day.title,
        chapters: day.chapters,
        reflectionQuestions: day.reflectionQuestions.filter((r) => r.trim()),
      };
      if (day._exists && day.id) {
        payload.assignmentId = day.id;
      }
      const aRes = await sendPostRequest("reading-plans", ep, payload);
      if (aRes.returnCode !== 200) {
        toast({
          title: `Day ${day.dayNumber} save failed`,
          description: aRes.returnMessage,
          variant: "destructive",
        });
        return;
      }

      const newQs = day.quizQuestions.filter((q) => q._new);
      const updatedQs = day.quizQuestions.filter(
        (q) => !q._new && q._dirty && q.questionId,
      );
      let savedNewIds: number[] = [];
      if (newQs.length > 0) {
        const qRes = await sendPostRequest(
          "reading-plans",
          "add-quiz-questions",
          {
            planId,
            dayNumber: day.dayNumber,
            questions: newQs.map(
              ({ question, options, correctAnswer, explanation }) => ({
                question,
                options,
                correctAnswer,
                explanation,
              }),
            ),
          },
        );
        if (qRes.returnCode !== 200) {
          toast({
            title: `Day ${day.dayNumber} quiz save failed`,
            description: qRes.returnMessage,
            variant: "destructive",
          });
          return;
        }
        if (Array.isArray(qRes.returnData))
          savedNewIds = qRes.returnData.map((q: any) => q.id ?? q.questionId);
      }
      for (const q of updatedQs) {
        const qRes = await sendPostRequest(
          "reading-plans",
          "update-quiz-question",
          {
            questionId: q.questionId,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          },
        );
        if (qRes.returnCode !== 200) {
          toast({
            title: "Q update failed",
            description: qRes.returnMessage,
            variant: "destructive",
          });
          return;
        }
      }
      toast({ title: `Day ${day.dayNumber} saved ✓` });
      let cursor = 0;
      setDays((prev) =>
        prev.map((d, i) =>
          i !== dayIdx
            ? d
            : {
                ...d,
                _exists: true,
                _dirty: false,
                quizQuestions: d.quizQuestions.map((q) =>
                  q._new
                    ? {
                        ...q,
                        questionId: savedNewIds[cursor++] ?? q.questionId,
                        _new: false,
                        _dirty: false,
                      }
                    : q._dirty
                      ? { ...q, _dirty: false }
                      : q,
                ),
              },
        ),
      );
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSavingDay(null);
    }
  };

  // ─────────────────────────────────────────────
  if (loading)
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          <p className="text-stone-400 text-sm font-medium">Loading plan…</p>
        </div>
      </div>
    );

  if (!meta)
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-400">Plan not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="text-teal-600 text-sm hover:underline mt-2"
          >
            Go back
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-[#f7f5f2]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <Link
            to="/reading-plans"
            className="text-stone-400 hover:text-stone-700 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0 shadow-sm">
              <Edit2 className="h-5 w-5 text-teal-700" />
            </div>
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold text-stone-800 tracking-tight leading-none truncate"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Edit Plan
              </h1>
              <p className="text-stone-400 text-xs mt-0.5 font-mono truncate">
                {meta.planId}
              </p>
            </div>
          </div>
          <button
            onClick={loadPlan}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-400 hover:text-stone-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ══ PLAN INFO ══ */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-stone-800 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-teal-600" />
                Plan Info
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Update metadata — days & plan ID cannot change
              </p>
            </div>
            {/* Active badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">Active</span>
              <Switch
                checked={meta.isActive}
                onCheckedChange={(v) => updateMeta("isActive", v)}
              />
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Read-only fields */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Plan ID">
                <input
                  value={meta.planId}
                  readOnly
                  className={cn(
                    inputCls,
                    "bg-stone-50 text-stone-400 font-mono cursor-not-allowed",
                  )}
                />
              </Field>
              <Field label="Total Days">
                <input
                  value={`${meta.totalDays} days`}
                  readOnly
                  className={cn(
                    inputCls,
                    "bg-stone-50 text-stone-400 cursor-not-allowed",
                  )}
                />
              </Field>
            </div>
            <Field label="Title">
              <input
                value={meta.title}
                onChange={(e) => updateMeta("title", e.target.value)}
                placeholder="Plan title"
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <textarea
                value={meta.description}
                onChange={(e) => updateMeta("description", e.target.value)}
                rows={5}
                placeholder="Brief description…"
                className={textareaCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Category">
                <Select
                  value={meta.category}
                  onValueChange={(v) => updateMeta("category", v)}
                >
                  <SelectTrigger className="rounded-xl border-stone-200 bg-white focus:ring-teal-400/30">
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
              </Field>
              <Field label="Difficulty">
                <Select
                  value={meta.difficulty}
                  onValueChange={(v) => updateMeta("difficulty", v)}
                >
                  <SelectTrigger className="rounded-xl border-stone-200 bg-white focus:ring-teal-400/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["easy", "medium", "hard"].map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
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
            <div className="flex justify-end">
              <button
                onClick={saveMeta}
                disabled={savingMeta}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm transition-all hover:-translate-y-px disabled:opacity-50"
              >
                {savingMeta ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Info
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ══ DAY ASSIGNMENTS ══ */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
            <h2 className="font-bold text-stone-800 flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-teal-600" />
              Daily Assignments
            </h2>
            <span className="text-[11px] border border-stone-200 bg-white text-stone-500 rounded-lg px-2 py-0.5 font-bold">
              {meta.totalDays} days
            </span>
          </div>

          <div className="p-4 space-y-2">
            {days.map((day, dayIdx) => {
              const isOpen = expandedDay === day.dayNumber;
              const isSaving = savingDay === day.dayNumber;
              const isDirty = day._dirty;
              return (
                <div
                  key={day.dayNumber}
                  className={cn(
                    "rounded-xl border overflow-hidden transition-all",
                    isOpen
                      ? "border-teal-200 shadow-[0_2px_8px_rgba(20,184,166,0.10)]"
                      : day._exists
                        ? "border-stone-100 bg-white"
                        : "border-dashed border-stone-200 bg-stone-50/50",
                  )}
                >
                  {/* Row header */}
                  <button
                    onClick={() => setExpandedDay(isOpen ? -1 : day.dayNumber)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-white group hover:bg-stone-50/60 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        day._exists
                          ? "bg-teal-100 text-teal-700"
                          : "bg-stone-100 text-stone-400",
                      )}
                    >
                      {day._exists ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        day.dayNumber
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          day._exists
                            ? "text-stone-800"
                            : "text-stone-400 italic",
                        )}
                      >
                        {day.title || `Day ${day.dayNumber} — not configured`}
                      </p>
                      {day._exists && (
                        <p className="text-xs text-stone-400 truncate">
                          {day.chapters
                            .filter((c) => c.book)
                            .map((c) => `${c.book} ${c.chapter}`)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDirty && (
                        <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 font-bold">
                          unsaved
                        </span>
                      )}
                      {meta.questionsEnabled &&
                        day.quizQuestions.length > 0 && (
                          <span className="text-[10px] border border-violet-200 bg-violet-50 text-violet-700 rounded px-1.5 py-0.5 font-bold">
                            {day.quizQuestions.length}Q
                          </span>
                        )}
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded body */}
                  {isOpen && (
                    <div className="border-t border-stone-100 p-4 space-y-5 bg-white">
                      {/* Title */}
                      <Field label="Day Title">
                        <input
                          value={day.title}
                          onChange={(e) =>
                            updateDay(dayIdx, { title: e.target.value })
                          }
                          placeholder="e.g. Creation — In the beginning"
                          className={inputCls}
                        />
                      </Field>

                      {/* Chapters */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-stone-700">
                          Chapters
                        </p>
                        {day.chapters.map((ch, ci) => (
                          <div key={ci} className="flex items-center gap-2">
                            <Select
                              value={ch.book}
                              onValueChange={(v) =>
                                updateChapter(dayIdx, ci, { book: v })
                              }
                            >
                              <SelectTrigger className="flex-1 rounded-xl border-stone-200 bg-white text-sm focus:ring-teal-400/30">
                                <SelectValue placeholder="Book" />
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
                                updateChapter(dayIdx, ci, {
                                  chapter: parseInt(e.target.value) || 1,
                                })
                              }
                              className={cn(inputCls, "w-20 text-center")}
                            />
                            {day.chapters.length > 1 && (
                              <button
                                onClick={() => removeChapter(dayIdx, ci)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addChapter(dayIdx)}
                          className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Chapter
                        </button>
                      </div>

                      {/* Reflections */}
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-stone-700">
                          Reflection Questions
                        </p>
                        {day.reflectionQuestions.map((q, ri) => (
                          <div key={ri} className="flex items-center gap-2">
                            <input
                              value={q}
                              onChange={(e) =>
                                updateReflection(dayIdx, ri, e.target.value)
                              }
                              placeholder={`Reflection ${ri + 1}`}
                              className={cn(inputCls, "flex-1")}
                            />
                            {day.reflectionQuestions.length > 1 && (
                              <button
                                onClick={() => removeReflection(dayIdx, ri)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addReflection(dayIdx)}
                          className="flex items-center gap-1.5 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Reflection
                        </button>
                      </div>

                      {/* Quiz questions */}
                      {meta.questionsEnabled && (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                            <HelpCircle className="w-4 h-4 text-violet-500" />
                            Quiz Questions
                          </p>
                          {day.quizQuestions.map((quiz, qi) => (
                            <div
                              key={qi}
                              className={cn(
                                "rounded-xl border p-4 space-y-3",
                                quiz._new
                                  ? "border-teal-200 bg-teal-50/30"
                                  : quiz._dirty
                                    ? "border-amber-200 bg-amber-50/20"
                                    : "border-stone-100 bg-stone-50/30",
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                                    Q{qi + 1}
                                  </span>
                                  {quiz._new && (
                                    <span className="text-[10px] border border-teal-200 bg-teal-50 text-teal-700 rounded px-1.5 py-0.5 font-bold">
                                      new
                                    </span>
                                  )}
                                  {!quiz._new && quiz._dirty && (
                                    <span className="text-[10px] border border-amber-200 bg-amber-50 text-amber-700 rounded px-1.5 py-0.5 font-bold">
                                      edited
                                    </span>
                                  )}
                                  {quiz.questionId && (
                                    <span className="text-[10px] text-stone-400 font-mono">
                                      #{quiz.questionId}
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    openDeleteQuiz(dayIdx, qi, quiz.questionId)
                                  }
                                  className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <textarea
                                value={quiz.question}
                                onChange={(e) =>
                                  updateQuiz(dayIdx, qi, {
                                    question: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Question text…"
                                className={textareaCls}
                              />
                              <div className="grid sm:grid-cols-2 gap-2">
                                {quiz.options.map((opt, oi) => (
                                  <div
                                    key={oi}
                                    className="flex items-center gap-2"
                                  >
                                    <button
                                      onClick={() =>
                                        updateQuiz(dayIdx, qi, {
                                          correctAnswer: oi,
                                        })
                                      }
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
                                        updateQuizOption(
                                          dayIdx,
                                          qi,
                                          oi,
                                          e.target.value,
                                        )
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
                                  updateQuiz(dayIdx, qi, {
                                    explanation: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Explanation (optional)"
                                className={textareaCls}
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => addQuiz(dayIdx)}
                            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add Question
                          </button>
                        </div>
                      )}

                      {/* Save day */}
                      <div className="flex justify-end pt-2 border-t border-stone-100">
                        <button
                          onClick={() => saveDay(dayIdx)}
                          disabled={isSaving}
                          className={cn(
                            "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-px disabled:opacity-50",
                            isDirty
                              ? "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20"
                              : "bg-stone-100 text-stone-500 hover:bg-stone-200",
                          )}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Saving…
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Save Day {day.dayNumber}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══ DELETE QUIZ DIALOG ══ */}
      <Dialog
        open={!!deleteQuizTarget}
        onOpenChange={(o) => !o && setDeleteQuizTarget(null)}
      >
        <DialogContent className="sm:max-w-sm rounded-2xl border-stone-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Question
            </DialogTitle>
            <DialogDescription>
              This will permanently delete question{" "}
              <strong>#{deleteQuizTarget?.questionId}</strong> and all user
              answers. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteQuizTarget(null)}
              disabled={deletingQuiz}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteQuiz}
              disabled={deletingQuiz}
              className="gap-2 rounded-xl"
            >
              {deletingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditReadingPlan;
