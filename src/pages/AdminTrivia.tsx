"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Loader2,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  HelpCircle,
  TrendingUp,
  Filter,
  BadgeCheck,
  BadgeX,
  BookOpen,
  RefreshCw,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";

interface TriviaQuestion {
  id: number;
  question: string;
  optionsJson: string;
  correctAnswer: number;
  explanation: string | null;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdOn: string;
}

interface OverviewStats {
  totalParticipants: number;
  totalAnswers: number;
  averageScore: number;
  dailyActiveParticipants: number;
  todayAnswers: number;
  difficultyBreakdown: Record<string, { total: number; correct: number }>;
}

interface UserPerformance {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAnswered: number;
  correct: number;
  incorrect: number;
  percentage: number;
  lastAnsweredDate: string | null;
}

const DIFFICULTIES = ["easy", "medium", "hard"];
const CATEGORIES = ["general", "old-testament", "new-testament", "psalms", "prophets", "gospels", "epistles", "history", "wisdom"];

const difficultyColor = (d: string) => {
  switch (d) {
    case "easy": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40";
    case "medium": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40";
    case "hard": return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const AdminTrivia = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(true);

  // Questions state
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionPage, setQuestionPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Edit dialog
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TriviaQuestion>>({});
  const [saving, setSaving] = useState(false);
  const [optionsArray, setOptionsArray] = useState<string[]>(["", "", "", ""]);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<TriviaQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Overview stats
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);

  // User performance
  const [userPerformance, setUserPerformance] = useState<UserPerformance[]>([]);
  const [perfTotal, setPerfTotal] = useState(0);
  const [perfPage, setPerfPage] = useState(0);
  const [perfSearch, setPerfSearch] = useState("");
  const [perfSortBy, setPerfSortBy] = useState("percentage");
  const [perfSortOrder, setPerfSortOrder] = useState("desc");

  // Question performance
  const [questionPerf, setQuestionPerf] = useState<any[]>([]);
  const [qpTotal, setQpTotal] = useState(0);
  const [qpPage, setQpPage] = useState(0);
  const [qpSearch, setQpSearch] = useState("");
  const [qpDifficulty, setQpDifficulty] = useState("all");
  const [qpSortBy, setQpSortBy] = useState("timesAnswered");
  const [qpSortOrder, setQpSortOrder] = useState("desc");

  const loadQuestions = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("trivia", "get-all", {
        page,
        pageSize: 20,
        search: searchQuery || undefined,
        difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setQuestions(res.returnData.data || []);
        setTotalQuestions(res.returnData.total || 0);
      }
    } catch {
      toast({ title: "Failed to load questions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, difficultyFilter, categoryFilter, toast]);

  const loadOverview = useCallback(async () => {
    try {
      const res = await sendPostRequest("trivia", "admin/overview");
      if (res?.returnCode === 200 && res?.returnData) {
        setOverviewStats(res.returnData);
      }
    } catch {}
  }, []);

  const loadUserPerformance = useCallback(async (page: number) => {
    try {
      const res = await sendPostRequest("trivia", "admin/user-performance", {
        page,
        pageSize: 20,
        search: perfSearch || undefined,
        sortBy: perfSortBy,
        sortOrder: perfSortOrder,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setUserPerformance(res.returnData.data || []);
        setPerfTotal(res.returnData.total || 0);
      }
    } catch {}
  }, [perfSearch, perfSortBy, perfSortOrder]);

  const loadQuestionPerformance = useCallback(async (page: number) => {
    try {
      const res = await sendPostRequest("trivia", "admin/question-performance", {
        page,
        pageSize: 20,
        search: qpSearch || undefined,
        difficulty: qpDifficulty !== "all" ? qpDifficulty : undefined,
        sortBy: qpSortBy,
        sortOrder: qpSortOrder,
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setQuestionPerf(res.returnData.data || []);
        setQpTotal(res.returnData.total || 0);
      }
    } catch {}
  }, [qpSearch, qpDifficulty, qpSortBy, qpSortOrder]);

  useEffect(() => { loadQuestions(questionPage); }, [loadQuestions, questionPage]);
  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { loadUserPerformance(perfPage); }, [loadUserPerformance, perfPage]);
  useEffect(() => { loadQuestionPerformance(qpPage); }, [loadQuestionPerformance, qpPage]);

  const openCreateDialog = () => {
    setEditForm({ question: "", correctAnswer: 0, explanation: "", bookName: "", chapter: null, verseNumber: null, category: "general", difficulty: "medium", isActive: true });
    setOptionsArray(["", "", "", ""]);
    setEditDialog(true);
  };

  const openEditDialog = (q: TriviaQuestion) => {
    setEditForm(q);
    try { setOptionsArray(JSON.parse(q.optionsJson || '["","","",""]')); }
    catch { setOptionsArray(["", "", "", ""]); }
    setEditDialog(true);
  };

  const handleSave = async () => {
    if (!editForm.question?.trim()) {
      toast({ title: "Question is required", variant: "destructive" });
      return;
    }
    const filteredOptions = optionsArray.filter(o => o.trim());
    if (filteredOptions.length < 2) {
      toast({ title: "At least 2 options required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editForm.id ? { id: editForm.id } : {}),
        question: editForm.question,
        optionsJson: JSON.stringify(filteredOptions),
        correctAnswer: editForm.correctAnswer ?? 0,
        explanation: editForm.explanation || null,
        bookName: editForm.bookName || null,
        chapter: editForm.chapter || null,
        verseNumber: editForm.verseNumber || null,
        category: editForm.category || "general",
        difficulty: editForm.difficulty || "medium",
        isActive: editForm.isActive ?? true,
      };
      const endpoint = editForm.id ? "update" : "create";
      const res = await sendPostRequest("trivia", endpoint, payload);
      if (res?.returnCode === 200) {
        toast({ title: editForm.id ? "Question updated" : "Question created" });
        setEditDialog(false);
        loadQuestions(questionPage);
        loadOverview();
      } else {
        toast({ title: "Failed to save", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving question", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("trivia", "delete", { id: deleteTarget.id });
      if (res?.returnCode === 200) {
        toast({ title: "Question deleted" });
        setDeleteTarget(null);
        loadQuestions(questionPage);
        loadOverview();
      } else {
        toast({ title: "Delete failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error deleting", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">{value}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Trivia Management</h1>
          <p className="text-sm text-muted-foreground">Create, edit, and analyze Bible trivia questions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">                    <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
        <TabsTrigger value="overview" className="whitespace-nowrap"><BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Overview</TabsTrigger>
        <TabsTrigger value="questions" className="whitespace-nowrap"><HelpCircle className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Questions</TabsTrigger>
        <TabsTrigger value="users" className="whitespace-nowrap"><Users className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />User Performance</TabsTrigger>
        <TabsTrigger value="performance" className="whitespace-nowrap"><TrendingUp className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Question Stats</TabsTrigger>
      </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Total Participants" value={overviewStats?.totalParticipants ?? "—"} icon={Users} color="bg-primary/10 text-primary" />
            <StatCard label="Total Answers" value={overviewStats?.totalAnswers ?? "—"} icon={BarChart3} color="bg-violet-500/10 text-violet-600" />
            <StatCard label="Avg Score" value={overviewStats ? `${overviewStats.averageScore}%` : "—"} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
            <StatCard label="Today's Answers" value={overviewStats?.todayAnswers ?? "—"} icon={Sparkles} color="bg-amber-500/10 text-amber-600" />
            <StatCard label="Daily Active" value={overviewStats?.dailyActiveParticipants ?? "—"} icon={Users} color="bg-sky-500/10 text-sky-600" />
          </div>

          {overviewStats?.difficultyBreakdown && (
            <Card className="border-border/50">
              <CardHeader><CardTitle className="text-sm font-bold">Difficulty Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(overviewStats.difficultyBreakdown).map(([diff, stats]) => (
                    <div key={diff} className="p-3 rounded-lg border border-border/50 bg-muted/20">
                      <Badge variant="outline" className={cn("mb-2", difficultyColor(diff))}>{diff}</Badge>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Answered</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Correct</span>
                        <span className="font-medium text-emerald-600">{stats.correct}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-medium">{stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Questions Tab ── */}
        <TabsContent value="questions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-base">
                  All Questions <span className="text-muted-foreground font-normal">({totalQuestions})</span>
                </CardTitle>
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-1.5" />New Question
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search questions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-4 h-4" /></button>
                  )}
                </div>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full rounded-lg" />))}
                </div>
              ) : questions.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <HelpCircle className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No questions found</p>
                  <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={openCreateDialog}>Create your first question</Button>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-1">{q.question}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={cn("text-[10px]", difficultyColor(q.difficulty))}>{q.difficulty}</Badge>
                            <Badge variant="outline" className="text-[10px] bg-muted">{q.category?.replace("-", " ")}</Badge>
                            {q.isActive ? (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Inactive</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(q)}><Edit2 className="w-4 h-4 text-foreground/60" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(q)}><Trash2 className="w-4 h-4 text-foreground/60" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Pagination */}
              {totalQuestions > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">{questionPage * 20 + 1}–{Math.min((questionPage + 1) * 20, totalQuestions)} of {totalQuestions}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={questionPage === 0} onClick={() => setQuestionPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(questionPage + 1) * 20 >= totalQuestions} onClick={() => setQuestionPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── User Performance Tab ── */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search users..." value={perfSearch} onChange={e => { setPerfSearch(e.target.value); setPerfPage(0); }} className="pl-9 h-9 text-sm" />
                </div>
                <Select value={perfSortBy} onValueChange={v => { setPerfSortBy(v); setPerfPage(0); }}>
                  <SelectTrigger className="h-9 w-36 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Best Score</SelectItem>
                    <SelectItem value="totalAnswered">Most Answers</SelectItem>
                    <SelectItem value="correct">Most Correct</SelectItem>
                    <SelectItem value="lastAnsweredDate">Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>User</TableHead>
                    <TableHead className="text-center">Answered</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Incorrect</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPerformance.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data yet</TableCell></TableRow>
                  ) : userPerformance.map((u) => (
                    <TableRow key={u.userId} className="border-border/40">
                      <TableCell>
                        <div className="font-medium text-sm">{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </TableCell>
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
              </div>
              {perfTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">Page {perfPage + 1} of {Math.ceil(perfTotal / 20)}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={perfPage === 0} onClick={() => setPerfPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(perfPage + 1) * 20 >= perfTotal} onClick={() => setPerfPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Question Performance Tab ── */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search questions..." value={qpSearch} onChange={e => { setQpSearch(e.target.value); setQpPage(0); }} className="pl-9 h-9 text-sm" />
                </div>
                <Select value={qpDifficulty} onValueChange={v => { setQpDifficulty(v); setQpPage(0); }}>
                  <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={qpSortBy} onValueChange={v => { setQpSortBy(v); setQpPage(0); }}>
                  <SelectTrigger className="h-9 w-36 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timesAnswered">Most Answered</SelectItem>
                    <SelectItem value="percentage">Highest Rate</SelectItem>
                    <SelectItem value="timesCorrect">Most Correct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-center">Answered</TableHead>
                    <TableHead className="text-center">Correct</TableHead>
                    <TableHead className="text-center">Incorrect</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionPerf.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data yet</TableCell></TableRow>
                  ) : questionPerf.map((q: any) => (
                    <TableRow key={(q as any).questionId} className="border-border/40">
                      <TableCell className="max-w-[300px]">
                        <p className="text-sm truncate">{(q as any).question}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-[10px]", difficultyColor((q as any).difficulty))}>{(q as any).difficulty}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{(q as any).timesAnswered}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">{(q as any).timesCorrect}</TableCell>
                      <TableCell className="text-red-500 font-medium">{(q as any).timesIncorrect}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", (q as any).percentage >= 70 ? "bg-emerald-500" : (q as any).percentage >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${(q as any).percentage}%` }} />
                          </div>
                          <span className="text-xs font-medium">{(q as any).percentage}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
              {qpTotal > 20 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
                  <p className="text-xs text-muted-foreground">Page {qpPage + 1} of {Math.ceil(qpTotal / 20)}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={qpPage === 0} onClick={() => setQpPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" disabled={(qpPage + 1) * 20 >= qpTotal} onClick={() => setQpPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Edit/Create Dialog ── */}
      <Dialog open={editDialog} onOpenChange={o => !o && setEditDialog(false)}>
        <DialogContent className="sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>{editForm.id ? "Edit Question" : "New Question"}</DialogTitle>
            <DialogDescription>{editForm.id ? "Update the trivia question details" : "Create a new Bible trivia question"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Question *</Label>
              <Textarea value={editForm.question || ""} onChange={e => setEditForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter the trivia question..." rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Answer Options *</Label>
              {optionsArray.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground w-5">{String.fromCharCode(65 + i)}.</span>
                  <Input value={opt} onChange={e => { const n = [...optionsArray]; n[i] = e.target.value; setOptionsArray(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1" />
                  {editForm.correctAnswer === i && <BadgeCheck className="w-5 h-5 text-emerald-500 shrink-0" />}
                </div>
              ))}
              <Select value={String(editForm.correctAnswer ?? 0)} onValueChange={v => setEditForm(f => ({ ...f, correctAnswer: Number(v) }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Correct answer" /></SelectTrigger>
                <SelectContent>
                  {optionsArray.map((_, i) => (
                    <SelectItem key={i} value={String(i)}>Option {String.fromCharCode(65 + i)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Explanation</Label>
              <Textarea value={editForm.explanation || ""} onChange={e => setEditForm(f => ({ ...f, explanation: e.target.value }))} placeholder="Explain the correct answer..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Book</Label>
                <Input value={editForm.bookName || ""} onChange={e => setEditForm(f => ({ ...f, bookName: e.target.value }))} placeholder="e.g. John" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Chapter</Label>
                  <Input type="number" value={editForm.chapter ?? ""} onChange={e => setEditForm(f => ({ ...f, chapter: e.target.value ? Number(e.target.value) : null }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Verse</Label>
                  <Input type="number" value={editForm.verseNumber ?? ""} onChange={e => setEditForm(f => ({ ...f, verseNumber: e.target.value ? Number(e.target.value) : null }))} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={editForm.category || "general"} onValueChange={v => setEditForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <Select value={editForm.difficulty || "medium"} onValueChange={v => setEditForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Question will appear in trivia games</p>
              </div>
              <Switch checked={editForm.isActive ?? true} onCheckedChange={v => setEditForm(f => ({ ...f, isActive: v }))} />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setEditDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 w-full sm:w-auto">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><Trash2 className="w-5 h-5" /> Delete Question</DialogTitle>
            <DialogDescription>This action cannot be undone. This will also remove all associated answers.</DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="py-2">
              <p className="text-sm font-medium mb-1">{deleteTarget.question}</p>
              <p className="text-xs text-muted-foreground">Difficulty: {deleteTarget.difficulty} · Category: {deleteTarget.category}</p>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting} className="gap-2 w-full sm:w-auto">
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrivia;
