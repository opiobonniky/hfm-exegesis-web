// ReadingPlanQuizCard — list of quiz questions with highlighted correct answers
import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizQuestion {
  id: number;
  question: string;
  options: string;
  correctAnswer: number;
}

interface ReadingPlanQuizCardProps {
  questions: QuizQuestion[];
}

export function ReadingPlanQuizCard({ questions }: ReadingPlanQuizCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Quiz Questions ({questions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {questions.map((q, idx) => {
            let options: string[] = [];
            try {
              options =
                typeof q.options === "string"
                  ? JSON.parse(q.options)
                  : q.options;
            } catch {
              options = [];
            }
            return (
              <div key={q.id} className="p-3 rounded-lg border border-border/50">
                <p className="text-sm font-medium">
                  {idx + 1}. {q.question}
                </p>
                <div className="mt-2 space-y-1">
                  {options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                        oi === q.correctAnswer
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {oi === q.correctAnswer && (
                        <CheckCircle className="w-3 h-3 shrink-0" />
                      )}
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
