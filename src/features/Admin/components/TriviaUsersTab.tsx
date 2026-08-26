// Admin trivia user performance tab — sortable, paginated table
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { TRIVIA_PAGE_SIZE } from "../constants";

interface Props {
  h: {
    perfSearch: string;
    setPerfSearch: (v: string) => void;
    perfSortBy: string;
    setPerfSortBy: (fn: string | ((v: string) => string)) => void;
    perfPage: number;
    setPerfPage: (fn: number | ((p: number) => number)) => void;
    perfTotal: number;
    userPerformance: any[];
  };
}

export function TriviaUsersTab({ h }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={h.perfSearch} onChange={e => { h.setPerfSearch(e.target.value); h.setPerfPage(0); }} className="pl-9 h-9 text-sm" />
          </div>
          <Select value={h.perfSortBy} onValueChange={v => { h.setPerfSortBy(v); h.setPerfPage(0); }}>
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
              {h.userPerformance.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data yet</TableCell></TableRow>
              ) : h.userPerformance.map(u => (
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
        {h.perfTotal > TRIVIA_PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
            <p className="text-xs text-muted-foreground">Page {h.perfPage + 1} of {Math.ceil(h.perfTotal / TRIVIA_PAGE_SIZE)}</p>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={h.perfPage === 0} onClick={() => h.setPerfPage(p => p - 1)}><ChevronLeft className="w-3 h-3" /></Button>
              <Button variant="outline" size="icon" className="h-7 w-7" disabled={(h.perfPage + 1) * TRIVIA_PAGE_SIZE >= h.perfTotal} onClick={() => h.setPerfPage(p => p + 1)}><ChevronRight className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
