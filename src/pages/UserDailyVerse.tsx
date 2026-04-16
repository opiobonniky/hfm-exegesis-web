import { useEffect, useState } from "react";
import { Sun, Heart, Share2, Loader2, BookOpen, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { getVerseText } from "@/utilities/bibleUtils";

interface DailyVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  displayDate: string;
  reflection: string;
  verseText?: string;
}

const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const isToday = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export default function UserDailyVerse() {
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        const response = await sendPostRequest("bible", "get-todays-verse", {});
        const { returnData, returnCode, returnMessage } = response;

        if (returnCode === 200 && returnData) {
          const verseText = getVerseText(
            returnData.bookName,
            returnData.chapter,
            returnData.verseNumber
          );
          setDailyVerse({ ...returnData, verseText });
        } else if (returnCode === 404) {
          setDailyVerse(null);
          toast({
            title: "No verse yet",
            description: "Check back later for today's verse.",
          });
        } else {
          toast({
            title: "Error",
            description: returnMessage || "Failed to load today's verse.",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Unable to load today's verse.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailyVerse();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading today's verse...</p>
        </div>
      </div>
    );
  }

  if (!dailyVerse) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
                Daily Verse
              </h1>
              <p className="text-muted-foreground">Start each day with God's Word</p>
            </div>
          </div>

          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="py-12 text-center">
              <Sun className="w-16 h-16 mx-auto mb-4 text-amber-400" />
              <h3 className="text-xl font-semibold mb-2">No verse available today</h3>
              <p className="text-muted-foreground">
                Check back later for today's inspirational verse.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-gradient-to-b from-amber-50/30 to-background">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sun className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
              Daily Verse
            </h1>
            <p className="text-muted-foreground">{getFormattedDate()}</p>
          </div>
        </div>

        {isToday(dailyVerse.displayDate) && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full w-fit">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Today's Verse</span>
          </div>
        )}

        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 via-white to-amber-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {dailyVerse.bookName} {dailyVerse.chapter}:{dailyVerse.verseNumber}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500 hover:bg-rose-50">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <blockquote className="text-2xl lg:text-3xl font-serif leading-relaxed text-foreground/90 italic pl-4 border-l-4 border-primary/30">
              "{dailyVerse.verseText || dailyVerse.reflection}"
            </blockquote>

            {dailyVerse.reflection && (
              <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl p-5 border border-amber-100 dark:border-amber-900/40">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Reflection
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  {dailyVerse.reflection}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Today's Verse
          </span>
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Come back tomorrow for a new verse!</p>
        </div>
      </div>
    </div>
  );
}