import { Loader2, BookOpen } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import type { AddDailyDevotionReferenceSectionProps } from "../types";
import { CollapsibleSection } from "./CollapsibleSection";
import { FormField } from "./FormField";
import { PassageFields } from "./PassageFields";
import { tt } from '@/components/languages/hardcodedTranslate';

export function AddDailyDevotionReferenceSection(props: AddDailyDevotionReferenceSectionProps) {
  const {
    book, chapter, verseNumber, bibleVersion, verseNumbers, verseText,
    isVerseLoading, bibleVersionOptions, setBook, setChapter,
    setVerseNumber, setBibleVersion,
  } = props;

  const passageErrorKey = !book ? 'bookName' : !chapter ? 'chapter' : 'verseNumber';
  return (
    <CollapsibleSection title={tt("Optional Bible Reference")} defaultOpen>
      <div className="space-y-4">
        <PassageFields
          value={{ bookName: book, chapter, verseNumber, verseEnd: "" }}
          verseNumbers={verseNumbers}
          loading={isVerseLoading}
          allowRange={false}
          errors={{ [passageErrorKey]: props.error || '' }}
          onChange={(next) => {
            if (next.bookName !== book) setBook(next.bookName);
            else if (next.chapter !== chapter) setChapter(next.chapter);
            else setVerseNumber(next.verseNumber);
          }}
        />
        <div data-validation-field="bibleVersion"><FormField label={tt("Bible Version")} error={props.bibleVersionError}>
          <Combobox
            options={bibleVersionOptions}
            value={bibleVersion}
            onChange={setBibleVersion}
            placeholder={bibleVersion || tt("Select version")}
            searchPlaceholder={tt("Search Bible versions…")}
            width="w-full"
            invalid={!!props.bibleVersionError}
          />
        </FormField></div>

        {(isVerseLoading || verseText) && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4" aria-live="polite">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              {isVerseLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <BookOpen className="h-4 w-4" />}
              {isVerseLoading ? tt("Loading verse…") : `${book} ${chapter}:${verseNumber} · ${bibleVersion}`}
            </div>
            {!isVerseLoading && <p className="text-sm leading-6 text-foreground">{verseText}</p>}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
