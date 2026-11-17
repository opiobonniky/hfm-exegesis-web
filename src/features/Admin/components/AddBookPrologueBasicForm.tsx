// AddBookPrologueBasicForm — step 1: book, title, summary, purpose, theme, publish.
import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AddBookPrologueModel } from "../types";
import { PROLOGUE_CONTENT_MAX } from "../constants";
import { CharCount } from "@/features/DailyContent/components/CharCount";
import { tt } from '@/components/languages/hardcodedTranslate';
import { Combobox } from '@/components/ui/combobox';

interface Props {
  state: AddBookPrologueModel;
}

export function AddBookPrologueBasicForm({ state: h }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm font-medium">{tt("Basic info")}</span>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{tt("Book name *")}</Label>
        <Combobox options={h.bookOptions.map(option => ({ ...option, label: tt(option.label) }))}
          value={h.form.bookName} onChange={book => book && h.updateField('bookName', book)}
          placeholder={tt('Select a Bible book')} searchPlaceholder={tt('Search Bible books...')}
          width="w-full" disabled={h.isEditMode || h.saving || h.loadingExisting} />
        <p className="text-xs text-muted-foreground">{tt(h.isEditMode ? 'The book stays fixed when editing this prologue.' : 'Choose the standard book name. Use the title below for your own heading.')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prologue-title" className="text-sm font-medium text-foreground">{tt("Title *")}</Label>
        <Input
          id="prologue-title"
          maxLength={300}
          placeholder={tt("e.g. The Gospel of John")}
          value={h.form.title}
          onChange={(e) => h.updateField("title", e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium text-foreground">{tt("Summary *")}</Label>
          <CharCount value={h.form.summary} max={PROLOGUE_CONTENT_MAX} />
        </div>
        <Textarea
          placeholder={tt("Brief overview of the book...")}
          value={h.form.summary}
          onChange={(e) => h.updateField("summary", e.target.value)}
          rows={4}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{tt("Purpose")}</Label>
        <Textarea
          placeholder={tt("Why was this book written?")}
          value={h.form.purpose}
          onChange={(e) => h.updateField("purpose", e.target.value)}
          rows={2}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">{tt("Key theme")}</Label>
        <Input
          placeholder={tt("e.g. Creation, Fall, Redemption")}
          value={h.form.keyTheme}
          onChange={(e) => h.updateField("keyTheme", e.target.value)}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium text-foreground">{tt("Full prologue content")}</Label>
          {h.form.content.trim() && (
            <CharCount value={h.form.content} max={PROLOGUE_CONTENT_MAX} />
          )}
        </div>
        <Textarea
          placeholder={tt("Full introduction text shown to readers (optional, falls back to summary)...")}
          value={h.form.content}
          onChange={(e) => h.updateField("content", e.target.value)}
          rows={7}
          maxLength={PROLOGUE_CONTENT_MAX}
          className="border-border bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold text-foreground">{tt("Published")}</Label>
          <p className="text-xs text-muted-foreground">{tt("Make visible to users")}</p>
        </div>
        <Switch
          checked={h.form.isPublished}
          onCheckedChange={(c) => h.updateField("isPublished", c)}
        />
      </div>
    </div>
  );
}
