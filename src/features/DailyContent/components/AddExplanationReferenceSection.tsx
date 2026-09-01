import { BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BIBLE_BOOKS } from "@/features/Bible/constants";
import { cn } from "@/lib/utils";
import { BIBLE_VERSIONS } from "../constants";
import type { AddExplanationPageModel } from "../hooks/useAddExplanation";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";
import { FormSectionCard } from "./FormSectionCard";
import { InlineLoadingIndicator } from "./InlineLoadingIndicator";
import { VerseTextPreview } from "./VerseTextPreview";

interface Props {
  model: AddExplanationPageModel;
}

export function AddExplanationReferenceSection({ model: h }: Props) {
  return (
    <FormSectionCard
      icon={BookOpen}
      title={h.t.verseExplanations.refTitle}
      description={h.t.verseExplanations.refDesc}
    >
      <FormField label={h.t.verseExplanations.book}>
        <Select value={h.bookName || ""} onValueChange={h.setBookName} disabled={h.isEditMode}>
          <SelectTrigger className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}>
            <SelectValue placeholder={h.t.verseExplanations.selectBookPlaceholder} />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {BIBLE_BOOKS.map((book) => (
              <SelectItem key={book} value={book}>{book}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      <FormGrid columns={2}>
        <FormField label={h.t.verseExplanations.chapter}>
          <Input
            type="number"
            min={1}
            max={150}
            value={h.chapter}
            readOnly={h.isEditMode}
            className={cn(h.isEditMode && "bg-muted/40 text-muted-foreground")}
            onChange={(event) => h.setChapter(Math.max(1, parseInt(event.target.value) || 1))}
            onBlur={h.handleVerseBlur}
          />
        </FormField>
        <FormField label={h.t.verseExplanations.verse}>
          <Input
            type="number"
            min={1}
            max={200}
            value={h.verseNumber}
            onChange={(event) => h.setVerseNumber(Math.max(1, parseInt(event.target.value) || 1))}
            onBlur={h.handleVerseBlur}
          />
        </FormField>
      </FormGrid>

      {h.verseText && (
        <VerseTextPreview
          verseText={h.verseText}
          bookName={h.bookName ?? ""}
          chapter={h.chapter}
          verseNumber={h.verseNumber}
          verseTextLabel={h.t.verseExplanations.verseText}
          verseTextHint={h.t.verseExplanations.verseTextHint}
        />
      )}

      <FormField label={h.t.verseExplanations.bibleVersion} optional>
        <Select
          value={h.bibleVersion || h.NONE_VALUE}
          onValueChange={(value) => h.setBibleVersion(value === h.NONE_VALUE ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={h.t.verseExplanations.bibleVersionPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={h.NONE_VALUE}>{h.t.verseExplanations.noneOption}</SelectItem>
            {BIBLE_VERSIONS.map((version) => (
              <SelectItem key={version} value={version}>{version}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>

      {h.loadingExisting && (
        <InlineLoadingIndicator text={h.t.verseExplanations.checkingExisting} />
      )}
    </FormSectionCard>
  );
}
