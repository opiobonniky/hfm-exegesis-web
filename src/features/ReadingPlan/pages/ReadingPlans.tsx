import { useNavigate } from "react-router-dom";
import { Shield, Loader2, Plus, BookOpen, Calendar, Users, ChevronRight, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Gate } from "@/components/Gate";
import { routes } from "@/components/Routes/routes";
import { useReadingPlansPage } from "../hooks/useReadingPlansPage";
import { DIFF_STYLES, diffLabel, catLabel } from "../constants";

const ReadingPlans = () => {
  const p = useReadingPlansPage();
  const { t, isRtl, navigate, plans, loading, page, setPage, totalPages, hasNext, hasPrevious } = p;
  return (
    <Gate tier="legacy_sower" featureName="Reading Plans" featureDescription="Track your daily Bible reading progress with personalized reading plans.">
      <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <div className={cn("h-1", isRtl ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-teal-400 via-emerald-400 to-cyan-400")} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-7">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-100 flex items-center justify-center shadow-sm"><Shield className="h-5 h-5 text-teal-700" /></div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>{t.readingPlan?.readingPlans || "Reading Plans"}</h1>
                <p className="text-muted-foreground/70 text-xs mt-0.5 font-medium">{t.readingPlan?.buildHabit || "Build a daily Bible habit"}</p>
              </div>
            </div>
            <Button onClick={() => navigate("/admin/plans/new")} className="gap-2"><Plus className="w-4 h-4" />{t.readingPlan?.createPlan || "Create Plan"}</Button>
          </div>
          {/* Plans grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{t.readingPlan?.noPlans || "No plans yet"}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.readingPlan?.noPlansDesc || "Create your first reading plan to get started."}</p>
              <Button onClick={() => navigate("/admin/plans/new")} className="gap-2"><Plus className="w-4 h-4" />Create Plan</Button>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const diff = DIFF_STYLES[plan.difficulty] || DIFF_STYLES.easy;
                return (
                  <div key={plan.id} className="rounded-2xl border border-border/50 bg-card p-5 hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(routes.readingPlanDetail.path.replace(":planId", plan.planId))}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{plan.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{plan.totalDays || plan.total_days} {t.readingPlan?.days || "days"}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] font-bold", diff.badge)}>{diffLabel(plan.difficulty, t)}</Badge>
                    </div>
                    {plan.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{plan.description}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{catLabel(plan.category, t)}</span>
                      {plan.questionsEnabled && <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />Q&A</span>}
                      {plan.assignedUsers !== undefined && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{plan.assignedUsers}</span>}
                    {plan.completionRate !== undefined && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-teal-500" style={{ width: `${plan.completionRate}%` }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{plan.completionRate}% complete</p>
                    )}
                    <ChevronRight className={cn("w-4 h-4 text-muted-foreground/30 mt-3", isRtl && "rotate-180")} />
                  </div>
                );
              })}
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!hasPrevious} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      </div>
    </Gate>
  );
};
export default ReadingPlans;
