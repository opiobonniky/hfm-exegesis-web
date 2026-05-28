"use client";

import { useState, useEffect, useMemo } from "react";
import { format, isSunday, isSameDay, set } from "date-fns";
import {
  CalendarIcon,
  Sun,
  Save,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  AlertTriangle,
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
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getVerseText,
  getBooksByTestament,
  getChaptersForBook,
  getVersesCountForChapter,
  setActiveVersion,
} from "@/utilities/bibleUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { sendGetRequest, sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";
import { routes } from "@/components/Routes/routes";
import { BIBLE_VERSIONS, getVersionById } from "@/assets/bibleVersion/json/bibleVersions";

const AddDailyVerse = () => {
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're editing an existing verse
  const editingVerse = location.state?.verse as {
    testament?: string;
    bookName?: string;
    chapter?: number;
    verseNumber?: number;
    explanation?: string;
    learnMore?: string;
    bibleVersion?: string;
    displayDate?: string;
    verseText?: string;
    published?: boolean;
  } | undefined;
  const isEditing = !!editingVerse;

  const [testament, setTestament] = useState<string>(editingVerse?.testament || "");
  const [book, setBook] = useState<string>(editingVerse?.bookName || "");
  const [chapter, setChapter] = useState<string>(editingVerse?.chapter?.toString() || "");
  const [verseNumber, setVerseNumber] = useState<string>(editingVerse?.verseNumber?.toString() || "");
  const [explanation, setExplanation] = useState(editingVerse?.explanation || "");
  const [learnMore, setLearnMore] = useState(editingVerse?.learnMore || "");
  const [bibleVersion, setBibleVersion] = useState<string>(editingVerse?.bibleVersion || "BSB");
  const [published, setPublished] = useState(editingVerse?.published ?? true);

  // Date + Time
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const now = editingVerse?.displayDate 
      ? new Date(editingVerse.displayDate) 
      : new Date();
    now.setHours(8, 0, 0, 0); // default: 8:00 AM
    return now;
  });

  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (editingVerse?.displayDate) {
      const date = new Date(editingVerse.displayDate);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    return "08:00";
  });

  const [verseText, setVerseText] = useState(editingVerse?.verseText || "");
  const [isVerseEditing, setIsVerseEditing] = useState(false);
  const [isVerseLoading, setIsVerseLoading] = useState(false);

  // Derived lists
  const books = useMemo(
    () => getBooksByTestament(testament as "Old" | "New"),
    [testament],
  );
  const chapters = useMemo(() => getChaptersForBook(book), [book]);
  const maxVerses = useMemo(
    () =>
      book && chapter ? getVersesCountForChapter(book, Number(chapter)) : 0,
    [book, chapter],
  );

  // Translated testaments
  const TESTAMENTS = useMemo(
    () => [
      { value: "Old", label: t.dailyVerse.oldTestament },
      { value: "New", label: t.dailyVerse.newTestament },
    ],
    [t],
  );

  // Auto-fetch verse text
  useEffect(() => {
    if (!book || !chapter || !verseNumber || isVerseEditing) {
      if (!isVerseEditing) {
        setVerseText("");
      }
      return;
    }
    setIsVerseLoading(true);
    setActiveVersion(bibleVersion);
    const text = getVerseText(book, Number(chapter), Number(verseNumber));
    setVerseText(text || "Verse not found.");
    setIsVerseLoading(false);
  }, [book, chapter, verseNumber, bibleVersion, isVerseEditing]);

  //

  // Sync time input with selectedDate
  useEffect(() => {
    const hours = selectedDate.getHours().toString().padStart(2, "0");
    const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
    setSelectedTime(`${hours}:${minutes}`);
  }, [selectedDate]);

  // Update date when time changes
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value; // "HH:mm"
    setSelectedTime(time);

    if (!time) return;

    const [hours, minutes] = time.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return;

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setSelectedDate(newDate);
  };

  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    conflict: any;
    payload: any;
  }>({ open: false, conflict: null, payload: null });

  const handleAddVerse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!book || !chapter || !verseNumber || !explanation.trim()) {
      toast({
        title: t.dailyVerse.missingFields,
        description: t.dailyVerse.fillAllRequired,
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        bookName: book,
        chapter: Number(chapter),
        verseNumber: Number(verseNumber),
        bibleVersion,
        verseText: verseText || null,
        explanation,
        learnMore: learnMore || null,
        published,
        displayDate: selectedDate.toISOString().split('T')[0],
      };

      const response = await sendPostRequest(
        "admin",
        "add-daily-verse",
        payload,
      );

      if (response.returnCode === 200) {
        toast({
          title: t.dailyVerse.toastSuccess,
          description:
            response.returnMessage || t.dailyVerse.verseAdded,
        });
        setTimeout(() => {
          navigate(routes.dailyVerse.path);
        }, 2000);
      } else if (response.returnCode === 409) {
        setConflictDialog({ open: true, conflict: response.returnData?.conflicts?.[0], payload });
      } else {
        toast({
          title: t.dailyVerse.toastSaveFailedDesc,
          description: response.returnMessage || t.dailyVerse.toastSaveFailedDesc,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: t.dailyVerse.toastSaveErrorDesc,
        description: t.dailyVerse.toastSaveErrorDesc,
        variant: "destructive",
      });
      console.error(err);
    }
  };

  const handleConflictUpdate = async () => {
    const c = conflictDialog.conflict;
    if (!c) return;
    setConflictDialog({ open: false, conflict: null, payload: null });
    try {
      const response = await sendPostRequest("admin", "add-daily-verse", {
        id: c.existing.id,
        ...conflictDialog.payload,
      });
      if (response.returnCode === 200) {
        toast({ title: t.dailyVerse.toastUpdated, description: t.dailyVerse.toastUpdateSuccessDesc });
        setTimeout(() => navigate(routes.dailyVerse.path), 2000);
      } else {
        toast({ title: t.dailyVerse.toastUpdateFailedDesc, description: response.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: t.dailyVerse.toastUpdateFailedDesc, description: t.dailyVerse.toastUpdateFailedDesc, variant: "destructive" });
    }
  };

  // Calendar modifiers – highlight Sundays + special days
  const modifiers = {
    sunday: (date: Date) => isSunday(date),
    special: (date: Date) => date.getDate() === 1, // example: 1st of month
    today: (date: Date) => isSameDay(date, new Date()),
  };

  const modifiersClassNames = {
    sunday: "text-red-600 font-medium",
    special:
      "after:content-['★'] after:text-yellow-500 after:absolute after:bottom-1 after:right-1 after:text-xs",
    today: "bg-accent text-accent-foreground font-bold",
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="fade-up flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={routes.dashboard.path}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className={cn("h-5 w-5", isRtl && "rotate-180")} />
              {t.common.back}
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
                <Sun className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-heading text-gradient">
                  {t.dailyVerse.addVerseTitle}
                </h1>
                <p className="text-muted-foreground">
                  {t.dailyVerse.addVerseSubtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="fade-up stagger-1 border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {t.dailyVerse.verseDetails}
            </CardTitle>
            <CardDescription>
              {t.dailyVerse.verseDetailsDesc}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            <form onSubmit={handleAddVerse} className="space-y-7">
               {/* Testament - Book - Chapter - Verse - Version */}
               <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                 <div className="space-y-2">
                   <Label>{t.dailyVerse.testament}</Label>
                   <Combobox
                     options={TESTAMENTS}
                     value={testament}
                     onChange={setTestament}
                     placeholder={t.dailyVerse.selectTestament}
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
                   <Combobox
                     options={
                       maxVerses > 0
                         ? Array.from(
                             { length: maxVerses },
                             (_, i) => i + 1,
                           ).map((v) => ({ value: String(v), label: String(v) }))
                         : []
                     }
                     value={verseNumber}
                     onChange={setVerseNumber}
                     placeholder={t.dailyVerse.selectVerse}
                     disabled={!chapter || maxVerses === 0}
                     width="w-full"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label>{t.dailyVerse.version}</Label>
                   <Combobox
                     options={BIBLE_VERSIONS.map(v => ({
                       value: v.id,
                       label: `${v.name} (${v.abbreviation})`,
                     }))}
                     value={bibleVersion}
                     onChange={setBibleVersion}
                     placeholder={t.dailyVerse.selectVersion}
                     width="w-full"
                   />
                 </div>
               </div>

                {/* Verse Text */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>
                      {t.dailyVerse.verseText}{" "}
                      <span className="text-xs text-muted-foreground ml-2">
                        {isVerseEditing ? t.dailyVerse.editedLabel : t.dailyVerse.readOnlyLabel}
                      </span>
                      {bibleVersion && (
                        <span className="text-xs text-primary font-medium ml-2">
                          • {BIBLE_VERSIONS.find(v => v.id === bibleVersion)?.abbreviation || bibleVersion}
                        </span>
                      )}
                    </span>
                  </Label>
                  <div className="relative">
                    {isVerseEditing ? (
                      <Textarea
                        value={verseText}
                        onChange={(e) => setVerseText(e.target.value)}
                        className="min-h-[110px] resize-none font-serif leading-relaxed"
                        placeholder={t.dailyVerse.editPlaceholder}
                      />
                    ) : (
                      <Textarea
                        value={verseText}
                        readOnly
                        className="min-h-[110px] resize-none font-serif leading-relaxed"
                        placeholder={t.dailyVerse.readOnlyPlaceholder}
                      />
                    )}
                    {book && chapter && verseNumber && (
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        {t.dailyVerse.refPrefix} {book} {chapter}:{verseNumber} ({BIBLE_VERSIONS.find(v => v.id === bibleVersion)?.abbreviation || bibleVersion})
                      </div>
                    )}
                  </div>
                </div>

               {/* Date Picker */}
               <div className="space-y-2">
                 <Label>{t.common.date}</Label>
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
                       {format(selectedDate, "PPP")}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0">
                     <Calendar
                       mode="single"
                       selected={selectedDate}
                       onSelect={(date: Date | undefined) => {
                         if (date) {
                           const newDate = new Date(date);
                           newDate.setHours(
                             selectedDate.getHours(),
                             selectedDate.getMinutes(),
                             0,
                             0,
                           );
                           setSelectedDate(newDate);
                         }
                       }}
                       initialFocus
                       modifiers={modifiers}
                       modifiersClassNames={modifiersClassNames}
                       disabled={(date) =>
                         date > new Date("2026-12-31") || // ← current year limit example
                         date < new Date("2020-01-01")
                       }
                     />
                   </PopoverContent>
                 </Popover>

                 {/* Small verse preview */}
                 {verseText && (
                   <p className="text-xs text-muted-foreground italic mt-1.5 pl-1">
                     {t.dailyVerse.refPrefix}{" "}
                     <strong>
                       {book} {chapter}:{verseNumber}
                     </strong>
                   </p>
                 )}
               </div>

              {/* Explanation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  {t.dailyVerse.explanation} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={t.dailyVerse.explanationPlaceholder}
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>

               {/* Learn More */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Lightbulb className="h-4 w-4 text-muted-foreground" />
                   {t.dailyVerse.learnMore} <span className="text-muted-foreground text-xs">{t.dailyVerse.learnMoreOptional}</span>
                 </Label>
                 <Textarea
                   value={learnMore}
                   onChange={(e) => setLearnMore(e.target.value)}
                   placeholder={t.dailyVerse.learnMorePlaceholder}
                   rows={4}
                   className="resize-none"
                 />
               </div>

               {/* Published Toggle */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Save className="h-4 w-4 text-muted-foreground" />
                   {t.dailyVerse.publishedLabel} <span className="text-muted-foreground text-xs">{t.dailyVerse.publishedDesc}</span>
                 </Label>
                 <div className="flex items-center gap-2">
                   <input
                     type="checkbox"
                     checked={published}
                     onChange={(e) => setPublished(e.target.checked)}
                     className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                   />
                 </div>
               </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4 pt-6 border-t">
                <Button type="button" variant="ghost" asChild>
                  <Link to="/daily-verse">{t.common.cancel}</Link>
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
                  disabled={!verseText.trim() || !explanation.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t.dailyVerse.saveDailyVerse}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={conflictDialog.open} onOpenChange={(open) => !open && setConflictDialog({ open: false, conflict: null, payload: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t.dailyVerse.verseAlreadyExists}
            </DialogTitle>
            <DialogDescription>
              {(() => {
                const refStr = conflictDialog.conflict?.existing?.bookName
                  ? `${conflictDialog.conflict.existing.bookName} ${conflictDialog.conflict.existing.chapter}:${conflictDialog.conflict.existing.verseNumber}`
                  : '';
                return conflictDialog.conflict?.type === 'date'
                  ? t.dailyVerse.verseConflictForDate.replace('{ref}', refStr)
                  : t.dailyVerse.verseConflictForVerse.replace('{ref}', refStr).replace('{date}', conflictDialog.conflict?.existing?.displayDate || '');
              })()} {t.dailyVerse.verseConflictUpdatePrompt}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConflictDialog({ open: false, conflict: null, payload: null })}>
              {t.common.cancel}
            </Button>
            <Button variant="outline" onClick={() => { setConflictDialog({ open: false, conflict: null, payload: null }); navigate(routes.dailyVerse.path); }}>
              <BookOpen className="h-4 w-4 mr-2" />
              {t.dailyVerse.viewExisting}
            </Button>
            <Button onClick={handleConflictUpdate}>
              <Save className="h-4 w-4 mr-2" />
              {t.dailyVerse.updateExisting}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddDailyVerse;
