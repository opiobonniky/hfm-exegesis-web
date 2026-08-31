// TriviaDetail — full detail view for a trivia question
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle, XCircle, BookOpen, Tag, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { difficultyColor } from "../components/TriviaQuestionCard";

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

export default function TriviaDetail() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    sendPostRequest("trivia", "get", { id: questionId })
      .then((res) => {
        if (res?.returnCode === 200 && res.returnData) {
          setQuestion(res.returnData);
        } else {
          toast({ title: "Question not found", variant: "destructive" });
          navigate("/admin/trivia");
        }
      })
      .catch(() => {
        toast({ title: "Failed to load", variant: "destructive" });
        navigate("/admin/trivia");
      })
      .finally(() => setLoading(false));
  }, [questionId, toast, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!question) return null;

  // Parse options from either options array or optionsJson string
  const options: string[] = (() => {
    if (Array.isArray(question.options)) return question.options;
    if (question.optionsJson) {
      try { return JSON.parse(question.optionsJson); } catch { return []; }
    }
    return [];
  })();

  const verseRef = question.bookName
    ? `${question.bookName}${question.chapter ? ` ${question.chapter}` : ""}${question.verseNumber ? `:${question.verseNumber}` : ""}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-3 h-16">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/trivia")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Trivia Question Detail</h1>
              <p className="text-xs text-muted-foreground">Question #{question.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
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
              <Badge variant="outline" className={difficultyColor(question.difficulty)}>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Answer Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {options.map((option, idx) => {
              const isCorrect = idx === question.correctAnswer;
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

        {/* Explanation */}
        {question.explanation && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {question.explanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold mb-1">Created</p>
                <p>{question.createdOn ? new Date(question.createdOn).toLocaleString() : "—"}</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Updated</p>
                <p>{question.updatedOn ? new Date(question.updatedOn).toLocaleString() : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/trivia/edit/${question.id}`)}
            className="gap-2"
          >
            Edit Question
          </Button>
          <Button variant="ghost" onClick={() => navigate("/admin/trivia")}>
            Back to Trivia
          </Button>
        </div>
      </div>
    </div>
  );
}
