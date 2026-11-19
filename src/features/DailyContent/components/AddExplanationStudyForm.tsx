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
            placeholder={tt("Brief introduction to the verse...")}
            value={h.form.studyMetadata.introduction}
            onChange={(e) => h.updateNested("studyMetadata", "introduction", e.target.value)}
            rows={5}
            maxLength={BACKGROUND_MAX}
            className="border-border bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Author")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundAuthor} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundAuthor}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundAuthor", e.target.value)}
              placeholder={tt("Author background and attribution...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Book")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundBook} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundBook}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundBook", e.target.value)}
              placeholder={tt("The book and its place in Scripture...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{tt("Background — Context")}</Label>
              <CharCount value={h.form.studyMetadata.backgroundContext} max={BACKGROUND_MAX} />
            </div>
            <Textarea
              value={h.form.studyMetadata.backgroundContext}
              onChange={(e) => h.updateNested("studyMetadata", "backgroundContext", e.target.value)}
              placeholder={tt("Context of the verse within the passage...")}
              rows={5}
              maxLength={BACKGROUND_MAX}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      <WordStudyEditor value={wordStudies} showErrors={props.showErrors} onChange={rows => updateField('wordStudies', rows.map((row, sortOrder) => ({ ...row, sortOrder })))} />
    </div>
  );
}
