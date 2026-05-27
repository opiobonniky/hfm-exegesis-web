"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Sun,
  Save,
  ArrowLeft,
  BookOpen,
  Lightbulb,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Combobox } from "@/components/ui/combobox";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";
import { useLanguage } from "@/components/languages/languageProvider";

const AddDailyDevotion = () => {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Optional Bible reference
  const [testament, setTestament] = useState<string>("");
  const [book, setBook] = useState<string>("");
  const [chapter, setChapter] = useState<string>("");
  const [verseNumber, setVerseNumber] = useState<string>("");

  // Date + Time
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = new Date();
    now.setHours(8, 0, 0, 0); // default: 8:00 AM
    return now;
  });

  const [selectedTime, setSelectedTime] = useState<string>("08:00");

  const navigate = useNavigate();

  // Bible reference lists (simplified - would need full utilities in production)
  const books = useMemo(() => {
    if (!testament) return [];
    return testament === "Old"
      ? ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"]
      : ["Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation"];
  }, [testament]);

  const chapters = useMemo(() => {
    // Simplified chapter list - in production would use actual data
    return Array.from({ length: 150 }, (_, i) => i + 1);
  }, [book]);

  // Sync time input with selectedDate
  useEffect(() => {
    const hours = selectedDate.getHours().toString().padStart(2, "0");
    const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
    setSelectedTime(`${hours}:${minutes}`);
  }, [selectedDate]);

  // Update date when time changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setSelectedTime(time);

    if (!time) return;

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
  };

  const handleAddDevotion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: t.devotions.missingFields,
        description: t.devotions.fillRequiredFields,
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        title,
        content,
        bookName: book || null,
        chapter: chapter ? Number(chapter) : null,
        verseNumber: verseNumber ? Number(verseNumber) : null,
        published: true,
        displayDate: selectedDate.toISOString(),
        displayTime: selectedDate.toISOString(),
      };

      const response = await sendPostRequest(
        "admin",
        "add-daily-devotion",
        payload,
      );

      if (response.returnCode === 200) {
        toast({
          title: t.devotions.success,
          description: t.devotions.devotionSaved,
        });
        navigate(routes.dailyDevotions.path);
      } else {
        toast({
          title: t.common.error,
          description: response.returnMessage || t.devotions.failedToAdd,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t.common.error,
        description: t.common.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={routes.dailyDevotions.path} className="flex items-center gap-2">
              <ArrowLeft className={cn("h-5 w-5", isRtl ? "ml-2" : "mr-2")} />
              {t.common.back}
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
              <Sun className="h-7 w-7 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight font-heading text-gradient">
                {t.devotions.addDevotion}
              </h1>
              <p className="text-muted-foreground">
                {t.devotions.addPageSubtitle}
              </p>
            </div>
          </div>
        </div>

        <Card className="fade-up stagger-1 border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              {t.devotions.devotionDetails}
            </CardTitle>
            <CardDescription>
              {t.devotions.devotionDetailsDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            <form onSubmit={handleAddDevotion} className="space-y-7">
              {/* Title */}
              <div className="space-y-2">
                <Label>{t.common.title} *</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.devotions.titlePlaceholder}
                  className="text-lg"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label>{t.common.content} *</Label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t.devotions.contentPlaceholder}
                  className="min-h-[300px] leading-relaxed"
                />
              </div>

              {/* Optional Bible Reference */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">{t.devotions.optionalBibleReference}</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="space-y-2">
                    <Label>{t.devotions.testament}</Label>
                    <Combobox
                      options={[
                        { value: "Old", label: t.dailyVerse.oldTestament },
                        { value: "New", label: t.dailyVerse.newTestament },
                      ]}
                      value={testament}
                      onChange={setTestament}
                      placeholder={t.devotions.selectTestament}
                      width="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.dailyVerse.book}</Label>
                    <Combobox
                      options={books.map((b) => ({ value: b, label: b }))}
                      value={book}
                      onChange={setBook}
                      placeholder={t.dailyVerse.selectBook}
                      disabled={!testament}
                      width="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.dailyVerse.chapter}</Label>
                    <Combobox
                      options={chapters.map((c) => ({
                        value: String(c),
                        label: String(c),
                      }))}
                      value={chapter}
                      onChange={setChapter}
                      placeholder={t.dailyVerse.selectChapter}
                      disabled={!book}
                      width="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t.dailyVerse.verse}</Label>
                    <Input
                      type="number"
                      value={verseNumber}
                      onChange={(e) => setVerseNumber(e.target.value)}
                      placeholder={t.devotions.verseNumber}
                      disabled={!chapter}
                      min={1}
                    />
                  </div>
                </div>
                {book && chapter && verseNumber && (
                  <p className="text-sm text-muted-foreground">
                    {t.devotions.referenceFormat.replace('{book}', book).replace('{chapter}', String(chapter)).replace('{verse}', String(verseNumber))}
                  </p>
                )}
              </div>

              {/* Date & Time Picker */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>{t.devotions.displayDate} *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP")
                        ) : (
                          <span>{t.devotions.pickDate}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{t.devotions.displayTime}</Label>
                  <Input
                    type="time"
                    value={selectedTime}
                    onChange={handleTimeChange}
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="outline" asChild>
                  <Link to={routes.dailyDevotions.path}>{t.common.cancel}</Link>
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  {t.devotions.saveDevotion}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddDailyDevotion;