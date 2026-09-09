import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import type { AddDailyDevotionReferenceSectionProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";

export function AddDailyDevotionReferenceSection(props: AddDailyDevotionReferenceSectionProps) {
  const { testament, book, chapter, verseNumber, bibleVersion, testamentOptions, bookOptions, chapterOptions, bibleVersionOptions, setTestament, setBook, setChapter, setVerseNumber, setBibleVersion, t } = props;
  return (
    <CollapsibleSection title="Optional Bible Reference" defaultOpen={false}>
      <FormGrid columns={4}>
        <FormField label="Testament">
          <Combobox
            options={testamentOptions}
            value={testament}
            onChange={setTestament}
            placeholder={t.devotions.selectTestament}
            width="w-full"
          />
        </FormField>
        <FormField label="Book">
          <Combobox
            options={bookOptions}
            value={book}
            onChange={setBook}
            placeholder={t.dailyVerse.selectBook}
            disabled={!testament}
            width="w-full"
          />
        </FormField>
        <FormField label="Chapter">
          <Combobox
            options={chapterOptions}
            value={chapter}
            onChange={setChapter}
            placeholder={t.dailyVerse.selectChapter}
            disabled={!book}
            width="w-full"
          />
        </FormField>
        <FormField label="Verse">
          <Input
            type="number"
            value={verseNumber}
            onChange={(event) => setVerseNumber(event.target.value)}
            placeholder="Verse #"
            disabled={!chapter}
            min={1}
          />
        </FormField>
      </FormGrid>
      <FormField label="Bible Version">
        <Combobox
          options={bibleVersionOptions}
          value={bibleVersion}
          onChange={setBibleVersion}
          placeholder="Select version"
          width="w-full"
        />
      </FormField>
    </CollapsibleSection>
  );
}
