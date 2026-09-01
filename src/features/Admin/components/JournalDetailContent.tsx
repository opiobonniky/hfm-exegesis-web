// JournalDetailContent — renders journal entry fields as sections
"use client";

import { Globe, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold">{item.title || "Untitled"}</h2>
            <Badge variant={item.isPublished ? "default" : "outline"}>
              {item.isPublished ? (
                <Globe className="w-3 h-3 mr-1" />
              ) : (
                <Lock className="w-3 h-3 mr-1" />
              )}
              {item.isPublished ? "Public" : "Private"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
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
        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
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
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
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
      <p className="text-xs text-muted-foreground">
        by user {userId?.slice(0, 8)}…
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePublication}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-muted transition-colors"
        >
          {isPublished ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5 text-emerald-500" />}
          {isPublished ? "Make Private" : "Make Public"}
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
        >
          Delete
        </button>
      </div>
    </>
  );
}
