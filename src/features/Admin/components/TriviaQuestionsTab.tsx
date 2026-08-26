// Admin trivia questions tab — filters, list, pagination
import { Plus, Search, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TriviaQuestionCard } from "./index";
import { CATEGORY_OPTIONS, TRIVIA_PAGE_SIZE } from "../constants";

const DIFFICULTIES = ["easy", "medium", "hard"];

interface Props {
  h: {
    loading: boolean;
    questions: any[];
    totalQuestions: number;
    questionPage: number;
    setQuestionPage: (fn: (p: number) => number) => void;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    difficultyFilter: string;
    setDifficultyFilter: (v: string) => void;
    categoryFilter: string;
    setCategoryFilter: (v: string) => void;
    openCreateDialog: () => void;
    openEditDialog: (q: any) => void;
    setDeleteTarget: (q: any) => void;
  };
}

export function TriviaQuestionsTab({ h }: Props) {
  return (
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
          </div>
          <Select value={h.difficultyFilter} onValueChange={h.setDifficultyFilter}>
            <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={h.categoryFilter} onValueChange={h.setCategoryFilter}>
            <SelectTrigger className="h-9 w-36 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.filter(c => c !== "all").map(c => <SelectItem key={c} value={c}>{c.replace("-", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {h.loading ? (
          <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
        ) : h.questions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <HelpCircle className="w-10 h-10 mb-3 text-muted-foreground/40" />
            <p className="font-medium">No questions found</p>
            <Button variant="ghost" size="sm" className="mt-3 text-primary" onClick={h.openCreateDialog}>Create your first question</Button>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {h.questions.map(q => (
              <TriviaQuestionCard key={q.id} id={q.id} question={q.question} difficulty={q.difficulty}
                category={q.category} isActive={q.isActive}
                onEdit={() => h.openEditDialog(q)} onDelete={() => h.setDeleteTarget(q)} />
            ))}
          </div>
        )}
        {h.totalQuestions > TRIVIA_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">{h.questionPage * TRIVIA_PAGE_SIZE + 1}–{Math.min((h.questionPage + 1) * TRIVIA_PAGE_SIZE, h.totalQuestions)} of {h.totalQuestions}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.questionPage === 0} onClick={() => h.setQuestionPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.questionPage + 1) * TRIVIA_PAGE_SIZE >= h.totalQuestions} onClick={() => h.setQuestionPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
