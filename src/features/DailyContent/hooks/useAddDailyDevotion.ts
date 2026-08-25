// useAddDailyDevotion — state + API logic for AddDailyDevotion page
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { getBooksByTestament, getChaptersForBook } from "@/utilities/bibleUtils";

export function useAddDailyDevotion() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [testament, setTestament] = useState("");
  const [book, setBook] = useState("");
  const [chapter, setChapter] = useState("");
  const [verseNumber, setVerseNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date(); now.setHours(8, 0, 0, 0); return now;
  });
  const [selectedTime, setSelectedTime] = useState("08:00");
  const books = useMemo(() => getBooksByTestament(testament as "Old" | "New"), [testament]);
  const chapters = useMemo(() => getChaptersForBook(book), [book]);
  useEffect(() => {
    setSelectedTime(`${String(selectedDate.getHours()).padStart(2, "0")}:${String(selectedDate.getMinutes()).padStart(2, "0")}`);
  }, [selectedDate]);
  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value; setSelectedTime(time);
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return;
    const nd = new Date(selectedDate); nd.setHours(h, m, 0, 0); setSelectedDate(nd);
  }, [selectedDate]);
  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({ title: t.devotions.missingFields, description: t.devotions.fillRequiredFields, variant: "destructive" });
      return;
    }
    try {
      const res = await sendPostRequest("admin", "add-daily-devotion", {
        title, content, bookName: book || null,
        chapter: chapter ? Number(chapter) : null,
        verseNumber: verseNumber ? Number(verseNumber) : null,
        published: true, displayDate: selectedDate.toISOString(), displayTime: selectedDate.toISOString(),
      });
      if (res.returnCode === 200) {
        toast({ title: t.devotions.success, description: t.devotions.devotionSaved });
        navigate(routes.dailyDevotions.path);
      } else {
        toast({ title: t.common.error, description: res.returnMessage || t.devotions.failedToAdd, variant: "destructive" });
      }
    } catch {
      toast({ title: t.common.error, description: t.common.error, variant: "destructive" });
    }
  }, [title, content, book, chapter, verseNumber, selectedDate]);
  return {
    title, setTitle, content, setContent,
    testament, setTestament, book, setBook,
    chapter, setChapter, verseNumber, setVerseNumber,
    selectedDate, setSelectedDate, selectedTime, handleTimeChange,
    books, chapters, handleSave, t, isRtl, navigate,
  };
}
