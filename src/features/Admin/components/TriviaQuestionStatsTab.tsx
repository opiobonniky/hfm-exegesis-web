// Admin trivia question stats tab — per-question performance table
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { difficultyColor } from "./index";
import { TRIVIA_PAGE_SIZE } from "../constants";

const DIFFICULTIES = ["easy", "medium", "hard"];

interface Props {
  h: {
    qpSearch: string;
    setQpSearch: (v: string) => void;
    qpDifficulty: string;
    setQpDifficulty: (v: string) => void;
    qpSortBy: string;
    setQpSortBy: (fn: string | ((v: string) => string)) => void;
    qpPage: number;
    setQpPage: (fn: number | ((p: number) => number)) => void;
    qpTotal: number;
    questionPerf: any[];
  };
}

export function TriviaQuestionStatsTab({ h }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search questions..." value={h.qpSearch} onChange={e => { h.setQpSearch(e.target.value); h.setQpPage(0); }} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={h.qpDifficulty} onValueChange={v => { h.setQpDifficulty(v); h.setQpPage(0); }}>
            <SelectTrigger className="h-9 w-32 text-sm"><SelectValue placeholder="Difficulty" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={h.qpSortBy} onValueChange={v => { h.setQpSortBy(v); h.setQpPage(0); }}>
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
              {h.questionPerf.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data yet</TableCell></TableRow>
              ) : h.questionPerf.map((q: any) => (
                <TableRow key={q.questionId} className="border-border/40">
                  <TableCell className="max-w-[300px]"><p className="text-sm truncate">{q.question}</p></TableCell>
                  <TableCell><Badge variant="outline" className={cn("text-[10px]", difficultyColor(q.difficulty))}>{q.difficulty}</Badge></TableCell>
                  <TableCell className="font-medium">{q.timesAnswered}</TableCell>
                  <TableCell className="text-emerald-600 font-medium">{q.timesCorrect}</TableCell>
                  <TableCell className="text-red-500 font-medium">{q.timesIncorrect}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", q.percentage >= 70 ? "bg-emerald-500" : q.percentage >= 40 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${q.percentage}%` }} />
                      </div>
                      <span className="text-xs font-medium">{q.percentage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {h.qpTotal > TRIVIA_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Page {h.qpPage + 1} of {Math.ceil(h.qpTotal / TRIVIA_PAGE_SIZE)}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.qpPage === 0} onClick={() => h.setQpPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.qpPage + 1) * TRIVIA_PAGE_SIZE >= h.qpTotal} onClick={() => h.setQpPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
