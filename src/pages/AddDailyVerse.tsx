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
import { routes } from "@/components/Routes/routes";
import { BIBLE_VERSIONS, getVersionById } from "@/assets/bibleVersion/json/bibleVersions";

const TESTAMENTS = [
  { value: "Old", label: "Old Testament" },
  { value: "New", label: "New Testament" },
];

const AddDailyVerse = () => {
  const { toast } = useToast();
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
        title: "Missing fields",
        description: "Please fill all required fields.",
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
          title: "Success",
          description:
            response.returnMessage || "Daily verse added successfully.",
        });
        setTimeout(() => {
          navigate(routes.dailyVerse.path);
        }, 2000);
      } else if (response.returnCode === 409) {
        setConflictDialog({ open: true, conflict: response.returnData?.conflicts?.[0], payload });
      } else {
        toast({
          title: "Error",
          description: response.returnMessage || "Failed to save verse.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An error occurred while saving.",
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
        toast({ title: "Updated", description: "Existing verse updated." });
        setTimeout(() => navigate(routes.dailyVerse.path), 2000);
      } else {
        toast({ title: "Error", description: response.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="fade-up flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={routes.dashboard.path}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
                <Sun className="h-7 w-7 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight font-heading text-gradient">
                  Add Daily Verse
                </h1>
                <p className="text-muted-foreground">
                  Choose a verse & reflection
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card className="fade-up stagger-1 border-border/40 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-6">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Verse Details
            </CardTitle>
            <CardDescription>
              Select verse, date/time and write your thoughts
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            <form onSubmit={handleAddVerse} className="space-y-7">
               {/* Testament - Book - Chapter - Verse - Version */}
               <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
                 <div className="space-y-2">
                   <Label>Testament</Label>
                   <Combobox
                     options={TESTAMENTS}
                     value={testament}
                     onChange={setTestament}
                     placeholder="Select testament"
                     width="w-full"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label>Book</Label>
                   <Combobox
                     options={books.map((b) => ({ value: b, label: b }))}
                     value={book}
                     onChange={setBook}
                     placeholder="Select book"
                     disabled={!testament}
                     width="w-full"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label>Chapter</Label>
                   <Combobox
                     options={chapters.map((c) => ({
                       value: String(c),
                       label: String(c),
                     }))}
                     value={chapter}
                     onChange={setChapter}
                     placeholder="Select chapter"
                     disabled={!book}
                     width="w-full"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label>Verse</Label>
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
                     placeholder="Select verse"
                     disabled={!chapter || maxVerses === 0}
                     width="w-full"
                   />
                 </div>

                 <div className="space-y-2">
                   <Label>Version</Label>
                   <Combobox
                     options={BIBLE_VERSIONS.map(v => ({
                       value: v.id,
                       label: `${v.name} (${v.abbreviation})`,
                     }))}
                     value={bibleVersion}
                     onChange={setBibleVersion}
                     placeholder="Select version"
                     width="w-full"
                   />
                 </div>
               </div>

                {/* Verse Text */}
                <div className="space-y-2">
                  <Label className="flex items-center justify-between">
                    <span>
                      Verse Text{" "}
                      <span className="text-xs text-muted-foreground ml-2">
                        {isVerseEditing ? '(editable)' : '(read only)'}
                      </span>
                      {bibleVersion && (
                        <span className="text-xs text-primary font-medium ml-2">
                          • {BIBLE_VERSIONS.find(v => v.id === bibleVersion)?.abbreviation || bibleVersion}
                        </span>
                      )}
                    </span>
                    {/* {!isVerseLoading && book && chapter && verseNumber && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsVerseEditing(!isVerseEditing)}
                      >
                        {isVerseEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    )} */}
                  </Label>
                  <div className="relative">
                    {isVerseEditing ? (
                      <Textarea
                        value={verseText}
                        onChange={(e) => setVerseText(e.target.value)}
                        className="min-h-[110px] resize-none font-serif leading-relaxed"
                        placeholder="Verse text (you can edit this)"
                      />
                    ) : (
                      <Textarea
                        value={verseText}
                        readOnly
                        className="min-h-[110px] resize-none font-serif leading-relaxed"
                        placeholder="Verse text (read only)"
                      />
                    )}
                    {book && chapter && verseNumber && (
                      <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                        Ref: {book} {chapter}:{verseNumber} ({BIBLE_VERSIONS.find(v => v.id === bibleVersion)?.abbreviation || bibleVersion})
                      </div>
                    )}
                  </div>
                </div>

               {/* Date Picker */}
               <div className="space-y-2">
                 <Label>Date</Label>
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
                     Selected:{" "}
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
                  Explanation <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain what this verse means and its significance..."
                  rows={5}
                  className="resize-none"
                  required
                />
              </div>

               {/* Learn More */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Lightbulb className="h-4 w-4 text-muted-foreground" />
                   Learn More <span className="text-muted-foreground text-xs">(optional)</span>
                 </Label>
                 <Textarea
                   value={learnMore}
                   onChange={(e) => setLearnMore(e.target.value)}
                   placeholder="Additional resources, related verses, or deeper insights..."
                   rows={4}
                   className="resize-none"
                 />
               </div>

               {/* Published Toggle */}
               <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                   <Save className="h-4 w-4 text-muted-foreground" />
                   Published <span className="text-muted-foreground text-xs">Show to all users</span>
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
                  <Link to="/daily-verse">Cancel</Link>
                </Button>

                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
                  disabled={!verseText.trim() || !explanation.trim()}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Daily Verse
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
              Verse Already Exists
            </DialogTitle>
            <DialogDescription>
              {conflictDialog.conflict?.type === 'date'
                ? `A verse already exists for this date (${conflictDialog.conflict?.existing?.bookName} ${conflictDialog.conflict?.existing?.chapter}:${conflictDialog.conflict?.existing?.verseNumber}).`
                : `This verse (${conflictDialog.conflict?.existing?.bookName} ${conflictDialog.conflict?.existing?.chapter}:${conflictDialog.conflict?.existing?.verseNumber}) already exists for ${conflictDialog.conflict?.existing?.displayDate}.`
              } Update the existing entry instead?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConflictDialog({ open: false, conflict: null, payload: null })}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => { setConflictDialog({ open: false, conflict: null, payload: null }); navigate(routes.dailyVerse.path); }}>
              <BookOpen className="h-4 w-4 mr-2" />
              View Existing
            </Button>
            <Button onClick={handleConflictUpdate}>
              <Save className="h-4 w-4 mr-2" />
              Update Existing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddDailyVerse;
