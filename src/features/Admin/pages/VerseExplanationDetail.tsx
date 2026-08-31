// VerseExplanationDetail — full detail view for a verse explanation
"use client";

import { ArrowLeft, Loader2, BookOpen, Lightbulb, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVerseExplanationDetail } from "../hooks/useVerseExplanationDetail";

export default function VerseExplanationDetail() {
  const h = useVerseExplanationDetail();

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
                onClick={() => h.navigate("/admin/verse-explanations")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" /> Verse
                  Explanation
                </h1>
                <p className="text-xs text-muted-foreground">
                  {h.item.bookName} {h.item.chapter}:{h.item.verseNumber}
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
        {/* Reference card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {h.item.bookName} {h.item.chapter}:{h.item.verseNumber}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Verse Reference
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explanation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {h.item.explanation}
            </p>
          </CardContent>
        </Card>

        {/* Learn More */}
        {h.item.learnMore && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Learn More
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                {h.item.learnMore}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {(h.item.createdOn || h.item.updatedOn) && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                {h.item.createdOn && (
                  <div>
                    <p className="font-semibold mb-1">Created</p>
                    <p>{new Date(h.item.createdOn).toLocaleString()}</p>
                  </div>
                )}
                {h.item.updatedOn && (
                  <div>
                    <p className="font-semibold mb-1">Updated</p>
                    <p>{new Date(h.item.updatedOn).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => h.navigate("/admin/verse-explanations")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Explanations
          </Button>
        </div>
      </div>
    </div>
  );
}
