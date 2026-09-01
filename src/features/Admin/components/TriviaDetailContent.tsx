// TriviaDetailContent — renders trivia question detail fields as sections
"use client";

import { CheckCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSection } from "./DetailSection";

interface TriviaQuestion {
  id: number;
  question: string;
  options?: string[];
  optionsJson?: string;
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  category: string;
  isActive: boolean;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  createdOn: string;
  updatedOn: string;
}

function parseOptions(q: TriviaQuestion): string[] {
  if (Array.isArray(q.options)) return q.options;
  if (q.optionsJson) {
    try { return JSON.parse(q.optionsJson); } catch { return []; }
  }
  return [];
}

function getVerseRef(q: TriviaQuestion): string | null {
  if (!q.bookName) return null;
  return `${q.bookName}${q.chapter ? ` ${q.chapter}` : ""}${q.verseNumber ? `:${q.verseNumber}` : ""}`;
}

/* ─── Re-export for use by other files ─── */
export { parseOptions, getVerseRef };

export function TriviaDetailContent({ question }: { question: TriviaQuestion }) {
  const options = parseOptions(question);
  const verseRef = getVerseRef(question);

  return (
    <>
      {/* Question */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
            <Badge variant={question.isActive ? "default" : "secondary"} className="shrink-0">
              {question.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge variant="outline" className="text-[10px] bg-muted">
              {question.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-muted">
              {question.category?.replace("-", " ")}
            </Badge>
            {verseRef && (
              <Badge variant="outline" className="text-[10px] bg-muted">
                <BookOpen className="w-2.5 h-2.5 mr-1" />{verseRef}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Options */}
      <TriviaOptions options={options} correctAnswer={question.correctAnswer} />

      {/* Explanation */}
      {question.explanation && (
        <DetailSection title="Explanation">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {question.explanation}
          </p>
        </DetailSection>
      )}
    </>
  );
}

/* ─── Options list ─── */
function TriviaOptions({ options, correctAnswer }: { options: string[]; correctAnswer: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Answer Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {options.map((option, idx) => {
          const isCorrect = idx === correctAnswer;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                isCorrect
                  ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30"
                  : "border-border bg-card"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCorrect ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {isCorrect ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>
                )}
              </div>
              <span className={`text-sm ${isCorrect ? "font-semibold text-emerald-700 dark:text-emerald-300" : ""}`}>
                {option}
              </span>
              {isCorrect && (
                <Badge variant="outline" className="ml-auto text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400">
                  Correct Answer
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/* ─── Actions row ─── */
export function TriviaDetailActions({
  onEdit,
  onBack,
}: {
  onEdit: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={onEdit} className="gap-2">
        Edit Question
      </Button>
      <Button variant="ghost" onClick={onBack}>
        Back to Trivia
      </Button>
    </div>
  );
}
