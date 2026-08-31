// AdminReadingPlanDetail — admin view of a reading plan with assignments
"use client";

import { ArrowLeft, Loader2, Calendar, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminReadingPlanDetail } from "../hooks/useAdminReadingPlanDetail";

export default function AdminReadingPlanDetail() {
  const h = useAdminReadingPlanDetail();

  if (h.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => h.navigate("/admin/reading-plans")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" /> Reading Plan
                </h1>
                <p className="text-xs text-muted-foreground">
                  {h.item.planId}
                </p>
              </div>
            </div>
            <Badge
              variant={h.item.isPublished !== false ? "default" : "secondary"}
            >
              {h.item.isPublished !== false ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Plan info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{h.item.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  {h.item.category && (
                    <Badge variant="outline">{h.item.category}</Badge>
                  )}
                  {h.item.durationDays && (
                    <Badge variant="secondary">
                      {h.item.durationDays} days
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {h.item.description && (
              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                {h.item.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Daily Assignments */}
        {h.item.assignments && h.item.assignments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Daily Assignments ({h.item.assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {h.item.assignments.map((a) => (
                  <div
                    key={a.dayNumber}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {a.dayNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {a.title || `Day ${a.dayNumber}`}
                      </p>
                      {a.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {a.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {a.bookName && (
                          <span className="text-[10px] text-muted-foreground">
                            <BookOpen className="w-2.5 h-2.5 inline mr-0.5" />
                            {a.bookName}{" "}
                            {a.chapterStart}
                            {a.chapterEnd && a.chapterEnd !== a.chapterStart
                              ? `–${a.chapterEnd}` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz Questions */}
        {h.item.questions && h.item.questions.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Quiz Questions ({h.item.questions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {h.item.questions.map((q, idx) => {
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
                    <div
                      key={q.id}
                      className="p-3 rounded-lg border border-border/50"
                    >
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
        )}

        {/* Metadata */}
        {h.item.createdOn && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs text-muted-foreground">
                <p className="font-semibold mb-1">Created</p>
                <p>{new Date(h.item.createdOn).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => h.navigate("/admin/reading-plans")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Reading Plans
          </Button>
        </div>
      </div>
    </div>
  );
}
