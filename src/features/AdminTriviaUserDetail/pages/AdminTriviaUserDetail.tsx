"use client";

import { useAdminTriviaUserDetailPage } from "../hooks/useAdminTriviaUserDetailPage";
import {
  ArrowLeft,
  User,
  Mail,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Loader2,
  Calendar,
  TrendingUp,
} from "lucide-react";
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { LoadingState } from "@/components/ui/states";
import type { TriviaUserDetail, TriviaAnswer } from "../types";
export default function AdminTriviaUserDetailPage() {
  const h = useAdminTriviaUserDetailPage();
  }, [fetchDetail]);
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!detail) {
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <User className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">User Not Found</h2>
        <p className="text-muted-foreground">
          This user hasn&apos;t answered any trivia questions yet.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(routes.adminTrivia.path)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Trivia
        </Button>
  const stats = [
    {
      label: "Total Answered",
      value: detail.totalAnswered,
      icon: Target,
      color: "text-blue-500",
    },
      label: "Correct Answers",
      value: detail.correctAnswers,
      icon: CheckCircle2,
      color: "text-emerald-500",
      label: "Accuracy",
      value: `${detail.accuracy.toFixed(1)}%`,
      icon: TrendingUp,
      color: detail.accuracy >= 70 ? "text-emerald-500" : "text-amber-500",
      label: "Avg Time/Question",
      value: `${detail.averageTimePerQuestion.toFixed(1)}s`,
      icon: Clock,
      color: "text-purple-500",
  ];
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
          variant="ghost"
          size="icon"
          <ArrowLeft className="h-5 w-5" />
        <div>
          <h1 className="text-2xl font-bold">
            {detail.firstName} {detail.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">{detail.email}</p>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={cn("h-8 w-8", stat.color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      {/* Answer History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Answer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {detail.answers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mb-3" />
              <p>No answers recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.answers.map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell className="max-w-xs truncate font-medium">
                        {answer.question}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{answer.category}</Badge>
                        <Badge
                          variant={
                            answer.difficulty === "hard"
                              ? "destructive"
                              : answer.difficulty === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {answer.difficulty}
                        </Badge>
                        {answer.isCorrect ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border-red-200">
                            <XCircle className="mr-1 h-3 w-3" />
                            Incorrect
                        )}
                      <TableCell className="text-muted-foreground">
                        {answer.timeSpent.toFixed(1)}s
                        {new Date(answer.answeredAt).toLocaleDateString()}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
