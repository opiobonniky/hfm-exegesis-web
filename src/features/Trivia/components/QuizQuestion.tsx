import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { TriviaQuestion } from "../types";

interface QuizQuestionProps {
  question: TriviaQuestion;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showCorrect?: boolean;
}

export function QuizQuestion({ question, selectedAnswer, onSelectAnswer, showCorrect }: QuizQuestionProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={question.difficulty === "easy" ? "success" : question.difficulty === "medium" ? "warning" : "destructive"}>
            {question.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">{question.category}</span>
        </div>
        <CardTitle className="text-lg">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            onClick={() => onSelectAnswer(option)}
            disabled={showCorrect}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all",
              selectedAnswer === option
                ? showCorrect
                  ? option === question.correctAnswer
                    ? "border-green-500 bg-green-500/10"
                    : "border-red-500 bg-red-500/10"
                  : "border-primary bg-primary/10"
                : showCorrect && option === question.correctAnswer
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-primary/50"
            )}
          >
            <span className="font-medium">{option}</span>
          </button>
        ))}
        {showCorrect && question.explanation && (
          <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
