// TriviaPerformanceTabs — overview stats, user list, question stats
import {
  Users, BarChart3, TrendingUp, Search, Trophy, Target,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "./StatCard";

// ─── Overview ───────────────────────────────────────────────────────────────

interface OverviewData {
  totalUsers?: number;
  totalQuestions?: number;
  avgScore?: number;
}

export function TriviaOverviewPanel({ overview }: { overview: OverviewData | null }) {
  if (!overview) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatCard label="Total Users" value={overview.totalUsers ?? "\u2014"} icon={Users} color="bg-primary/10 text-primary" />
      <StatCard label="Total Questions" value={overview.totalQuestions ?? "\u2014"} icon={BarChart3} color="bg-violet-500/10 text-violet-600" />
      <StatCard label="Avg Score" value={overview.avgScore ? `${overview.avgScore}%` : "\u2014"} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" />
    </div>
  );
}

// ─── Users ──────────────────────────────────────────────────────────────────

interface UserData {
  id: number; username: string; email: string;
  score?: number; questionsAnswered?: number;
}

export function TriviaUsersPanel({
  users, search, onSearchChange, onUserClick,
}: {
  users: UserData[]; search: string; onSearchChange: (s: string) => void;
  onUserClick: (u: UserData) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
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
            <Card key={u.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => onUserClick(u)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{u.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold">{u.score ?? 0}%</p>
                  <p className="text-[10px] text-muted-foreground">{u.questionsAnswered} answered</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Questions ──────────────────────────────────────────────────────────────

interface QuestionData {
  id: number; question: string;
  correctAnswers: number; totalAnswers: number;
}

export function TriviaQuestionsPanel({ questions }: { questions: QuestionData[] }) {
  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="font-semibold">No Question Data</p>
        <p className="text-sm">Questions need to be answered before stats appear.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {questions.map((q) => {
        const pct = q.totalAnswers > 0 ? Math.round((q.correctAnswers / q.totalAnswers) * 100) : 0;
        return (
          <Card key={q.id}>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-medium line-clamp-2">{q.question}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span><Target className="w-3 h-3 inline mr-1" />{q.correctAnswers}/{q.totalAnswers} correct</span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
