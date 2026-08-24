// VerseReferenceSection — testament/book/chapter/verse/version pickers + date
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
  return (
    <div className="space-y-5">
      {/* Testament → Book → Chapter → Verse → Version */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label>{p.t.dailyVerse.testament}</Label>
          <Combobox
            options={p.TESTAMENTS}
            value={p.testament}
            onChange={p.setTestament}
            placeholder={p.t.dailyVerse.selectTestament}
            width="w-full"
          />
        </div>
          <Label>{p.t.dailyVerse.book}</Label>
            options={p.books.map((b) => ({ value: b, label: b }))}
            value={p.book}
            onChange={p.setBook}
            placeholder={p.t.dailyVerse.selectBook}
            disabled={!p.testament}
          <Label>{p.t.dailyVerse.chapter}</Label>
            options={p.chapters.map((c) => ({ value: String(c), label: String(c) }))}
            value={p.chapter}
            onChange={p.setChapter}
            placeholder={p.t.dailyVerse.selectChapter}
            disabled={!p.book}
          <Label>{p.t.dailyVerse.verse}</Label>
            options={
              p.maxVerses > 0
                ? Array.from({ length: p.maxVerses }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
                : []
            }
            value={p.verseNumber}
            onChange={p.setVerseNumber}
            placeholder={p.t.dailyVerse.selectVerse}
            disabled={!p.chapter || p.maxVerses === 0}
          <Label>{p.t.dailyVerse.version}</Label>
            options={BIBLE_VERSIONS.map((v) => ({ value: v.id, label: `${v.name} (${v.abbreviation})` }))}
            value={p.bibleVersion}
            onChange={p.setBibleVersion}
            placeholder={p.t.dailyVerse.selectVersion}
      </div>
      {/* Date + Time */}
      <div className="grid sm:grid-cols-2 gap-4">
          <Label>{p.t.common.date}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !p.selectedDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(p.selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={p.selectedDate}
                onSelect={(d) => {
                  if (d) {
                    const nd = new Date(d);
                    nd.setHours(p.selectedDate.getHours(), p.selectedDate.getMinutes(), 0, 0);
                    p.setSelectedDate(nd);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Label>Time</Label>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="time"
              value={p.selectedTime}
              onChange={p.handleTimeChange}
              className="flex-1"
            />
          </div>
    </div>
  );
