// AdminTrivia — thin page composing hooks + components
"use client";
import { Sparkles, Plus, Search, Loader2, Trash2, BarChart3, Users, HelpCircle, TrendingUp, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAdminTrivia } from "../hooks/useAdminTrivia";
import { DIFFICULTY_OPTIONS, CATEGORY_OPTIONS, TRIVIA_PAGE_SIZE } from "../constants";
import { TriviaStatCard, TriviaQuestionCard, TriviaQuestionDialog, difficultyColor } from "../components";

const DIFFICULTIES = ["easy", "medium", "hard"];
const AdminTrivia = () => {
  const h = useAdminTrivia();
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={h.isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Trivia Management</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and analyze Bible trivia questions</p>
        <a href="/admin/trivia/performance" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
          <Activity className="w-3.5 h-3.5" /> Performance
        </a>
      </div>
      <Tabs value={h.activeTab} onValueChange={h.setActiveTab} className="space-y-4">
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="overview" className="whitespace-nowrap"><BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Overview</TabsTrigger>
          <TabsTrigger value="questions" className="whitespace-nowrap"><HelpCircle className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Questions</TabsTrigger>
          <TabsTrigger value="users" className="whitespace-nowrap"><Users className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />User Performance</TabsTrigger>
          <TabsTrigger value="performance" className="whitespace-nowrap"><TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Question Stats</TabsTrigger>
        </TabsList>
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <TriviaStatCard label="Total Participants" value={h.overviewStats?.totalParticipants ?? "—"} icon={Users} color="bg-primary/10 text-primary" />
            <TriviaStatCard label="Total Answers" value={h.overviewStats?.totalAnswers ?? "—"} icon={BarChart3} color="bg-violet-500/10 text-violet-600" />
            <TriviaStatCard label="Avg Score" value={h.overviewStats ? `${h.overviewStats.averageScore}%` : "—"} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
            <TriviaStatCard label="Today's Answers" value={h.overviewStats?.todayAnswers ?? "—"} icon={Sparkles} color="bg-amber-500/10 text-amber-600" />
            <TriviaStatCard label="Daily Active" value={h.overviewStats?.dailyActiveParticipants ?? "—"} icon={Users} color="bg-sky-500/10 text-sky-600" />
          </div>
          {h.overviewStats?.difficultyBreakdown && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm font-bold">Difficulty Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(h.overviewStats.difficultyBreakdown).map(([diff, stats]) => (
                    <div key={diff} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Badge variant="outline" className={cn("mb-2", difficultyColor(diff))}>{diff}</Badge>
                      {["Answered", "Correct", "Rate"].map(label => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className={cn("font-medium", label === "Correct" && "text-emerald-600")}>
                            {label === "Answered" ? stats.total : label === "Correct" ? stats.correct : `${stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base">All Questions <span className="text-muted-foreground font-normal">({h.totalQuestions})</span></CardTitle>
                <Button size="sm" onClick={h.openCreateDialog}><Plus className="w-4 h-4 mr-1.5" />New Question</Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search questions..." value={h.searchQuery} onChange={e => h.setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
                  {h.searchQuery && <button onClick={() => h.setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><span className="text-xs">✕</span></button>}
                <Select value={h.difficultyFilter} onValueChange={h.setDifficultyFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={h.categoryFilter} onValueChange={h.setCategoryFilter}>
                  <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORY_OPTIONS.filter(c => c !== "all").map(c => <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>)}
            </CardHeader>
            <CardContent className="p-0">
              {h.loading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
              ) : h.questions.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <HelpCircle className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No questions found</p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={h.openCreateDialog}>Create your first question</Button>
              ) : (
                <div className="divide-y divide-border/40">
                  {h.questions.map(q => (
                    <TriviaQuestionCard key={q.id} id={q.id} question={q.question} difficulty={q.difficulty}
                      category={q.category} isActive={q.isActive}
                      onEdit={() => h.openEditDialog(q)} onDelete={() => h.setDeleteTarget(q)} />
              )}
              {h.totalQuestions > TRIVIA_PAGE_SIZE && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">{h.questionPage * TRIVIA_PAGE_SIZE + 1}–{Math.min((h.questionPage + 1) * TRIVIA_PAGE_SIZE, h.totalQuestions)} of {h.totalQuestions}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.questionPage === 0} onClick={() => h.setQuestionPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.questionPage + 1) * TRIVIA_PAGE_SIZE >= h.totalQuestions} onClick={() => h.setQuestionPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
                  </div>
            </CardContent>
          </Card>
        {/* User Performance Tab */}
        <TabsContent value="users" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                  <Input placeholder="Search users..." value={h.perfSearch} onChange={e => { h.setPerfSearch(e.target.value); h.setPerfPage(0); }} className="pl-9 h-9 text-sm" />
                <Select value={h.perfSortBy} onValueChange={v => { h.setPerfSortBy(v); h.setPerfPage(0); }}>
                  <SelectTrigger className="h-9 w-36 text-sm"><SelectValue /></SelectTrigger>
                    <SelectItem value="percentage">Best Score</SelectItem>
                    <SelectItem value="totalAnswered">Most Answers</SelectItem>
                    <SelectItem value="correct">Most Correct</SelectItem>
                    <SelectItem value="lastAnsweredDate">Recent</SelectItem>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow className="bg-muted/30">
                    <TableHead>User</TableHead><TableHead className="text-center">Answered</TableHead><TableHead className="text-center">Correct</TableHead><TableHead className="text-center">Incorrect</TableHead><TableHead>Score</TableHead><TableHead>Last Active</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {h.userPerformance.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data yet</TableCell></TableRow>
                    ) : h.userPerformance.map(u => (
                      <TableRow key={u.userId} className="border-border/40">
                        <TableCell><div className="font-medium text-sm">{u.firstName} {u.lastName}</div><div className="text-xs text-muted-foreground">{u.email}</div></TableCell>
                        <TableCell className="font-medium">{u.totalAnswered}</TableCell>
                        <TableCell className="text-emerald-600 font-medium">{u.correct}</TableCell>
                        <TableCell className="text-red-500 font-medium">{u.incorrect}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                              <div className={cn("h-full rounded-full", u.percentage >= 70 ? "bg-emerald-500" : u.percentage >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${u.percentage}%` }} />
                            </div>
                            <span className="text-xs font-medium">{u.percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.lastAnsweredDate ? new Date(u.lastAnsweredDate).toLocaleDateString() : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              {h.perfTotal > TRIVIA_PAGE_SIZE && (
                  <p className="text-xs text-muted-foreground">Page {h.perfPage + 1} of {Math.ceil(h.perfTotal / TRIVIA_PAGE_SIZE)}</p>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.perfPage === 0} onClick={() => h.setPerfPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.perfPage + 1) * TRIVIA_PAGE_SIZE >= h.perfTotal} onClick={() => h.setPerfPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
        {/* Question Stats Tab */}
        <TabsContent value="performance" className="space-y-4">
                  <Input placeholder="Search questions..." value={h.qpSearch} onChange={e => { h.setQpSearch(e.target.value); h.setQpPage(0); }} className="pl-9 h-9 text-sm" />
                <Select value={h.qpDifficulty} onValueChange={v => { h.setQpDifficulty(v); h.setQpPage(0); }}>
                  <SelectContent><SelectItem value="all">All</SelectItem>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                <Select value={h.qpSortBy} onValueChange={v => { h.setQpSortBy(v); h.setQpPage(0); }}>
                    <SelectItem value="timesAnswered">Most Answered</SelectItem><SelectItem value="percentage">Highest Rate</SelectItem><SelectItem value="timesCorrect">Most Correct</SelectItem>
                    <TableHead>Question</TableHead><TableHead>Difficulty</TableHead><TableHead className="text-center">Answered</TableHead><TableHead className="text-center">Correct</TableHead><TableHead className="text-center">Incorrect</TableHead><TableHead>Success Rate</TableHead>
                    {h.questionPerf.length === 0 ? (
                    ) : h.questionPerf.map((q: any) => (
                      <TableRow key={q.questionId} className="border-border/40">
                        <TableCell className="max-w-[300px]"><p className="text-sm truncate">{q.question}</p></TableCell>
                        <TableCell><Badge variant="outline" className={cn("text-[10px]", difficultyColor(q.difficulty))}>{q.difficulty}</Badge></TableCell>
                        <TableCell className="font-medium">{q.timesAnswered}</TableCell>
                        <TableCell className="text-emerald-600 font-medium">{q.timesCorrect}</TableCell>
                        <TableCell className="text-red-500 font-medium">{q.timesIncorrect}</TableCell>
                              <div className={cn("h-full rounded-full", q.percentage >= 70 ? "bg-emerald-500" : q.percentage >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${q.percentage}%` }} />
                            <span className="text-xs font-medium">{q.percentage}%</span>
              {h.qpTotal > TRIVIA_PAGE_SIZE && (
                  <p className="text-xs text-muted-foreground">Page {h.qpPage + 1} of {Math.ceil(h.qpTotal / TRIVIA_PAGE_SIZE)}</p>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.qpPage === 0} onClick={() => h.setQpPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.qpPage + 1) * TRIVIA_PAGE_SIZE >= h.qpTotal} onClick={() => h.setQpPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
      </Tabs>
      {/* Dialogs */}
      <TriviaQuestionDialog open={h.editDialog} onOpenChange={h.setEditDialog} form={h.editForm}
        onFormChange={h.setEditForm} optionsArray={h.optionsArray} onOptionsChange={h.setOptionsArray}
        saving={h.saving} onSave={h.handleSave} />
      <Dialog open={!!h.deleteTarget} onOpenChange={o => !o && h.setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Delete Question</DialogTitle>
            <DialogDescription>This action cannot be undone. This will also remove all associated answers.</DialogDescription>
          </DialogHeader>
          {h.deleteTarget && <div className="py-2"><p className="text-sm font-medium mb-1">{h.deleteTarget.question}</p><p className="text-xs text-muted-foreground">Difficulty: {h.deleteTarget.difficulty} · Category: {h.deleteTarget.category}</p></div>}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => h.setDeleteTarget(null)} disabled={h.deleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting} className="gap-2 w-full sm:w-auto">
              {h.deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AdminTrivia;
