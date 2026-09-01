// VerseExplanationDetailContent — renders verse explanation fields as sections
"use client";

import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSection } from "./DetailSection";

interface VerseExplanation {
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore?: string;
}

export function VerseExplanationDetailContent({ item }: { item: VerseExplanation }) {
  return (
    <>
      {/* Reference card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {item.bookName} {item.chapter}:{item.verseNumber}
              </h2>
              <p className="text-sm text-muted-foreground">Verse Reference</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <DetailSection title="Explanation">
        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
          {item.explanation}
        </p>
      </DetailSection>

      {/* Learn More */}
      {item.learnMore && (
        <DetailSection title="Learn More">
          <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
            {item.learnMore}
          </p>
        </DetailSection>
      )}
    </>
  );
}
