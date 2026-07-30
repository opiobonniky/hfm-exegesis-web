import { useEffect, useState } from "react";
import { Calendar, Heart, Share2, RefreshCw, BookOpen, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { cn } from "@/lib/utils";

interface DailyDevotion {
  id: number;
  title: string;
  content: string;
  bookName: string | null;
  chapter: number | null;
  verseNumber: number | null;
  displayDate: string | object;
  displayTime?: string | null;
  createdBy: string;
  createdOn: string | object;
  isPublished: boolean;
}

const parseDisplayDate = (displayDate: string | object): string => {
  if (!displayDate) return new Date().toISOString();
  if (typeof displayDate === "string") return displayDate;
  try {
    const obj = displayDate as { seconds?: number; _seconds?: number };
    if (obj.seconds) return new Date(obj.seconds * 1000).toISOString();
    if (obj._seconds) return new Date(obj._seconds * 1000).toISOString();
  } catch {
    return new Date().toISOString();
  }
  return new Date().toISOString();
};

const getFormattedDate = (dateString: string | object): string => {
  try {
    const d = new Date(parseDisplayDate(dateString));
    return d.toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
  }
};

export default function UserDevotions() {
  const { t, isRtl } = useLanguage();
  const [devotion, setDevotion] = useState<DailyDevotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  const fetchTodaysDevotion = async () => {
    try {
      setLoading(true);
      const response = await sendPostRequest("bible", "get-todays-devotion", {});
      const { returnData, returnCode, returnMessage } = response;

      if (returnCode === 200 && returnData) {
        setDevotion(returnData as DailyDevotion);
      } else if (returnCode === 404) {
        setDevotion(null);
      } else {
        toast({
          title: t.devotions?.toastError || "Error",
          description: returnMessage || (t.devotions?.toastFailedToLoad || "Failed to load today's devotion."),
          variant: "destructive",
        });
        setDevotion(null);
      }
    } catch {
      toast({
        title: t.devotions?.toastError || "Error",
        description: t.devotions?.toastFailedToLoadDesc || "Unable to load today's devotion. Please try again.",
        variant: "destructive",
      });
      setDevotion(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTodaysDevotion();
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodaysDevotion();
    toast({
      title: t.devotions?.toastRefreshed || "Refreshed",
      description: t.devotions?.toastRefreshDesc || "Today's devotion updated.",
    });
  };

  const handleShare = () => {
    if (!devotion) return;
    const text = `${devotion.title}\n\n${devotion.content}\n\n${devotion.bookName ? `${devotion.bookName} ${devotion.chapter}:${devotion.verseNumber}` : ""}`;
    if (navigator.share) {
      navigator.share({ text, title: devotion.title });
    } else {
      navigator.clipboard.writeText(text);
      toast({
        title: t.devotions?.toastCopied || "Copied!",
        description: t.devotions?.toastCopiedDesc || "Devotion copied to clipboard.",
      });
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked
        ? (t.devotions?.toastLikeRemoved || "Like removed")
        : (t.devotions?.toastDevotionLiked || "Devotion liked!"),
      description: "",
    });
  };

  if (loading && !devotion) {
    return (
      <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!devotion) {
    return (
      <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {t.devotions?.noDevotionsYet || "No devotion today"}
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            {t.devotions?.pageSubtitle || "Check back later for today's inspiration."}
          </p>

          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "Let the morning bring me word of your unfailing love, for I have put my hope in your word."
            </p>
            <p className="text-xs text-muted-foreground/60 mt-4">— Psalm 119:147</p>
          </div>

          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="gap-2">
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? t.common?.loading || "Loading..." : t.common?.refresh || "Refresh"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1 -ml-1 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className={cn("w-5 h-5 text-foreground/70", isRtl && "rotate-180")} />
            </button>
            <h1 className="text-sm font-semibold text-foreground">Daily Devotion</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4 text-foreground/60", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {getFormattedDate(devotion.displayDate)}
          </div>

          {/* Devotion Card */}
          <article>
            <h2 className="text-2xl font-bold text-foreground leading-snug mb-6">
              {devotion.title}
            </h2>

            <div
              className="text-base text-foreground/85 leading-relaxed space-y-4"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {devotion.content.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </article>

          {/* Scripture Reference */}
          {devotion.bookName && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-0.5 h-8 bg-foreground/20 rounded-full" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                    Scripture
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {devotion.bookName} {devotion.chapter}:{devotion.verseNumber}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleLike}
              className={cn(
                "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                liked
                  ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
            >
              <Heart className={cn("w-4 h-4", liked && "fill-current")} />
              {liked ? "Liked" : "Like"}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground/60 italic">
              "Let the Word of Christ dwell in you richly."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
