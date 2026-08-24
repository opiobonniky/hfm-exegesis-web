import { BarChart3, HelpCircle, Clock, Sparkles, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard, SectionLabel, StatCard } from "./PlanDetailUI";

interface PlanAdminTabProps {
  adminStats: any;
  filteredUsers: any[];
  userSearchTerm: string;
  setUserSearchFilter: (v: string) => void;
  plan: any;
  isRtl: boolean;
  lang: string;
  t: any;
}
export function PlanAdminTab({ adminStats, filteredUsers, userSearchTerm, setUserSearchFilter, plan, isRtl, lang, t }: PlanAdminTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<BarChart3 className="w-4 h-4 text-violet-600" />} label={t.readingPlan.totalEnrollments} value={adminStats?.totalEnrollments ?? "—"} accent="bg-violet-50" />
        <StatCard icon={<HelpCircle className="w-4 h-4 text-sky-600" />} label={t.readingPlan.quizAnswersCW} value={adminStats?.totalQuizAnswers > 0 ? `${adminStats.totalQuizCorrect} / ${adminStats.totalQuizWrong}` : "0 / 0"} accent="bg-sky-50" />
        <StatCard icon={<Clock className="w-4 h-4 text-amber-600" />} label={t.readingPlan.inProgressCount} value={adminStats?.inProgressEnrollments ?? "—"} accent="bg-amber-50" />
        <StatCard icon={<Sparkles className="w-4 h-4 text-indigo-600" />} label={t.readingPlan.globalQuizAccuracy} value={`${adminStats?.globalQuizAccuracy ?? 0}%`} accent="bg-indigo-50" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GlassCard className="p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <SectionLabel>{t.readingPlan.userProgressDetails}</SectionLabel>
            <input type="text" placeholder={t.readingPlan.searchUsers} value={userSearchTerm} onChange={(e) => setUserSearchFilter(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full sm:w-48 transition-all" />
          </div>
          <div className="overflow-x-auto">
            <table className={cn("w-full", isRtl ? "text-right" : "text-left")}>
              <thead>
                <tr className="border-b border-border/50">
                  <th className={cn("pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider", isRtl ? "text-right" : "text-left")}>{t.common.name}</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">{t.readingPlan.progress}</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">{t.readingPlan.streak}</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">{t.readingPlan.quizCW}</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider text-center">{t.readingPlan.lastActivity}</th>
                  <th className={cn("pb-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider", isRtl ? "text-left" : "text-right")}>{t.common.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length > 0 ? filteredUsers.map((u: any, i: number) => (
                  <tr key={i} className="hover:bg-background/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          {u.photo && u.photo.replace(/[`\s]/g, "") ? <img src={u.photo.replace(/[`\s]/g, "")} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground/70 bg-muted">{u.name?.charAt(0) || "?"}</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{ width: `${u.completionPercentage}%` }} /></div>
                        <span className="text-[10px] font-medium text-muted-foreground">{u.completedDaysCount} / {plan.total_days} {t.readingPlan.days}</span>
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold"><Flame className="w-3 h-3" />{u.streak}d</div>
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="text-emerald-600">{u.quizStats?.correct || 0}</span>
                          <span className="text-muted-foreground/50">/</span>
                          <span className="text-rose-600">{u.quizStats?.wrong || 0}</span>
                        <span className="text-[9px] text-muted-foreground/70">{u.quizStats?.accuracy || 0}%</span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{u.lastActivity ? new Date(u.lastActivity).toLocaleDateString(lang) : t.readingPlan.dateNotSet}</span>
                    <td className="py-3 pl-4 text-right">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border", u.status === "completed" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : u.status === "inprogress" ? "bg-sky-50 border-sky-100 text-sky-700" : "bg-background border-border/50 text-muted-foreground")}>
                        {u.status === "completed" ? t.readingPlan.done : u.status === "inprogress" ? t.readingPlan.inProgress : t.readingPlan.startedLabel}
                      </span>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-8 text-center text-xs text-muted-foreground/70 italic">{userSearchTerm.trim() ? t.readingPlan.noUsersMatching.replace("{term}", userSearchTerm) : t.readingPlan.noUsersEnrolled}</td></tr>
                )}
              </tbody>
            </table>
        </GlassCard>
        <div className="space-y-5">
          <GlassCard className="p-5">
            <SectionLabel>{t.readingPlan.engagementTrends}</SectionLabel>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{t.readingPlan.globalAccuracyLabel}</p>
                  <p className="text-2xl font-bold text-foreground">{adminStats?.globalQuizAccuracy ?? 0}%</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">{t.readingPlan.mostDifficultQuestions}</p>
                {adminStats?.difficultQuestions?.length > 0 ? adminStats.difficultQuestions.map((q: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-xs font-medium text-foreground truncate">{q.question}</p>
                      <p className="text-[10px] text-muted-foreground">{t.readingPlan.day} {q.dayNumber} · {q.totalAnswers} {t.readingPlan.quizAnswersCW.toLowerCase()}</p>
                    </div>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-md", q.accuracy < 30 ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>{q.accuracy}%</span>
                  </div>
                )) : <p className="text-xs text-muted-foreground italic">{t.readingPlan.noQuizData}</p>}
            </div>
          </GlassCard>
            <SectionLabel>{t.readingPlan.planStructureSummary}</SectionLabel>
            <div className="space-y-3">
              {[
                { label: t.readingPlan.dailyAssignments, value: adminStats?.assignmentsCount ?? 0 },
                { label: t.readingPlan.quizQuestionsCount, value: adminStats?.questionsCount ?? 0 },
                { label: t.readingPlan.avgQsPerDay, value: adminStats?.assignmentsCount > 0 ? (adminStats.questionsCount / adminStats.assignmentsCount).toFixed(1) : 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-bold text-foreground">{value}</span>
              ))}
              <div className="mt-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2"><Zap className="w-4 h-4 text-indigo-600" /><p className="text-sm font-bold text-indigo-900">{t.readingPlan.proTip}</p></div>
                <p className="text-xs text-indigo-700 leading-relaxed">{t.readingPlan.proTipContent}</p>
        </div>
    </div>
  );
