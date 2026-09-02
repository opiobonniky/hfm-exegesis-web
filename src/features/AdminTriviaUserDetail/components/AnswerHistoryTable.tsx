import { BarChart3, CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TriviaUserDetail } from "../hooks/useAdminTriviaUserDetailPage";

interface AnswerHistoryTableProps {
  answers: TriviaUserDetail["recentAnswers"];
}

export function AnswerHistoryTable({ answers }: AnswerHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" /> Answer History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {answers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mb-3" />
            <span>No answers recorded yet.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {answers.map((answer) => (
                  <TableRow key={answer.questionId}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {answer.question}
                    </TableCell>
                    <TableCell>
                      {answer.isCorrect ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Correct
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" /> Incorrect
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(answer.answeredAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
