import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Calendar,
  Lightbulb,
  BookOpen,
  Sparkles,
  RefreshCw,
  Copy,
  Share2,
  Heart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const getGreetingHeader = (t: any) => {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour < 5) {
    greeting = t.userDashboard?.goodEvening || 'Good Evening';
  } else if (hour < 12) {
    greeting = t.userDashboard?.goodMorning || 'Good Morning';
  } else if (hour < 17) {
    greeting = t.userDashboard?.goodAfternoon || 'Good Afternoon';
  } else {
    greeting = t.userDashboard?.goodEvening || 'Good Evening';
  }

  const time = new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${greeting} · ${time}`;
};

const getFormattedDate = (dateString: string | object): string => {
  try {
    const d = new Date(parseDisplayDate(dateString));
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
};

const isTodayDate = (dateString: string | object): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(parseDisplayDate(dateString));
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

const ActionChip = ({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
      disabled
        ? "bg-muted text-muted-foreground cursor-not-allowed"
        : "bg-primary/10 text-primary hover:bg-primary/20 active:scale-95",
    )}
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </button>
);

export default function UserDevotions() {
  const { t, isRtl } = useLanguage();
  const [devotion, setDevotion] = useState<DailyDevotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
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
      } else {          toast({
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

  const headerTitle = scrollOffset > 50 
    ? (devotion ? devotion.title : (t.devotions?.todaysDevotion || "Today's Devotion")) 
    : getGreetingHeader(t);

  if (loading && !devotion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-lg space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full bg-primary/10" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-[200px] rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!devotion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-4">
              <Calendar className="w-3 h-3" />
              {t.devotions?.dailyDevotions || 'Daily Devotion'}
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">
              {t.devotions?.noDevotionsYet || 'No devotion today'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t.devotions?.pageSubtitle || 'Check back later for today\'s inspiration.'}
            </p>
          </div>

          <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
            <CardContent className="py-16 px-6">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-12 h-12 text-primary/60" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                "Let the morning bring me word of your unfailing love, for I have put my hope in your word."
              </p>
              <p className="text-muted-foreground/60 text-xs mt-4">
                — Psalm 119:147
              </p>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
              {refreshing ? t.common?.loading || "Loading..." : (t.common?.refresh || "Refresh")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium text-foreground truncate">
              {headerTitle}
            </h1>
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-semibold",
                  isTodayDate(devotion.displayDate)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted",
                )}
              >
                {isTodayDate(devotion.displayDate) ? (
                  <Sparkles className="w-3 h-3 mr-1 text-accent" />
                ) : null}
                {isTodayDate(devotion.displayDate) ? (t.devotions?.todayBadge || "Today") : (t.devotions?.pastBadge || "Past")}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        onScroll={(e) =>
          setScrollOffset((e.target as HTMLElement).scrollTop)
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getFormattedDate(devotion.displayDate)}
            </span>
          </div>

          <Card className="relative overflow-hidden border-0 shadow-xl bg-card">
            <div className="h-[3px] bg-gradient-to-r from-primary via-primary/60 to-accent" />
            <CardContent className="p-8">
              <div className="absolute top-6 right-8 text-[120px] font-serif text-primary/4 leading-none select-none pointer-events-none">
                ✦
              </div>

              <div className="relative">
                <div className="text-6xl text-primary/10 leading-none mb-2 font-serif">
                  "
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] leading-relaxed text-foreground mb-6">
                  {devotion.title}
                </h2>

                <div className="prose prose-stone dark:prose-invert max-w-none mb-6">
                  <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {devotion.content}
                  </p>
                </div>

                <div className="text-6xl text-primary/10 leading-none text-right -mt-4 mb-6 font-serif">
                  "
                </div>
              </div>

              {devotion.bookName && (
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full bg-primary" />
                    <span className="text-base font-semibold text-primary">
                      {devotion.bookName} {devotion.chapter}:{devotion.verseNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ActionChip
                      icon={Heart}
                      label={liked ? t.common?.like || "Liked" : t.common?.like || "Like"}
                      onClick={() => {
                        setLiked(!liked);
                        toast({
                          title: liked ? (t.devotions?.toastLikeRemoved || "Like removed") : (t.devotions?.toastDevotionLiked || "Devotion liked!"),
                          description: "",
                        });
                      }}
                    />
                    <ActionChip
                      icon={Share2}
                      label={t.common?.share || "Share"}
                      onClick={() => {
                        const text = `${devotion.title}\n\n${devotion.content}\n\n— Daily Devotion`;
                        if (navigator.share) {
                          navigator.share({ text, title: devotion.title });
                        } else {
                          navigator.clipboard.writeText(text);                            toast({
                            title: t.devotions?.toastCopied || "Copied!",
                            description: t.devotions?.toastCopiedDesc || "Devotion copied to clipboard.",
                          });
                        }
                      }}
                    />
                    <ActionChip
                      icon={Copy}
                      label={t.common?.copy || "Copy"}
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${devotion.title}\n\n${devotion.content}`,
                        );
                        toast({
                          title: t.devotions?.toastCopied || "Copied!",
                          description: t.devotions?.toastCopiedDesc || "Devotion copied to clipboard.",
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {devotion.bookName && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                    {t.devotions?.bibleReference || 'Bible Reference'}
                  </span>
                </div>
                <div className="border-l-2 border-amber-200 pl-4">
                  <p className="text-primary font-medium">
                    {devotion.bookName} {devotion.chapter}:{devotion.verseNumber}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground italic">
              "Let the Word of Christ dwell in you richly."
            </p>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                {t.devotions?.reflectOnThis || 'Reflect on this devotion today'}
              </span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}