// JournalDetailContent — renders journal entry fields as sections
"use client";

import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DetailSection } from "./DetailSection";

interface JournalEntry {
  title?: string;
  content?: string;
  category?: string;
  bookName?: string;
  chapter?: number;
  verseNumber?: number;
  mood?: string;
  isPublished: boolean;
  prayers?: string;
  gratitude?: string;
  learnings?: string;
  application?: string;
  createdOn?: string;
  updatedOn?: string;
}

export function JournalDetailContent({ item }: { item: JournalEntry }) {
  return (
    <>
      {/* Title + visibility */}
      <Card>
        <CardContent className="pt-5 sm:pt-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
            <h2 className="min-w-0 break-words text-lg font-bold sm:text-xl">
              {item.title || "Untitled"}
            </h2>
            <Badge variant={item.isPublished ? "default" : "outline"} className="shrink-0">
              {item.isPublished ? (
                <Globe className="w-3 h-3 mr-1" />
              ) : (
                <Lock className="w-3 h-3 mr-1" />
              )}
              {item.isPublished ? "Public" : "Private"}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.category && (
              <Badge variant="secondary">{item.category}</Badge>
            )}
            {item.bookName && (
              <Badge variant="outline">
                {item.bookName}
                {item.chapter ? ` ${item.chapter}` : ""}
                {item.verseNumber ? `:${item.verseNumber}` : ""}
              </Badge>
            )}
            {item.mood && (
              <Badge variant="outline" className="text-amber-600">
                {item.mood}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <DetailSection title="Content">
        <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
          {item.content}
        </p>
      </DetailSection>

      {/* Additional fields */}
      {[
        { label: "Prayers", value: item.prayers },
        { label: "Gratitude", value: item.gratitude },
        { label: "Learnings", value: item.learnings },
        { label: "Application", value: item.application },
      ]
        .filter((f) => f.value)
        .map((field) => (
          <DetailSection key={field.label} title={field.label}>
            <p className="break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {field.value}
            </p>
          </DetailSection>
        ))}
    </>
  );
}

/* ─── Journal detail header with publication toggle ─── */
export function JournalDetailHeader({
  userId,
  isPublished,
  onTogglePublication,
  onDelete,
}: {
  userId?: string;
  isPublished: boolean;
  onTogglePublication: () => void;
  onDelete: () => void;
}) {
  return (
    <>
      <p className="w-full text-xs text-muted-foreground sm:w-auto">
        by user {userId?.slice(0, 8)}…
      </p>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <button
          onClick={onTogglePublication}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-muted sm:min-h-9 sm:flex-none sm:py-1.5"
        >
          {isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5 text-emerald-500" />}
          {isPublished ? "Make Private" : "Make Public"}
        </button>
        <button
          onClick={onDelete}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 sm:min-h-9 sm:flex-none sm:py-1.5"
        >
          Delete
        </button>
      </div>
    </>
  );
}
