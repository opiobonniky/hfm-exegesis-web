import { useState } from "react";
import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tt } from '@/components/languages/hardcodedTranslate';
import { PassageFields } from './PassageFields';

interface Props {
  testament: string; setTestament: (v: string) => void;
  book: string; setBook: (v: string) => void;
  chapter: string; setChapter: (v: string) => void;
  verseNumber: string; setVerseNumber: (v: string) => void;
  verseEnd: string; setVerseEnd: (v: string) => void;
  verseNumbers: number[];
  bibleVersion: string; setBibleVersion: (v: string) => void;
  bibleVersionOptions: { value: string; label: string }[];
  selectedDate: Date; setSelectedDate: (d: Date) => void;
  selectedTime: string; handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  books: string[]; chapters: number[]; maxVerses: number;
  TESTAMENTS: { value: string; label: string }[];
  t: any; isRtl: boolean;
}

export function VerseReferenceSection(p: Props) {
  const [dateOpen, setDateOpen] = useState(false);
  const fields = [
    [p.t.dailyVerse.version, p.bibleVersion, p.setBibleVersion, p.bibleVersionOptions, p.bibleVersion || p.t.dailyVerse.selectVersion, false],
  ] as const;

  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{p.t.dailyVerse.testament}</Label>
          <Combobox options={p.TESTAMENTS} value={p.testament} onChange={p.setTestament} placeholder={p.t.dailyVerse.selectTestament} width="w-full" />
        </div>
        {fields.map(([label, value, onChange, options, placeholder, disabled]) => (
          <div className="space-y-2" key={label}>
            <Label>{label}</Label>
            <Combobox options={[...options]} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} width="w-full" />
          </div>
        ))}
      </div>
      <PassageFields value={{ bookName: p.book, chapter: p.chapter, verseNumber: p.verseNumber, verseEnd: p.verseEnd }} verseNumbers={p.verseNumbers}
        onChange={next => {
          if (next.bookName !== p.book) p.setBook(next.bookName);
          else if (next.chapter !== p.chapter) p.setChapter(next.chapter);
          else if (next.verseNumber !== p.verseNumber) p.setVerseNumber(next.verseNumber);
          else p.setVerseEnd(next.verseEnd);
        }} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{p.t.common.date}</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !p.selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />{format(p.selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={p.selectedDate}
                onSelect={(d) => {
                  if (!d) return;
                  const next = new Date(d);
                  next.setHours(p.selectedDate.getHours(), p.selectedDate.getMinutes(), 0, 0);
                  p.setSelectedDate(next);
                  setDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>{tt("Time")}</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input type="time" value={p.selectedTime} onChange={p.handleTimeChange} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
