import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, ChevronRight, Loader2, Play, Calendar, CheckCircle2, 
  Flame, Target, TrendingUp, LayoutList, Trophy, Trash2, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

interface ReadingPlan {
  planId: string;
  title: string;
  description: string;
  totalDays: number;
  category: string;
  difficulty: string;
  isActive: boolean;
  questionsEnabled: boolean;
}

interface UserPlan {
  planId: string;
  planName: string;
  description: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  completedDays: number;
  isCompleted: boolean;
  streak: number;
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "intro", label: "Introductory" },
  { value: "whole-bible", label: "Whole Bible" },
  { value: "nt", label: "New Testament" },
  { value: "ot", label: "Old Testament" },
  { value: "book", label: "Book by Book" },
  { value: "topical", label: "Topical" },
];

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Beginner",
  medium: "Intermediate", 
  hard: "Advanced",
};

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  hard: "bg-red-100 text-red-700 border-red-200",
};

const catLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label ?? cat;

export default function UserPlans() {
  const [activeTab, setActiveTab] = useState<"progress" | "browse">("progress");
  const [allPlans, setAllPlans] = useState<ReadingPlan[]>([]);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [catFilter, setCatFilter] = useState("all");
  const [removeModal, setRemoveModal] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allRes, userRes] = await Promise.all([
        sendPostRequest("reading-plans", "get-all", {}),
        sendPostRequest("reading-plans", "get-user-plans", {}),
      ]);

      if (allRes.returnCode === 200 && allRes.returnData) {
        const plans = allRes.returnData.plans ?? allRes.returnData;
        setAllPlans(Array.isArray(plans) ? plans : []);
      }

      if (userRes.returnCode === 200 && userRes.returnData) {
        setUserPlans(userRes.returnData as UserPlan[]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const startPlan = async (planId: string, title: string) => {
    try {
      const res = await sendPostRequest("reading-plans", "start", { planId });
      if (res.returnCode === 200) {
        toast({ title: "Plan started!", description: `You've started "${title}". Let's build that habit!` });
        await loadData();
        setActiveTab("progress");
      } else {
        toast({ title: "Failed to start", description: res.returnMessage, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Unable to start plan", variant: "destructive" });
    }
  };

  const removePlan = async (planId: string) => {
    try {
      const res = await sendPostRequest("reading-plans", "remove", { planId });
      if (res.returnCode === 200) {
        toast({ title: "Plan removed", description: "Your progress has been lost." });
        await loadData();
      } else {
        toast({ title: "Failed to remove", description: res.returnMessage, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Unable to remove plan", variant: "destructive" });
    }
    setRemoveModal(null);
  };

  const filteredPlans = allPlans.filter(p => catFilter === "all" || p.category === catFilter);

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const inProgressPlans = userPlans.filter(p => !p.isCompleted);
  const completedPlans = userPlans.filter(p => p.isCompleted);

  const renderProgressTab = () => {
    if (userPlans.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No active plan yet</h3>
          <p className="text-muted-foreground text-center mb-6 max-w-xs">
            Head over to Browse Plans and start your first reading plan.
          </p>
          <Button onClick={() => setActiveTab("browse")}>
            Browse Plans
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {inProgressPlans.length > 0 && (
          <div className="space-y-4">
            {inProgressPlans.map((plan) => {
              const pct = getProgressPercentage(plan.completedDays, plan.totalDays);
              const nextDay = plan.completedDays + 1;
              
              return (
                <Card key={plan.planId} className="border-l-4 border-l-primary overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{plan.planName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.completedDays} of {plan.totalDays} days done
                        </p>
                      </div>
                      <div className="w-16 h-16 relative">
                        <svg className="w-16 h-16 -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-muted/20" />
                          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" 
                            strokeDasharray={`${pct * 1.76} 176`} className="text-primary" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">{pct}% complete</p>

                    <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-lg p-3">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                          <Flame className="w-4 h-4" />
                          <span className="font-bold">{plan.streak}d</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Streak</p>
                      </div>
                      <div className="text-center border-l border-border">
                        <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="font-bold">{plan.completedDays}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Done</p>
                      </div>
                      <div className="text-center border-l border-border">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                          <BookOpen className="w-4 h-4" />
                          <span className="font-bold">Day {Math.min(plan.completedDays + 1, plan.totalDays)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Next</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => navigate(`${routes.readingPlanDetail.path.replace(":planId", plan.planId)}`)}>
                        <Play className="w-4 h-4 mr-2" />
                        {plan.completedDays === 0 ? "Begin Day 1" : `Continue · Day ${nextDay}`}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => setRemoveModal(plan.planId)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {completedPlans.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-emerald-500" />
              <h3 className="text-lg font-semibold text-muted-foreground">Completed Plans</h3>
            </div>
            <div className="space-y-4">
              {completedPlans.map((plan) => {
                const pct = getProgressPercentage(plan.completedDays, plan.totalDays);
                
                return (
                  <Card key={plan.planId} className="border-l-4 border-l-emerald-500 overflow-hidden opacity-80">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{plan.planName}</CardTitle>
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">Done</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {plan.totalDays} days completed
                          </p>
                        </div>
                        <div className="w-14 h-14 relative">
                          <svg className="w-14 h-14 -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" className="text-emerald-200" />
                            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="none" 
                              strokeDasharray="150.8" className="text-emerald-500" />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-emerald-600">
                            100%
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => navigate(`${routes.readingPlanDetail.path.replace(":planId", plan.planId)}`)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Summary
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => navigate(`${routes.readingPlanDetail.path.replace(":planId", plan.planId)}`)}>
                        <Play className="w-4 h-4 mr-2" />
                        Revisit
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBrowseTab = () => (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCatFilter(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              catFilter === cat.value ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card className="border-teal-200 bg-teal-50/50">
          <CardContent className="py-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-teal-400" />
            <h3 className="text-xl font-semibold mb-2">No plans found</h3>
            <p className="text-muted-foreground">Check back later for new reading plans.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const userPlan = userPlans.find(up => up.planId === plan.planId);
            const hasStarted = !!userPlan;
            const isCompleted = userPlan?.isCompleted || false;
            const isActive = hasStarted && !isCompleted;
            const pct = userPlan ? getProgressPercentage(userPlan.completedDays, plan.totalDays) : 0;

            return (
              <Card 
                key={plan.planId} 
                className={`overflow-hidden ${isActive ? "border-primary/50" : isCompleted ? "border-emerald-500/50" : ""}`}
              >
                {(isActive || isCompleted) && (
                  <div className={`h-1 ${isCompleted ? "bg-emerald-500" : "bg-primary"}`} />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{plan.title}</CardTitle>
                        {isCompleted && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Done</span>}
                        {isActive && <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">Active</span>}
                      </div>
                      <CardDescription className="mt-1 line-clamp-2">{plan.description}</CardDescription>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${DIFFICULTY_COLORS[plan.difficulty] || "bg-muted"}`}>
                      {DIFFICULTY_LABEL[plan.difficulty] || plan.difficulty}
                    </span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-medium">{catLabel(plan.category)}</span>
                    <span className="text-xs px-2 py-1 bg-muted rounded-lg font-medium">{plan.totalDays} days</span>
                    {plan.questionsEnabled && <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-lg font-medium">Q&A</span>}
                  </div>

                  {hasStarted && userPlan && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{userPlan.completedDays}/{plan.totalDays} · {pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isCompleted ? "bg-emerald-500" : "bg-primary"}`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {hasStarted ? (
                      <Button className="flex-1" onClick={() => navigate(`${routes.readingPlanDetail.path.replace(":planId", plan.planId)}`)}>
                        {isCompleted ? "View Summary" : "Continue Reading"}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    ) : (
                      <Button className="flex-1" onClick={() => startPlan(plan.planId, plan.title)} disabled={!plan.isActive}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Plan
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate(`${routes.readingPlanDetail.path.replace(":planId", plan.planId)}`)}>
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-teal-50/50 to-background p-6 lg:p-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Reading Plans</h1>
            <p className="text-sm text-muted-foreground">Build a daily Bible habit</p>
          </div>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "progress" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            My Progress
            {inProgressPlans.length > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                {inProgressPlans.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
              activeTab === "browse" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            Browse Plans
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "progress" ? (
          renderProgressTab()
        ) : (
          renderBrowseTab()
        )}
      </div>

      {removeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Remove Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to remove this plan? Your progress will be lost.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setRemoveModal(null)}>
                  Keep It
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => removePlan(removeModal)}>
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}