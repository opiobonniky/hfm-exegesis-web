import { CalendarIcon, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  testament: string; setTestament: (v: string) => void;
  book: string; setBook: (v: string) => void;
  chapter: string; setChapter: (v: string) => void;
  verseNumber: string; setVerseNumber: (v: string) => void;
  bibleVersion: string; setBibleVersion: (v: string) => void;
  selectedDate: Date; setSelectedDate: (d: Date) => void;
  selectedTime: string; handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  books: string[]; chapters: number[]; maxVerses: number;
  TESTAMENTS: { value: string; label: string }[];
  t: any; isRtl: boolean;
}

export function VerseReferenceSection(p: Props) {
  const fields = [
    [p.t.dailyVerse.book, p.book, p.setBook, p.books.map((b) => ({ value: b, label: b })), p.t.dailyVerse.selectBook, !p.testament],
    [p.t.dailyVerse.chapter, p.chapter, p.setChapter, p.chapters.map((c) => ({ value: String(c), label: String(c) })), p.t.dailyVerse.selectChapter, !p.book],
    [p.t.dailyVerse.verse, p.verseNumber, p.setVerseNumber, Array.from({ length: p.maxVerses }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })), p.t.dailyVerse.selectVerse, !p.chapter || p.maxVerses === 0],
    [p.t.dailyVerse.version, p.bibleVersion, p.setBibleVersion, BIBLE_VERSIONS.map((v) => ({ value: v.id, label: `${v.name} (${v.abbreviation})` })), p.t.dailyVerse.selectVersion, false],
  ] as const;

  return (
    <div className="space-y-5" dir={p.isRtl ? "rtl" : "ltr"}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>{p.t.dailyVerse.testament}</Label>
          <Combobox options={p.TESTAMENTS} value={p.testament} onChange={p.setTestament} placeholder={p.t.dailyVerse.selectTestament} width="w-full" />
        </div>
        {fields.map(([label, value, onChange, options, placeholder, disabled]) => (
          <div className="space-y-2" key={label}>
            <Label>{label}</Label>
            <Combobox options={options} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} width="w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{p.t.common.date}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !p.selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />{format(p.selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={p.selectedDate} onSelect={(d) => d && p.setSelectedDate(new Date(d))} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label>Time</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input type="time" value={p.selectedTime} onChange={p.handleTimeChange} className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
