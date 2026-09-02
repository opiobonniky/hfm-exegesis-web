import { BookOpen } from "lucide-react";
import type { Translations } from "@/components/languages/type";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TESTAMENTS } from "../constants";
import type { JournalTestament } from "../hooks/useJournalEntryPage";
import { FormCard } from "./FormCard";

const SELECT_CLASS_NAME = "rounded-xl border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-sm h-9";
const LABEL_CLASS_NAME = "text-xs font-medium text-foreground/80 dark:text-muted-foreground/50";

interface ScriptureLinkProps {
  t: Translations;
  testament: JournalTestament;
  bookName: string;
  chapter: string;
  verseNumber: string;
  books: string[];
  chapters: number[];
  verses: number[];
  onTestamentChange: (testament: string) => void;
  onBookChange: (bookName: string) => void;
  onChapterChange: (chapter: string) => void;
  onVerseChange: (verseNumber: string) => void;
  onOpenBibleReader: () => void;
}

export function ScriptureLink({
  t,
  testament,
  bookName,
  chapter,
  verseNumber,
  books,
  chapters,
  verses,
  onTestamentChange,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onOpenBibleReader,
}: ScriptureLinkProps) {
  return (
    <FormCard title={t.journal.linkToScripture || "Link to Scripture"} icon={BookOpen}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS_NAME}>{t.dailyVerse.testament || "Testament"}</Label>
          <Select value={testament} onValueChange={onTestamentChange}>
            <SelectTrigger className={SELECT_CLASS_NAME}>
              <SelectValue placeholder={t.journal.selectTestament || "Select testament"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.journal.allBooks || "All Books"}</SelectItem>
              {TESTAMENTS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.value === "Old" ? t.dailyVerse.oldTestament : t.dailyVerse.newTestament}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className={LABEL_CLASS_NAME}>{t.dailyVerse.book || "Book"}</Label>
          <Select value={bookName} onValueChange={onBookChange} disabled={!testament}>
            <SelectTrigger className={SELECT_CLASS_NAME}>
              <SelectValue placeholder={t.dailyVerse.selectBook || "Select book"} />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book} value={book}>{book}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {bookName && chapters.length > 0 && (
          <div className="space-y-1.5">
            <Label className={LABEL_CLASS_NAME}>{t.dailyVerse.chapter || "Chapter"}</Label>
            <Select value={chapter} onValueChange={onChapterChange}>
              <SelectTrigger className={SELECT_CLASS_NAME}>
                <SelectValue placeholder={t.dailyVerse.selectChapter || "Select chapter"} />
              </SelectTrigger>
              <SelectContent>
                {chapters.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {`${t.dailyVerse.chapter || "Chapter"} ${item}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {chapter && verses.length > 0 && (
          <div className="space-y-1.5">
            <Label className={LABEL_CLASS_NAME}>{t.dailyVerse.verse || "Verse"}</Label>
            <Select value={verseNumber} onValueChange={onVerseChange}>
              <SelectTrigger className={SELECT_CLASS_NAME}>
                <SelectValue placeholder={t.dailyVerse.selectVerse || "Select verse"} />
              </SelectTrigger>
              <SelectContent>
                {verses.map((item) => (
                  <SelectItem key={item} value={String(item)}>
                    {`${t.dailyVerse.verse || "Verse"} ${item}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {bookName && (
          <button
            type="button"
            onClick={onOpenBibleReader}
            disabled={!bookName || !chapter}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-border dark:border-stone-800 bg-card dark:bg-stone-900 text-muted-foreground dark:text-muted-foreground/70 hover:bg-muted dark:hover:bg-stone-800 transition-colors disabled:opacity-40"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t.journal.openBibleReader || "Open in Bible Reader"}
          </button>
        )}
      </div>
    </FormCard>
  );
}
