// AddBookPrologueBasicForm — step 1: book, title, summary, purpose, theme, publish.
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AddBookPrologueModel } from "../types";
import { PROLOGUE_CONTENT_MAX } from "../constants";
import { CharCount } from "@/features/DailyContent/components/CharCount";

interface Props {
  model: AddBookPrologueModel;
}

export function AddBookPrologueBasicForm({ model: h }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">Basic info</span>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Book name *</Label>
        <div className="relative">
          <Input
            placeholder="Search for a book..."
            value={h.form.bookName}
            onChange={(e) => h.updateField("bookName", e.target.value)}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
          {h.filteredBooks.length > 0 &&
            !h.filteredBooks.some(
              (book) => book.toLowerCase() === h.form.bookName.trim().toLowerCase(),
            ) && (
              <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
                {h.filteredBooks.slice(0, 20).map((book) => (
                  <button
                    key={book}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-accent"
                    onClick={() => h.updateField("bookName", book)}
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Title *</Label>
        <Input
          placeholder="e.g. The Gospel of John"
          value={h.form.title}
          onChange={(e) => h.updateField("title", e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium text-foreground">Summary *</Label>
          <CharCount value={h.form.summary} max={PROLOGUE_CONTENT_MAX} />
        </div>
        <Textarea
          placeholder="Brief overview of the book..."
          value={h.form.summary}
          onChange={(e) => h.updateField("summary", e.target.value)}
          rows={4}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Purpose</Label>
        <Textarea
          placeholder="Why was this book written?"
          value={h.form.purpose}
          onChange={(e) => h.updateField("purpose", e.target.value)}
          rows={2}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Key theme</Label>
        <Input
          placeholder="e.g. Creation, Fall, Redemption"
          value={h.form.keyTheme}
          onChange={(e) => h.updateField("keyTheme", e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium text-foreground">Full prologue content</Label>
          {h.form.content.trim() && (
            <CharCount value={h.form.content} max={PROLOGUE_CONTENT_MAX} />
          )}
        </div>
        <Textarea
          placeholder="Full introduction text shown to readers (optional, falls back to summary)..."
          value={h.form.content}
          onChange={(e) => h.updateField("content", e.target.value)}
          rows={7}
          maxLength={PROLOGUE_CONTENT_MAX}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold text-foreground">Published</Label>
          <p className="text-xs text-muted-foreground">Make visible to users</p>
        </div>
        <Switch
          checked={h.form.isPublished}
          onCheckedChange={(c) => h.updateField("isPublished", c)}
        />
      </div>
    </div>
  );
}
