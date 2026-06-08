import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  Calendar,
  Lightbulb,
  GraduationCap,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Copy,
  Share2,
  Heart,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { getVerseText, setActiveVersion } from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";
import { cn } from "@/lib/utils";

interface DailyVerse {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  bibleVersion?: string;
  displayDate: string | object;
  displayTime?: string | null;
  reflection?: string | null;
  explanation?: string | null;
  learnMore?: string | null;
  createdBy: string;
  createdOn: string | object;
  updatedBy?: string;
  updatedOn?: string | object;
  isPublished: boolean;
  verseText?: string;
}

function parseDisplayDate(displayDate: string | object): string {
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
}

const getGreetingHeader = () => {
  const hour = new Date().getHours();
  let greeting: string;
  let icon: string;

  if (hour < 5) {
    greeting = "Good evening";
    icon = "🌙";
  } else if (hour < 12) {
    greeting = "Good morning";
    icon = "☀️";
  } else if (hour < 17) {
    greeting = "Good afternoon";
    icon = "🌤️";
  } else {
    greeting = "Good evening";
    icon = "🌅";
  }

  const time = new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${greeting} ${icon} · ${time}`;
};

const getFormattedDate = (dateVal: string | object): string => {
  try {
    const d = new Date(parseDisplayDate(dateVal));
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

const isToday = (dateString: string | object): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(parseDisplayDate(dateString));
    const today = new Date();
    return date.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};const ExpandableContent = ({
  content,
  label,
  icon: Icon,
  accentColor,
}: {
  content: string;
  label: string;
  icon: React.ElementType;
  accentColor: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t, isRtl } = useLanguage();
  const lines = content.split("\n").filter((p) => p.trim());
  const shouldTruncate = lines.length > 4;
  const visibleLines = expanded ? lines : lines.slice(0, 4);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color: accentColor }} />
          <span
            className="text-xs font-bold tracking-wide uppercase opacity-85"
            style={{ color: accentColor }}
          >
            {label}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs hover:bg-muted/50"
        >
          <Copy size={12} className="mr-1" />
          {copied ? (t.dailyVerse?.expandCopied || 'Copied!') : (t.dailyVerse?.expandCopy || 'Copy')}
        </Button>
      </div>
      <div className="space-y-2 pl-6">
        {visibleLines.map((line, idx) => (
          <p key={idx} className="text-sm leading-relaxed text-muted-foreground">
            {line}
          </p>
        ))}
        {shouldTruncate && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1.5 mt-2 px-2 py-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: accentColor }}
          >
            {expanded ? (
              <>
                <ChevronUp size={12} />
                {(t.dailyVerse?.expandShowLess || 'Show less')}
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                {(t.dailyVerse?.expandContinueReading || 'Continue reading')}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Micro-components ──────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export default function UserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        const response = await sendPostRequest("bible", "get-todays-verse", {});
        const { returnData, returnCode, returnMessage } = response;

        if (returnCode === 200 && returnData) {
          if (returnData.bibleVersion) {
            setActiveVersion(returnData.bibleVersion);
          }
          const verseText = getVerseText(
            returnData.bookName,
            returnData.chapter,
            returnData.verseNumber,
          );
          setDailyVerse({ ...returnData, verseText });
        } else if (returnCode === 404) {
          setDailyVerse(null);
        } else {
          toast({
            title: t.dailyVerse?.toastErrorTitle || 'Error',
            description: returnMessage || (t.dailyVerse?.failedToFetch || 'Failed to load today\'s verse.'),
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: t.dailyVerse?.toastErrorTitle || 'Error',
          description: t.dailyVerse?.toastLoadError || 'Unable to load today\'s verse. Please try again.',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDailyVerse();
  }, [toast]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await sendPostRequest("bible", "get-todays-verse", {});
      const { returnData, returnCode, returnMessage } = response;

      if (returnCode === 200 && returnData) {
        if (returnData.bibleVersion) {
          setActiveVersion(returnData.bibleVersion);
        }
        const verseText = getVerseText(
          returnData.bookName,
          returnData.chapter,
          returnData.verseNumber,
        );
        setDailyVerse({ ...returnData, verseText });
        toast({
          title: t.dailyVerse?.toastRefreshed || 'Refreshed',
          description: t.dailyVerse?.toastRefreshDesc || 'Today\'s verse updated.',
        });
      }
    } catch {
      toast({
        title: t.dailyVerse?.toastErrorTitle || 'Error',
        description: t.dailyVerse?.toastRefreshFailed || 'Failed to refresh. Please try again.',
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const verseText = dailyVerse
    ? getVerseText(
        dailyVerse.bookName,
        dailyVerse.chapter,
        dailyVerse.verseNumber,
      ) || ""
    : "";

  const verseReference = dailyVerse
    ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verseNumber}`
    : "";

  const headerTitle = scrollOffset > 50 ? verseReference : getGreetingHeader();

  // Version badge info
  const versionInfo = dailyVerse?.bibleVersion
    ? BIBLE_VERSIONS.find((v) => v.id === dailyVerse.bibleVersion)
    : null;

  if (loading) {
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
            <Skeleton className="h-[200px] rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyVerse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6 lg:p-8" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium mb-4">
              <Calendar className="w-3 h-3" />
              {t.dailyVerse?.dailyVerse || 'Daily Verse'}
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-foreground mb-2">
              {t.dailyVerse?.noVersesYet || 'No verse yet'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {t.dailyVerse?.pageSubtitle || 'Check back later for today\'s inspirational verse. New verses are added daily.'}
            </p>
          </div>

          {/* Illustration card */}
          <Card className="border-0 bg-gradient-to-br from-primary/5 to-accent/5 shadow-lg">
            <CardContent className="py-16 px-6">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-primary/60" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                "Your word is a lamp to my feet and a light to my path."
              </p>
              <p className="text-muted-foreground/60 text-xs mt-4">
                — Psalm 119:105
              </p>
            </CardContent>
          </Card>

          {/* Refresh CTA */}
          <div className="mt-8">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw
                className={cn("w-4 h-4", refreshing && "animate-spin")}
              />
              {refreshing ? t.common?.loading || "Loading..." : (t.dailyVerse?.todaysVerse || "Check for Today's Verse")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Floating header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium text-foreground truncate">
              {headerTitle}
            </h1>
            <div className="flex items-center gap-1">
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] font-semibold",
                  isToday(dailyVerse.displayDate)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted",
                )}
              >
                {isToday(dailyVerse.displayDate) ? (
                  <Sparkles className="w-3 h-3 mr-1 text-accent" />
                ) : null}
                {isToday(dailyVerse.displayDate) ? (t.dailyVerse?.todayBadge || "Today") : (t.dailyVerse?.badgePast || "Past")}
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

      {/* Main content */}
      <div
        className="flex-1 overflow-y-auto"
        onScroll={(e) =>
          setScrollOffset((e.target as HTMLElement).scrollTop)
        }
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
          {/* Date badge */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getFormattedDate(dailyVerse.displayDate)}
            </span>
            {versionInfo && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] font-medium"
              >
                {versionInfo.abbreviation}
              </Badge>
            )}
          </div>

          {/* Verse card */}
          <Card className="relative overflow-hidden border-0 shadow-xl bg-card">
            {/* Accent gradient top */}
            <div className="h-[3px] bg-gradient-to-r from-primary via-primary/60 to-accent" />

            <CardContent className="p-8">
              {/* Verse number decoration */}
              <div className="absolute top-6 right-8 text-[120px] font-serif text-primary/4 leading-none select-none pointer-events-none">
                {dailyVerse.verseNumber}
              </div>

              <div className="relative">
                {/* Opening quote */}
                <div className="text-6xl text-primary/10 leading-none mb-2 font-serif">
                  "
                </div>

                <blockquote className="text-lg sm:text-xl font-serif leading-relaxed text-foreground/90 italic -mt-6 mb-4 pl-2">
                  {verseText ||
                    dailyVerse.reflection ||
                    "The Lord is my shepherd, I shall not want."}
                </blockquote>

                <div className="text-6xl text-primary/10 leading-none text-right -mt-4 mb-6 font-serif">
                  "
                </div>
              </div>

              {/* Reference + actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <span className="text-base font-semibold text-primary">
                    {verseReference}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ActionChip
                    icon={Heart}
                    label={liked ? t.common?.like || "Liked" : t.common?.like || "Like"}
                    disabled={false}
                    onClick={() => {
                      setLiked(!liked);
                      toast({
                        title: liked ? (t.dailyVerse?.toastLikeRemoved || 'Like removed') : (t.dailyVerse?.toastVerseLiked || 'Verse liked!'),
                        description: liked
                          ? ""
                          : (t.dailyVerse?.toastAddedToFavorites || '{ref} added to your favorites.').replace('{ref}', verseReference),
                      });
                    }}
                    disabled={false}
                  />
                  <ActionChip
                    icon={Share2}
                    label={t.common?.share || "Share"}
                    onClick={() => {
                      const text = `${verseText}\n— ${verseReference}`;
                      if (navigator.share) {
                        navigator.share({ text, title: verseReference });
                      } else {
                        navigator.clipboard.writeText(text);
                        toast({
                          title: t.dailyVerse?.toastCopied || 'Copied!',
                          description: t.dailyVerse?.toastVerseCopied || 'Verse copied to clipboard.',
                        });
                      }
                    }}
                    disabled={false}
                  />
                  <ActionChip
                    icon={Copy}
                    label={t.common?.copy || "Copy"}
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${verseText} — ${verseReference}`,
                      );                      toast({
                          title: t.dailyVerse?.toastCopied || "Copied!",
                          description: t.dailyVerse?.toastVerseCopied || "Verse copied to clipboard.",
                        });
                      }}
                    disabled={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reflection card */}
          {dailyVerse.reflection && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    {t.journal?.gratitude || 'Reflection'}
                  </span>
                </div>
                <div className="border-l-2 border-purple-200 pl-4">
                  <ExpandableContent
                    content={dailyVerse.reflection}
                    label="REFLECTION"
                    icon={BookMarked}
                    accentColor="#8B5CF6"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Explanation card */}
          {dailyVerse.explanation && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {t.verseExplanations?.explanation || 'Explanation'}
                  </span>
                </div>
                <div className="border-l-2 border-blue-200 pl-4">
                  <ExpandableContent
                    content={dailyVerse.explanation}
                    label="EXPLANATION"
                    icon={Lightbulb}
                    accentColor="#3B82F6"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learn More card */}
          {dailyVerse.learnMore && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    {t.dailyVerse?.learnMore || 'Learn More'}
                  </span>
                </div>
                <div className="border-l-2 border-emerald-200 pl-4">
                  <ExpandableContent
                    content={dailyVerse.learnMore}
                    label="LEARN MORE"
                    icon={GraduationCap}
                    accentColor="#10B981"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call-to-action */}
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-muted-foreground italic">
              "Let God's Word guide your thoughts and actions today."
            </p>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                Take a moment to meditate on this verse
              </span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}