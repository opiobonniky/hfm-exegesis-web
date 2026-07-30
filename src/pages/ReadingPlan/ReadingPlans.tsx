"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Edit2,
  Filter,
  HelpCircle,
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  AlertTriangle,
  Save,
  Play,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { useLanguage } from "@/components/languages/languageProvider";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ReadingPlan {
  planId: string;
  title: string;
  description?: string;
  total_days: number;
  questionsEnabled: boolean;
  category: string;
  difficulty: string;
  isActive?: boolean;
  progress?: number;
  streak?: number;
  started?: boolean;
  is_completed?: boolean | null;
  completion_percentage?: number;
  total_assignments?: number;
  total_quiz_questions?: number;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CATEGORY_KEY: Record<string, string> = {
  all: "catAllCategories",
  intro: "catIntroduction",
  "whole-bible": "catWholeBible",
  nt: "catNT",
  ot: "catOT",
  book: "catSingleBook",
  topical: "catTopical",
};

const DIFF_STYLES: Record<string, { bar: string; badge: string }> = {
  easy: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
  },
  medium: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/40",
  },
  hard: { bar: "bg-red-500", badge: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40" },
};

const DIFF_KEY: Record<string, string> = {
  easy: "diffEasy",
  medium: "diffMedium",
  hard: "diffHard",
};

const diffLabel = (diff: string, t: any) => {
  const key = DIFF_KEY[diff];
  return key ? (t.readingPlan as Record<string, string>)[key] ?? diff : diff;
};

const catLabel = (cat: string, t: any) => {
  const key = CATEGORY_KEY[cat];
  return key ? (t.readingPlan as Record<string, string>)[key] ?? cat : cat;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const ReadingPlans = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState<ReadingPlan | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState<ReadingPlan | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReadingPlan>>({});
  const [saving, setSaving] = useState(false);

  // ── Fetch ─────────────────────────────────────
  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("reading-plans", "get-all", {});
      const plansData = res.returnData?.plans ?? res.returnData;
      if (res.returnCode === 200 && Array.isArray(plansData)) {
        const plansWithDefaults = (plansData as any[]).map((p) => ({
          ...p,
          started: p.started ?? false,
          completed: p.completed ?? false,
          progress: p.progress ?? 0,
          streak: p.streak ?? 0,
        }));
        setPlans(plansWithDefaults);
      } else
        toast({
          title: t.readingPlan.toastFailedLoad,
          description: res.returnMessage,
          variant: "destructive",
        });
    } catch (e: any) {
      toast({
        title: t.readingPlan.toastNetworkError,
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadPlans();
  }, []);

  // ── Filter ────────────────────────────────────
  const filtered = plans.filter((p) => {
    const ms =
      !search.trim() ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.planId.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "all" || p.category === catFilter;
    return ms && mc;
  });

  // ── Delete ────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteConfirmText !== deleteTarget.planId) {
      toast({ title: t.readingPlan.toastIdMismatch, variant: "destructive" });
      return;
    }
    setDeleting(true);
    try {
      const res = await sendPostRequest("reading-plans", "delete", {
        planId: deleteTarget.planId,
      });
      if (res.returnCode === 200) {
        toast({
          title: t.readingPlan.toastPlanDeleted,
          description: t.readingPlan.toastPlanDeletedDesc.replace('{title}', deleteTarget.title),
        });
        setPlans((prev) =>
          prev.filter((p) => p.planId !== deleteTarget.planId),
        );
        setDeleteTarget(null);
      } else {
        toast({
          title: t.readingPlan.toastDeleteFailed,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.readingPlan.toastNetworkError,
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Edit ──────────────────────────────────────
  const openEdit = (plan: ReadingPlan) =>
    navigate(`/edit-reading-plan/${plan.planId}`);

  const startPlan = async (plan: ReadingPlan) => {
    try {
      const res = await sendPostRequest("reading-plans", "start", {
        planId: plan.planId,
      });
      if (res.returnCode === 200) {
        toast({
          title: t.readingPlan.toastStarted,
          description: t.readingPlan.toastPlanStartedDesc.replace('{title}', plan.title),
        });
      } else {
        toast({
          title: t.readingPlan.toastFailedStart,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.common.error,
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const confirmEdit = async () => {
    if (!editTarget) return;
    if (!editForm.title?.trim()) {
      toast({ title: t.readingPlan.toastTitleRequired, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await sendPostRequest("reading-plans", "update", {
        planId: editTarget.planId,
        title: editForm.title,
        description: editForm.description,
        category: editForm.category,
        difficulty: editForm.difficulty,
        questionsEnabled: editForm.questionsEnabled,
        isActive: editForm.isActive,
      });
      if (res.returnCode === 200) {
        toast({
          title: t.readingPlan.toastPlanUpdated,
          description: t.readingPlan.toastPlanUpdatedDesc.replace('{title}', editForm.title),
        });
        setPlans((prev) =>
          prev.map((p) =>
            p.planId === editTarget.planId ? { ...p, ...editForm } : p,
          ),
        );
        setEditTarget(null);
      } else {
        toast({
          title: t.readingPlan.toastUpdateFailed,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.readingPlan.toastNetworkError,
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ─────────────────────────────
  const toggleActive = async (plan: ReadingPlan) => {
    const newVal = !(plan.isActive ?? true);
    try {
      const res = await sendPostRequest("reading-plans", "update", {
        planId: plan.planId,
        isActive: newVal,
      });
      if (res.returnCode === 200) {
        setPlans((prev) =>
          prev.map((p) =>
            p.planId === plan.planId ? { ...p, isActive: newVal } : p,
          ),
        );
        toast({ title: newVal ? t.readingPlan.toastPlanActivated : t.readingPlan.toastPlanDeactivated });
      } else {
        toast({
          title: t.readingPlan.toastToggleFailed,
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.readingPlan.toastNetworkError,
        description: e.message,
        variant: "destructive",
      });
    }
  };

  // ── Stats ─────────────────────────────────────
  const stats = {
    total: plans.length,
    active: plans.filter((p) => p.isActive !== false).length,
    withQuiz: plans.filter((p) => p.questionsEnabled).length,
    easy: plans.filter((p) => p.difficulty === "easy").length,
  };

  // ─────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-background"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
     
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-muted-foreground/70 hover:text-foreground/80 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            >
              <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
              {t.common.back}
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
                <Shield className="h-5 w-5 text-teal-700" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-foreground tracking-tight leading-none"
                  style={{ fontFamily: "'Fraunces', Georgia, serif" }}
                >
                  {t.readingPlan.manageTitle}
                </h1>
                <p className="text-muted-foreground/70 text-xs mt-0.5 font-medium">
                  {isAdmin ? t.readingPlan.adminManagement : t.readingPlan.yourSubtitle}
                </p>
              </div>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => navigate(routes.addReadingPlan.path)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm shadow-teal-600/20 transition-all hover:-translate-y-px"
            >
              <Plus className="w-4 h-4" />
              {t.readingPlan.newPlan}
            </button>
          )}
        </div>

        {/* ── Stat chips ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: t.readingPlan.statTotalPlans,
              value: stats.total,
              color: "text-teal-700 dark:text-teal-400",
              bg: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-800/40",
            },
            {
              label: t.readingPlan.quizEnabled,
              value: stats.withQuiz,
              color: "text-emerald-700 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-800/40",
            },
            {
              label: t.readingPlan.statQuizEnabled,
              value: stats.active,
              color: "text-violet-700 dark:text-violet-400",
              bg: "bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-800/40",
            },
            {
              label: t.readingPlan.statEasy,
              value: stats.easy,
              color: "text-amber-700 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-800/40",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("rounded-2xl border p-4 text-center", s.bg)}
            >
              <p
                className={cn("text-3xl font-bold", s.color)}
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
            <input
              value={search}
              onChange={(e: { target: { value: any; }; }) => setSearch(e.target.value)}
              placeholder={t.readingPlan.searchPlanId}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground/80 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-44 rounded-xl border-border bg-card shadow-sm text-sm focus:ring-teal-400/40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CATEGORY_KEY).map((val) => (
                  <SelectItem key={val} value={val}>
                    {catLabel(val, t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Plans list ── */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground/70 font-medium">
                {plans.length === 0
                  ? t.readingPlan.noPlansYet
                  : t.readingPlan.noSearchMatch}
              </p>
              {plans.length === 0 && (
                <button
                  onClick={() => navigate("/add-reading-plan")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all"
                >
                  <Plus className="w-4 h-4" />
                  {t.readingPlan.createFirstPlan}
                </button>
              )}
            </div>
          ) : (
            filtered.map((plan) => {
              const ds = DIFF_STYLES[plan.difficulty] ?? {
                bar: "bg-stone-400",
                badge: "bg-muted text-muted-foreground border-border",
              };
              return (
                <div
                  key={plan.planId}
                  className={cn(
                    "bg-card rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:shadow-md",
                    plan.isActive === false
                      ? "border-border/50 opacity-60"
                      : "border-border/50 hover:border-border",
                  )}
                >
                  {/* Coloured left bar */}
                  <div className="flex">
                    <div className={cn("w-1 rounded-l-2xl shrink-0", ds.bar)} />
                    <div className="flex-1 flex items-start gap-4 p-4 sm:p-5 min-w-0">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-foreground text-base leading-tight">
                            {plan.title}
                          </h3>
                          {plan.isActive === false && (
                            <span                              className="text-[10px] border border-border bg-muted text-muted-foreground/70 rounded px-1.5 py-0.5 font-bold uppercase tracking-wide"
                            >
                              {t.readingPlan.inactiveBadge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground/70 font-mono mb-2">
                          {plan.planId}
                        </p>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2.5">
                            {plan.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border",
                              ds.badge,
                            )}
                          >
                            {diffLabel(plan.difficulty, t)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-muted text-muted-foreground border-border">
                            {catLabel(plan.category, t)}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border bg-muted text-muted-foreground border-border">
                            <Calendar className="w-3 h-3" />
                            {t.readingPlan.daysCount.replace('{n}', String(plan.total_days))}
                          </span>
                          {plan.questionsEnabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/40">
                              <HelpCircle className="w-3 h-3" />
                              {t.dashboard.quiz}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 self-center">
                        {isAdmin && (
                          <>
                            {/* Toggle */}
                            <button
                              onClick={() => toggleActive(plan)}
                              title={
                                plan.isActive !== false ? t.readingPlan.deactivateTitle : t.readingPlan.activateTitle
                              }
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            >
                              {plan.isActive !== false ? (
                                <ToggleRight className="w-6 h-6 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="w-6 h-6 text-muted-foreground/50" />
                              )}
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => openEdit(plan)}
                              title={t.readingPlan.editPlanTitle}
                              className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950/30 text-muted-foreground/70 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => {
                                setDeleteTarget(plan);
                                setDeleteConfirmText("");
                              }}
                              title={t.readingPlan.deletePlanTitle}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-muted-foreground/70 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {!isAdmin && (
                          <button
                            onClick={() => startPlan(plan)}
                            title={t.readingPlan.startPlanTitle}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-muted-foreground/70 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {/* View */}
                        <Link
                          to={routes.readingPlanDetail.path.replace(":planId", plan.planId)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground/70 hover:text-foreground/80 transition-colors"
                        >
                          <ChevronRight className={cn("w-4 h-4", isRtl && "rotate-180")} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground/70 text-center pb-4 font-medium">
            {plans.length === 1
              ? t.readingPlan.showingCount.replace('{filtered}', String(filtered.length)).replace('{total}', String(plans.length))
              : t.readingPlan.showingCountPlural.replace('{filtered}', String(filtered.length)).replace('{total}', String(plans.length))}
          </p>
        )}
      </div>

      {/* ══ DELETE DIALOG ══ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl border-border/50">
          <DialogHeader>              <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {t.readingPlan.deleteDialogTitle}
            </DialogTitle>
            <DialogDescription>
              {t.readingPlan.deleteDialogDesc}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-border/50 bg-muted p-3 space-y-1">
                <p className="font-bold text-sm text-foreground">
                  {deleteTarget.title}
                </p>
                <p className="text-xs text-muted-foreground/70 font-mono">
                  {deleteTarget.planId}
                </p>
                <div className="flex gap-1.5 pt-1">
                  <span className="text-[10px] border border-border bg-card text-muted-foreground rounded px-1.5 py-0.5 font-semibold">
                    {t.readingPlan.daysCount.replace('{n}', String(deleteTarget.total_days))}
                  </span>
                  <span className="text-[10px] border border-border bg-card text-muted-foreground rounded px-1.5 py-0.5 font-semibold">
                    {catLabel(deleteTarget.category, t)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground/80">
                  {t.readingPlan.deleteConfirmLabel.replace('{planId}', deleteTarget.planId)}
                </Label>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t.readingPlan.deleteConfirmPlaceholder}
                  className={cn(
                    "rounded-xl border-border focus:ring-teal-400/30",
                    deleteConfirmText &&
                      (deleteConfirmText === deleteTarget.planId
                        ? "border-red-400"
                        : "border-border"),
                  )}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              {t.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={deleting || deleteConfirmText !== deleteTarget?.planId}
              onClick={confirmDelete}
              className="gap-2 rounded-xl"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.readingPlan.deletingLabel}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {t.readingPlan.deletePlanButton}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReadingPlans;
