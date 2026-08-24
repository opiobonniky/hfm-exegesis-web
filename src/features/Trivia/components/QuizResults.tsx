import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Target, RotateCcw } from "lucide-react";

interface QuizResultsProps {
  score: number;
  total: number;
  timeTaken: number;
  onRetry: () => void;
}
export function QuizResults({ score, total, timeTaken, onRetry }: QuizResultsProps) {
  const percentage = Math.round((score / total) * 100);
  return (
    <Card className="bg-card border-border">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <Target className="w-5 h-5 mx-auto text-primary" />
            <p className="text-2xl font-bold">{score}/{total}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
            <Target className="w-5 h-5 mx-auto text-green-500" />
            <p className="text-2xl font-bold">{percentage}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <Clock className="w-5 h-5 mx-auto text-amber-500" />
            <p className="text-2xl font-bold">{timeTaken}s</p>
            <p className="text-xs text-muted-foreground">Time</p>
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </CardContent>
    </Card>
  );
