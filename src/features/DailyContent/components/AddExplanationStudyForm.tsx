import { Target } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AddExplanationStudyFormProps } from "../types";
import { CharCount } from "./CharCount";
import { WordStudyEditor } from './WordStudyEditor';
import { tt } from '@/components/languages/hardcodedTranslate';

const BACKGROUND_MAX = 10000;

export function AddExplanationStudyForm(props: AddExplanationStudyFormProps) {
  const { introduction, backgroundAuthor, backgroundBook, backgroundContext, wordStudies, updateNested, addWordStudy, removeWordStudy, updateWordStudy, updateField } = props;
  const errors: NonNullable<AddExplanationStudyFormProps["errors"]> = props.errors || {};
  const fieldError = (key: "introduction" | "backgroundAuthor" | "backgroundBook" | "backgroundContext", id: string) =>
    errors[key] ? <p id={id} role="status" className="text-xs text-destructive">{tt(errors[key]!)}</p> : null;
  const h = {
    form: {
      studyMetadata: { introduction, backgroundAuthor, backgroundBook, backgroundContext },
      wordStudies,
    },
    updateNested,
    addWordStudy,
    removeWordStudy,
    updateWordStudy,
    updateField,
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sky-600">
        <Target className="h-4 w-4" />
        <span className="text-sm font-medium">{tt("Study context")}</span>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Verse introduction")}</Label>
            <CharCount value={h.form.studyMetadata.introduction} max={BACKGROUND_MAX} />
          </div>
          <Textarea
            aria-invalid={!!errors.introduction}
            aria-describedby={errors.introduction ? "introduction-error" : undefined}
            placeholder={tt("Brief introduction to the verse...")}
            value={h.form.studyMetadata.introduction}
            onChange={(e) => h.updateNested("studyMetadata", "introduction", e.target.value)}
            rows={5}
            maxLength={BACKGROUND_MAX}
            className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.introduction ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {fieldError("introduction", "introduction-error")}
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Author")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundAuthor} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              aria-invalid={!!errors.backgroundAuthor}
              aria-describedby={errors.backgroundAuthor ? "background-author-error" : undefined}
              value={h.form.studyMetadata.backgroundAuthor}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundAuthor", e.target.value)}
              placeholder={tt("Author background and attribution...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.backgroundAuthor ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {fieldError("backgroundAuthor", "background-author-error")}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Book")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundBook} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              aria-invalid={!!errors.backgroundBook}
              aria-describedby={errors.backgroundBook ? "background-book-error" : undefined}
              value={h.form.studyMetadata.backgroundBook}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundBook", e.target.value)}
              placeholder={tt("The book and its place in Scripture...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.backgroundBook ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {fieldError("backgroundBook", "background-book-error")}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Context")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundContext} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              aria-invalid={!!errors.backgroundContext}
              aria-describedby={errors.backgroundContext ? "background-context-error" : undefined}
              value={h.form.studyMetadata.backgroundContext}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundContext", e.target.value)}
              placeholder={tt("Context of the verse within the passage...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className={`border-border bg-background text-foreground placeholder:text-muted-foreground ${errors.backgroundContext ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
            {fieldError("backgroundContext", "background-context-error")}
          </div>
        </div>
      </div>

      <WordStudyEditor value={wordStudies} showErrors={props.showErrors} requireAll
        onChange={rows => updateField('wordStudies', rows.map((row, sortOrder) => ({ ...row, sortOrder })))} />
    </div>
  );
}
