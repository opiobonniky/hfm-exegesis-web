import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { tt } from '@/components/languages/hardcodedTranslate';
import { PassageFields } from './PassageFields';
import { DateTimeFields } from './DateTimeFields';

interface Props {
  book: string; setBook: (v: string) => void;
  chapter: string; setChapter: (v: string) => void;
  verseNumber: string; setVerseNumber: (v: string) => void;
  verseEnd: string; setVerseEnd: (v: string) => void;
  verseNumbers: number[];
  bibleVersion: string; setBibleVersion: (v: string) => void;
  bibleVersionOptions: { value: string; label: string }[];
  selectedDate: Date; setSelectedDate: (d: Date) => void;
  selectedTime: string; handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  t: any; isRtl: boolean;
  errors?: Partial<Record<'bookName' | 'chapter' | 'verseNumber' | 'verseEnd' | 'bibleVersion' | 'date' | 'time', string>>;
}

export function VerseReferenceSection(p: Props) {
  const fields = [
    [p.t.dailyVerse.version, p.bibleVersion, p.setBibleVersion, p.bibleVersionOptions, p.bibleVersion || p.t.dailyVerse.selectVersion, false],
  ] as const;

  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      <PassageFields value={{ bookName: p.book, chapter: p.chapter, verseNumber: p.verseNumber, verseEnd: p.verseEnd }} verseNumbers={p.verseNumbers} errors={p.errors}
        onChange={next => {
          if (next.bookName !== p.book) p.setBook(next.bookName);
          else if (next.chapter !== p.chapter) p.setChapter(next.chapter);
          else if (next.verseNumber !== p.verseNumber) p.setVerseNumber(next.verseNumber);
          else p.setVerseEnd(next.verseEnd);
        }} />
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value, onChange, options, placeholder, disabled]) => (
          <div className="space-y-2" key={label} data-validation-field="bibleVersion">
            <Label>{label}</Label>
            <Combobox ariaLabel={label} options={[...options]} value={value} onChange={onChange} placeholder={placeholder}
              disabled={disabled} invalid={!!p.errors?.bibleVersion} width="w-full" />
            {p.errors?.bibleVersion && <p role="status" className="text-xs text-destructive">{tt(p.errors.bibleVersion)}</p>}
          </div>
        ))}
      </div>
      <DateTimeFields selectedDate={p.selectedDate} setSelectedDate={p.setSelectedDate}
        selectedTime={p.selectedTime} handleTimeChange={p.handleTimeChange} errors={p.errors} />
    </div>
  );
}
