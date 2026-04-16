"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ChevronRight,
  Play,
  Eye,
  CheckCircle,
  LayoutList,
  TrendingUp,
  Trash2,
  Trophy,
  Loader2,
  RefreshCw,
  Shield,
  Flame,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface ReadingPlan {
  planId: string;
  title: string;
  description: string;
  total_days: number;
  totalDays?: number;
  questionsEnabled: boolean;
  questions_enabled?: boolean;
  category: string;
  difficulty: string;
  isActive: boolean;
  is_active?: boolean;
  started?: boolean;
  completed?: boolean;
  is_completed?: boolean | null;
  progress?: number;
  streak?: number;
  startDate?: string;
  start_date?: string;
  lastCompletedDate?: string;
  last_completed_date?: string;
  completedDays?: number;
  completed_days_count?: number;
  completion_percentage?: number;
}

interface UserProgress {
  planId: string;
  startDate: string;
  completedDaysJson: string;
  lastCompletedDate: string | null;
  streak: number;
  isCompleted: boolean;
  completedDate: string | null;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "intro", label: "Introduction" },
  { value: "whole-bible", label: "Whole Bible" },
  { value: "nt", label: "New Testament" },
  { value: "ot", label: "Old Testament" },
  { value: "book", label: "Single Book" },
  { value: "topical", label: "Topical" },
];

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Beginner",
  medium: "Intermediate",
  hard: "Advanced",
};

const DIFFICULTY_COLOR: Record<string, { bar: string; badge: string }> = {
  easy: {
    bar: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  medium: {
    bar: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  hard: { bar: "bg-red-500", badge: "bg-red-50 text-red-700 border-red-200" },
};

const catLabel = (cat: string) =>
  CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

type Tab = "progress" | "browse";

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
const ProgressCircle = ({
  percent,
  color = "#14b8a6",
  backgroundColor = "#e5e7eb",
  size = 68,
}: {
  percent: number;
  color?: string;
  backgroundColor?: string;
  size?: number;
}) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const BibleReadingPlan = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.userRole === 1;

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("progress");
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [myPlans, setMyPlans] = useState<ReadingPlan[]>([]);
  const [activePlans, setActivePlans] = useState<ReadingPlan[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({});
  const [refreshing, setRefreshing] = useState(false);

  const [startPlanModalVisible, setStartPlanModalVisible] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<ReadingPlan | null>(null);
  const [removePlanModalVisible, setRemovePlanModalVisible] = useState(false);
  const [planToRemove, setPlanToRemove] = useState<ReadingPlan | null>(null);

  // ── API ─────────────────────────────────────
  const loadData = useCallback(async (load: boolean = true) => {
    setLoading(load);
    try {
      // Fetch both all plans and user's started plans
      const [allRes, userRes] = await Promise.all([
        sendPostRequest("reading-plans", "get-all", {}),
        sendPostRequest("reading-plans", "get-user-plans", {}),
      ]);

      const { returnData: allData, returnCode, returnMessage } = allRes;

      if (returnCode === 200 && allData) {
        const plansData = allData.plans ?? allData;
        const allPlans = (Array.isArray(plansData) ? plansData : []) as ReadingPlan[];
        
        // Normalize plan data
        const normalizedPlans = allPlans.map((p) => ({
          ...p,
          started: p.started ?? false,
          completed: p.completed ?? false,
          isActive: p.isActive ?? p.is_active ?? true,
          totalDays: p.totalDays ?? p.total_days ?? 0,
          questionsEnabled: p.questionsEnabled ?? p.questions_enabled ?? false,
        }));
        
        setPlans(normalizedPlans);

        // Process user progress from get-user-plans
        let userProgressMap: Record<string, UserProgress> = {};
        let startedPlans: ReadingPlan[] = [];
        
        if (userRes.returnCode === 200 && userRes.returnData) {
          const userPlansData = userRes.returnData as any[];
          userPlansData.forEach((up) => {
            const plan = normalizedPlans.find((p) => p.planId === up.planId);
            if (plan) {
              // Mark this plan as started
              const startedPlan = { 
                ...plan, 
                started: true,
                completed: up.isCompleted,
                isCompleted: up.isCompleted,
                streak: up.streak,
                completedDays: up.completedDays,
              };
              startedPlans.push(startedPlan);
              
              // Build progress map
              userProgressMap[up.planId] = {
                planId: up.planId,
                startDate: up.startDate || new Date().toISOString(),
                completedDaysJson: JSON.stringify(Array.from({ length: up.completedDays || 0 }, (_, i) => i + 1)),
                lastCompletedDate: up.lastCompletedDate || null,
                streak: up.streak || 0,
                isCompleted: up.isCompleted || false,
                completedDate: up.completedDate || null,
              };
            }
          });
        }
        
        setMyPlans(startedPlans);

        // Active (in-progress) plans - not completed
        const active = startedPlans.filter((p) => !(p.isCompleted || p.completed));
        setActivePlans(active);

        setUserProgress(Object.values(userProgressMap));
        setProgressMap(userProgressMap);
      } else {
        console.warn("Failed to load reading plans:", returnMessage);
      }
    } catch (err) {
      console.error("Failed to load reading plans", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  };

  const startPlan = async (plan: ReadingPlan) => {
    try {
      const response = await sendPostRequest("reading-plans", "start", {
        planId: plan.planId,
      });
      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        toast({
          title: "Reading plan started!",
          description: `You've started "${plan.title}". Good luck!`,
        });
        await loadData();
        setActiveTab("progress");
      } else {
        toast({
          title: "Failed to start plan",
          description: returnMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error starting plan:", error);
      toast({
        title: "Error",
        description: "Failed to start reading plan",
        variant: "destructive",
      });
    }
  };

  const removePlan = async (plan: ReadingPlan) => {
    try {
      const response = await sendPostRequest("reading-plans", "remove", {
        planId: plan.planId,
      });
      const { returnCode, returnMessage } = response;
      if (returnCode === 200) {
        toast({
          title: "Reading plan removed",
          description: "Your progress has been lost.",
        });
        await loadData(false);
      } else {
        toast({
          title: "Failed to remove plan",
          description: returnMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing plan:", error);
      toast({
        title: "Error",
        description: "Failed to remove reading plan",
        variant: "destructive",
      });
    }
  };

  const getCompletedDays = (pr: UserProgress): number[] => {
    try {
      return pr.completedDaysJson ? JSON.parse(pr.completedDaysJson) : [];
    } catch {
      return [];
    }
  };

  // ── Tab: My Progress ────────────────────────
  const renderProgressTab = () => {
    if (!myPlans.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-teal-500" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">
            No active plan yet
          </h3>
          <p className="text-sm text-stone-500 text-center mb-6 max-w-xs">
            Head over to Browse Plans and start your first reading plan.
          </p>
          <button
            onClick={() => setActiveTab("browse")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-all"
          >
            Browse Plans
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    const inProgress = myPlans.filter(
      (p) => !progressMap[p.planId]?.isCompleted
    );
    const completed = myPlans.filter(
      (p) => progressMap[p.planId]?.isCompleted
    );

    return (
      <div className="space-y-6">
        {/* In-progress plans */}
        {inProgress.map((plan) => {
          const pr = progressMap[plan.planId];
          const done = pr ? getCompletedDays(pr) : [];
          const pct = Math.round((done.length / (plan.totalDays || plan.total_days || 1)) * 100);
          const streak = pr?.streak || 0;
          const nextDay =
            done.length > 0
              ? Math.min(Math.max(...done) + 1, plan.totalDays || plan.total_days)
              : 1;
          const lastDay = done.length > 0 ? Math.max(...done) : null;

          return (
            <ActivePlanCard
              key={plan.planId}
              plan={plan}
              pct={pct}
              done={done.length}
              streak={streak}
              nextDay={nextDay}
              lastDay={lastDay}
              isCompleted={false}
              onRead={() =>
                navigate(
                  routes.dailyReading.path.replace(":planId", plan.planId).replace(":day", String(nextDay))
                )
              }
              onSummary={() =>
                navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId))
              }
              onRemove={() => {
                setPlanToRemove(plan);
                setRemovePlanModalVisible(true);
              }}
            />
          );
        })}

        {/* Completed plans section */}
        {completed.length > 0 && (
          <>
            <div className="flex items-center gap-2 pt-4">
              <Trophy className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-stone-600">
                Completed Plans
              </span>
            </div>

            {completed.map((plan) => {
              const pr = progressMap[plan.planId];
              const done = pr ? getCompletedDays(pr) : [];
              const streak = pr?.streak || 0;
              const lastDay =
                done.length > 0 ? Math.max(...done) : (plan.totalDays || plan.total_days);

              return (
                <ActivePlanCard
                  key={plan.planId}
                  plan={plan}
                  pct={100}
                  done={done.length || plan.totalDays || plan.total_days}
                  streak={streak}
                  nextDay={1}
                  lastDay={lastDay}
                  isCompleted={true}
                  onRead={() =>
                    navigate(
                      routes.dailyReading.path.replace(":planId", plan.planId).replace(":day", "1")
                    )
                  }
                  onSummary={() =>
                    navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId))
                  }
                  onRemove={() => {
                    setPlanToRemove(plan);
                    setRemovePlanModalVisible(true);
                  }}
                />
              );
            })}
          </>
        )}
      </div>
    );
  };

  // ── Tab: Browse Plans ────────────────────────
  const renderBrowseTab = () => (
    <div className="space-y-3">
      <p className="text-sm text-stone-500 mb-4">
        Choose a plan that fits your spiritual journey
      </p>

      {plans.map((plan) => {
        const pr = userProgress.find((p) => p.planId === plan.planId);
        const hasStarted = !!pr;
        const isCompleted = pr?.isCompleted || false;
        const isActive = activePlans.some((p) => p.planId === plan.planId);
        const done = pr ? getCompletedDays(pr) : [];
        const pct = hasStarted
          ? Math.round((done.length / (plan.totalDays || plan.total_days || 1)) * 100)
          : 0;

        return (
          <BrowsePlanCard
            key={plan.planId}
            plan={plan}
            isActive={isActive}
            hasStarted={hasStarted}
            isCompleted={isCompleted}
            done={done.length}
            pct={pct}
            onPress={() => {
              if (hasStarted) {
                navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId));
              } else {
                setPendingPlan(plan);
                setStartPlanModalVisible(true);
              }
            }}
          />
        );
      })}
    </div>
  );

  // ── Stats ─────────────────────────────────────
  const stats = {
    total: plans.length,
    active: activePlans.length,
    withQuiz: plans.filter((p) => p.questionsEnabled).length,
  };

  // ─────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-[#f7f5f2]"
      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
    >
      <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm">
              <Shield className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-stone-800 tracking-tight leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                Reading Plans
              </h1>
              <p className="text-stone-400 text-xs mt-0.5 font-medium">
                Build a daily Bible habit
              </p>
            </div>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Total Plans",
              value: stats.total,
              color: "text-teal-700",
              bg: "bg-teal-50 border-teal-100",
            },
            {
              label: "Active",
              value: stats.active,
              color: "text-emerald-700",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: "Quiz Enabled",
              value: stats.withQuiz,
              color: "text-violet-700",
              bg: "bg-violet-50 border-violet-100",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("rounded-2xl border p-4 text-center", s.bg)}
            >
              <p
                className={cn("text-2xl font-bold", s.color)}
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}
              >
                {s.value}
              </p>
              <p className="text-xs text-stone-500 mt-1 font-semibold">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tab row */}
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => setActiveTab("progress")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors",
              activeTab === "progress"
                ? "border-teal-500 text-teal-700"
                : "border-transparent text-stone-500 hover:text-stone-700"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            My Progress
            {activePlans.length > 0 && (
              <span className="ml-1 bg-teal-100 text-teal-700 text-xs rounded-full px-1.5 py-0.5">
                {activePlans.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors",
              activeTab === "browse"
                ? "border-teal-500 text-teal-700"
                : "border-transparent text-stone-500 hover:text-stone-700"
            )}
          >
            <LayoutList className="w-4 h-4" />
            Browse Plans
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        ) : activeTab === "progress" ? (
          renderProgressTab()
        ) : (
          renderBrowseTab()
        )}
      </div>

      {/* Start Plan Modal */}
      {startPlanModalVisible && pendingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-stone-800 mb-2">
              Start Reading Plan
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              Do you want to start "{pendingPlan.title}"? This will set your
              daily reading schedule and track your progress.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setStartPlanModalVisible(false);
                  setPendingPlan(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setStartPlanModalVisible(false);
                  const plan = pendingPlan;
                  setPendingPlan(null);
                  startPlan(plan);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
              >
                Start Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Plan Modal */}
      {removePlanModalVisible && planToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Remove Plan
            </h3>
            <p className="text-sm text-stone-500 mb-6">
              Are you sure you want to remove "{planToRemove.title}"? Your
              progress will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRemovePlanModalVisible(false);
                  setPlanToRemove(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
              >
                Keep It
              </button>
              <button
                onClick={() => {
                  const plan = planToRemove;
                  setRemovePlanModalVisible(false);
                  setPlanToRemove(null);
                  removePlan(plan);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Active Plan Card
// ─────────────────────────────────────────────
function ActivePlanCard({
  plan,
  pct,
  done,
  streak,
  nextDay,
  lastDay,
  isCompleted,
  onRead,
  onSummary,
  onRemove,
}: {
  plan: ReadingPlan;
  pct: number;
  done: number;
  streak: number;
  nextDay: number;
  lastDay: number | null;
  isCompleted: boolean;
  onRead: () => void;
  onSummary: () => void;
  onRemove: () => void;
}) {
  const totalDays = plan.totalDays || plan.total_days || 1;
  const accentColor = isCompleted ? "#10B981" : "#14b8a6";

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border shadow-sm overflow-hidden",
        isCompleted
          ? "border-emerald-200"
          : "border-stone-200 hover:border-stone-300"
      )}
    >
      {/* Colored left stripe */}
      <div className="flex">
        <div
          className="w-1 rounded-l-2xl shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-stone-800 text-lg">
                  {plan.title}
                </h3>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    <Trophy className="w-3 h-3" />
                    Done
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">
                {done} of {totalDays} days done
              </p>
              <button
                onClick={onRemove}
                className="mt-3 text-xs text-stone-400 hover:text-red-500 transition-colors"
              >
                Remove plan
              </button>
            </div>

            <ProgressCircle percent={pct} color={accentColor} size={72} />
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: accentColor }}
            />
          </div>
          <p className="text-xs text-stone-400 mb-4">{pct}% complete</p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 bg-stone-50 rounded-xl p-3 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                <Flame className="w-4 h-4" />
                <span className="font-bold text-stone-800">{streak}d</span>
              </div>
              <p className="text-xs text-stone-500">Streak</p>
            </div>
            <div className="text-center border-l border-stone-200">
              <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="font-bold text-stone-800">{done}</span>
              </div>
              <p className="text-xs text-stone-500">Done</p>
            </div>
            <div className="text-center border-l border-stone-200">
              <div className="flex items-center justify-center gap-1 text-stone-500 mb-1">
                <BookOpen className="w-4 h-4" />
                <span className="font-bold text-stone-800">
                  {lastDay ? `Day ${lastDay}` : "—"}
                </span>
              </div>
              <p className="text-xs text-stone-500">Last read</p>
            </div>
          </div>

          {/* CTAs */}
          {isCompleted ? (
            <div className="flex gap-3">
              <button
                onClick={onSummary}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={onRead}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
              >
                <Play className="w-4 h-4" />
                Revisit
              </button>
            </div>
          ) : (
            <button
              onClick={onRead}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold hover:bg-stone-200 transition-colors"
            >
              <Play className="w-4 h-4" />
              {done === 0 ? "Begin Day 1" : `Continue · Day ${nextDay}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Browse Plan Card
// ─────────────────────────────────────────────
function BrowsePlanCard({
  plan,
  isActive,
  hasStarted,
  isCompleted,
  done,
  pct,
  onPress,
}: {
  plan: ReadingPlan;
  isActive: boolean;
  hasStarted: boolean;
  isCompleted: boolean;
  done: number;
  pct: number;
  onPress: () => void;
}) {
  const totalDays = plan.totalDays || plan.total_days || 1;
  const diffColor =
    DIFFICULTY_COLOR[plan.difficulty]?.badge || "bg-stone-100 text-stone-600";

  return (
    <button
      onClick={onPress}
      className={cn(
        "w-full bg-white rounded-2xl border text-left transition-all hover:shadow-md",
        isActive || isCompleted
          ? "border-teal-200"
          : "border-stone-200 hover:border-stone-300"
      )}
    >
      {(isActive || isCompleted) && (
        <div
          className="h-1 rounded-t-2xl"
          style={{
            backgroundColor: isCompleted ? "#10B981" : "#14b8a6",
          }}
        />
      )}

      <div className="p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-teal-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-stone-800">{plan.title}</h3>
            {isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                Done
              </span>
            )}
            {isActive && !isCompleted && (
              <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 font-semibold">
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-stone-500 line-clamp-2 mb-3">
            {plan.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-lg font-medium border",
                diffColor
              )}
            >
              {DIFFICULTY_LABEL[plan.difficulty] || plan.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-lg font-medium bg-stone-100 text-stone-600">
              {catLabel(plan.category)}
            </span>
            <span className="text-xs px-2 py-1 rounded-lg font-medium bg-stone-100 text-stone-600">
              {totalDays} days
            </span>
            {plan.questionsEnabled && (
              <span className="text-xs px-2 py-1 rounded-lg font-medium bg-violet-100 text-violet-700">
                Q&A
              </span>
            )}
          </div>

          {hasStarted && (
            <div className="bg-stone-50 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-500">
                  {done}/{totalDays} · {pct}%
                </span>
              </div>
              <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isCompleted ? "#10B981" : "#14b8a6",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <ChevronRight className="w-5 h-5 text-stone-400 shrink-0" />
      </div>
    </button>
  );
};

export default BibleReadingPlan;