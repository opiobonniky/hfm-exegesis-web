import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import type { AddDailyDevotionPageModel } from "../hooks/useAddDailyDevotion";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { FormGrid } from "./FormGrid";

interface Props {
  model: AddDailyDevotionPageModel;
}

export function AddDailyDevotionReferenceSection({ model: h }: Props) {
  return (
    <CollapsibleSection title="Optional Bible Reference" defaultOpen={false}>
      <FormGrid columns={4}>
        <FormField label="Testament">
          <Combobox
            options={h.testamentOptions}
            value={h.testament}
            onChange={h.setTestament}
            placeholder={h.t.devotions.selectTestament}
            width="w-full"
          />
        </FormField>
        <FormField label="Book">
          <Combobox
            options={h.bookOptions}
            value={h.book}
            onChange={h.setBook}
            placeholder={h.t.dailyVerse.selectBook}
            disabled={!h.testament}
            width="w-full"
          />
        </FormField>
        <FormField label="Chapter">
          <Combobox
            options={h.chapterOptions}
            value={h.chapter}
            onChange={h.setChapter}
            placeholder={h.t.dailyVerse.selectChapter}
            disabled={!h.book}
            width="w-full"
          />
        </FormField>
        <FormField label="Verse">
          <Input
            type="number"
            value={h.verseNumber}
            onChange={(event) => h.setVerseNumber(event.target.value)}
            placeholder="Verse #"
            disabled={!h.chapter}
            min={1}
          />
        </FormField>
      </FormGrid>
      <FormField label="Bible Version">
        <Combobox
          options={h.bibleVersionOptions}
          value={h.bibleVersion}
          onChange={h.setBibleVersion}
          placeholder="Select version"
          width="w-full"
        />
      </FormField>
    </CollapsibleSection>
  );
}
