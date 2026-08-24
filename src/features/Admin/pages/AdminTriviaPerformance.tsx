// AdminTriviaPerformance — trivia analytics with overview, user, and question stats
import { useAdminTriviaPerformancePage } from "../hooks/useAdminTriviaPerformancePage";
import {
  ArrowLeft, Users, BarChart3, TrendingUp, Search,
  Loader2, Sparkles, Trophy, Target, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { routes } from "@/components/Routes/routes";

// ── Types ──
interface OverviewStats {
  totalParticipants: number;
  totalAnswers: number;
  averageScore: number;
  todayAnswers: number;
  dailyActiveParticipants: number;
  difficultyBreakdown: Record<string, { count: number; avgScore: number }>;
}
interface UserPerf {
  userId: string;
  username: string;
  email: string;
  correctAnswers: number;
  score: number;
interface QuestionPerf {
  questionId: number;
  questionText: string;
  difficulty: string;
// ── Stat card ──
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
// ── Main page ──
export default function AdminTriviaPerformance() {
  const h = useAdminTriviaPerformancePage();
    <div className="min-h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold">Trivia Performance</h1>
            <p className="text-xs text-muted-foreground">Analytics and statistics</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadAll} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
      </header>
      <div className="px-4 sm:px-6 py-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" />Users</TabsTrigger>
            <TabsTrigger value="questions"><TrendingUp className="w-4 h-4 mr-1.5" />Questions</TabsTrigger>
          </TabsList>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {overview && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <StatCard label="Total Participants" value={overview.totalParticipants ?? "—"} icon={Users} color="bg-primary/10 text-primary" />
                  <StatCard label="Total Answers" value={overview.totalAnswers ?? "—"} icon={BarChart3} color="bg-violet-500/10 text-violet-600" />
                  <StatCard label="Avg Score" value={overview.averageScore ? `${overview.averageScore}%` : "—"} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
                  <StatCard label="Today's Answers" value={overview.todayAnswers ?? "—"} icon={Sparkles} color="bg-amber-500/10 text-amber-600" />
                  <StatCard label="Daily Active" value={overview.dailyActiveParticipants ?? "—"} icon={Users} color="bg-sky-500/10 text-sky-600" />
                </div>
                {overview.difficultyBreakdown && Object.keys(overview.difficultyBreakdown).length > 0 && (
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-sm font-bold">Difficulty Breakdown</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(overview.difficultyBreakdown).map(([diff, stats]) => (
                          <div key={diff} className="text-center p-3 rounded-lg bg-muted/30">
                            <p className="text-xs text-muted-foreground capitalize">{diff}</p>
                            <p className="text-lg font-bold">{stats.count}</p>
                            <p className="text-xs text-muted-foreground">avg {stats.avgScore}%</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {users.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No Participants</p>
                <p className="text-sm">No users have answered trivia questions yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <Card key={u.userId} className="cursor-pointer hover:border-primary/30 transition-colors"
                    onClick={() => navigate(`${routes.adminTriviaUserDetail.path.replace(":userId", u.userId)}`)}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Trophy className="w-5 h-5 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{u.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{u.score ?? 0}%</p>
                        <p className="text-[10px] text-muted-foreground">{u.correctAnswers}/{u.totalAnswers}</p>
                ))}
          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-2">
            {questions.length === 0 ? (
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No Question Data</p>
                <p className="text-sm">Questions need to be answered before stats appear.</p>
              questions.map((q) => {
                const pct = q.totalAnswers > 0 ? Math.round((q.correctAnswers / q.totalAnswers) * 100) : 0;
                return (
                  <Card key={q.questionId}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-2 flex-1">{q.questionText}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted shrink-0 capitalize">{q.difficulty}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span><Target className="w-3 h-3 inline mr-1" />{q.correctAnswers}/{q.totalAnswers} correct</span>
                        <span className="font-semibold text-foreground">{pct}%</span>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                );
              })
        </Tabs>
      </div>
    </div>
