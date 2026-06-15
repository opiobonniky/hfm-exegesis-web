import { useEffect, useRef, useState } from "react";
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
  Quote,
  Clock,
  BookText,
} from "lucide-react";
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
};

// ── Main component ────────────────────────────────────────────────────────────

export default function UserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

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

  const versionInfo = dailyVerse?.bibleVersion
    ? BIBLE_VERSIONS.find((v) => v.id === dailyVerse.bibleVersion)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md space-y-6">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-64 rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!dailyVerse) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary/60" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {t.dailyVerse?.noVersesYet || 'No verse yet'}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {t.dailyVerse?.pageSubtitle || 'Check back later for today\'s inspirational verse.'}
          </p>
          <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {refreshing ? t.common?.loading || "Loading..." : (t.dailyVerse?.todaysVerse || "Check for Today's Verse")}
          </Button>
        </div>
      </div>
    );
  }

  const resourceCards: {
    key: string;
    icon: React.ElementType;
    title: string;
    color: string;
    content: string;
  }[] = [];
  if (dailyVerse.reflection) resourceCards.push({ key: 'reflection', icon: BookMarked, title: t.journal?.gratitude || 'Reflection', color: '#8B5CF6', content: dailyVerse.reflection });
  if (dailyVerse.explanation) resourceCards.push({ key: 'explanation', icon: Lightbulb, title: t.verseExplanations?.explanation || 'Explanation', color: '#3B82F6', content: dailyVerse.explanation });
  if (dailyVerse.learnMore) resourceCards.push({ key: 'learnMore', icon: GraduationCap, title: t.dailyVerse?.learnMore || 'Learn More', color: '#10B981', content: dailyVerse.learnMore });

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Sticky header */}
      <div
        className={cn(
          "sticky top-0 z-10 transition-all duration-200",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium text-foreground truncate">
              {scrolled ? verseReference : getGreetingHeader()}
            </h1>
            <div className="flex items-center gap-2">
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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.history.back()}>
                <ChevronLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={(e) => setScrolled((e.target as HTMLElement).scrollTop > 40)}
      >
        {/* Hero verse section - full width */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
          <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="max-w-4xl mx-auto">
              {/* Date + version */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{getFormattedDate(dailyVerse.displayDate)}</span>
                </div>
                {versionInfo && (
                  <Badge variant="outline" className="text-[10px] font-medium ml-auto">
                    {versionInfo.abbreviation}
                  </Badge>
                )}
              </div>

              {/* Verse */}
              <div className="relative">
                <div className="absolute -top-4 -left-2 text-7xl sm:text-8xl text-primary/[0.06] font-serif leading-none select-none pointer-events-none">
                  "
                </div>
                <blockquote className="relative text-xl sm:text-2xl lg:text-3xl font-serif leading-relaxed sm:leading-relaxed lg:leading-relaxed text-foreground/90 italic pl-2 sm:pl-4">
                  {verseText ||
                    dailyVerse.reflection ||
                    "The Lord is my shepherd, I shall not want."}
                </blockquote>
                <div className="text-7xl sm:text-8xl text-primary/[0.06] font-serif leading-none text-right -mt-4 sm:-mt-6 select-none pointer-events-none">
                  "
                </div>
              </div>

              {/* Reference + actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-border/30">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <span className="text-base sm:text-lg font-semibold text-primary">
                    {verseReference}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ActionChip
                    icon={Heart}
                    label={liked ? (t.common?.like || "Liked") : (t.dailyVerse?.like || "Like")}
                    active={liked}
                    onClick={() => {
                      setLiked(!liked);
                      toast({
                        title: liked ? (t.dailyVerse?.toastLikeRemoved || 'Like removed') : (t.dailyVerse?.toastVerseLiked || 'Verse liked!'),
                        description: liked ? "" : (t.dailyVerse?.toastAddedToFavorites || '{ref} added to your favorites.').replace('{ref}', verseReference),
                      });
                    }}
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
                  />
                  <ActionChip
                    icon={Copy}
                    label={t.common?.copy || "Copy"}
                    onClick={() => {
                      navigator.clipboard.writeText(`${verseText} — ${verseReference}`);
                      toast({
                        title: t.dailyVerse?.toastCopied || "Copied!",
                        description: t.dailyVerse?.toastVerseCopied || "Verse copied to clipboard.",
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resource cards - full width grid */}
        {resourceCards.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
            <div className="max-w-4xl mx-auto">
              <div
                className={cn(
                  "grid gap-5",
                  resourceCards.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
                  resourceCards.length === 3 && "lg:grid-cols-3",
                )}
              >
                {resourceCards.map((card) => (
                  <ResourceCard
                    key={card.key}
                    icon={card.icon}
                    title={card.title}
                    accentColor={card.color}
                  >
                    <ExpandableContent
                      content={card.content}
                      label={card.title.toUpperCase()}
                      icon={card.icon}
                      accentColor={card.color}
                    />
                  </ResourceCard>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl mx-auto text-center py-8 border-t border-border/20">
            <p className="text-sm text-muted-foreground italic mb-3">
              "Let God's Word guide your thoughts and actions today."
            </p>
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Take a moment to meditate on this verse</span>
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ActionChip({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  const [clicked, setClicked] = useState(false);
  return (
    <button
      onClick={() => {
        setClicked(true);
        setTimeout(() => setClicked(false), 300);
        onClick();
      }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:text-primary hover:bg-primary/10",
        clicked && "scale-90",
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 transition-all duration-200", clicked && "scale-125")} />
      {label}
    </button>
  );
}

function ExpandableContent({
  content,
  label,
  icon: Icon,
  accentColor,
}: {
  content: string;
  label: string;
  icon: React.ElementType;
  accentColor: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
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
          <Icon size={16} style={{ color: accentColor }} />
          <span className="text-[11px] font-bold tracking-wide uppercase opacity-85" style={{ color: accentColor }}>
            {label}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 px-2 text-[10px] hover:bg-muted/50">
          <Copy size={10} className="mr-1" />
          {copied ? (t.dailyVerse?.expandCopied || 'Copied!') : (t.dailyVerse?.expandCopy || 'Copy')}
        </Button>
      </div>
      <div className="space-y-2">
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
              <><ChevronUp size={12} />{(t.dailyVerse?.expandShowLess || 'Show less')}</>
            ) : (
              <><ChevronDown size={12} />{(t.dailyVerse?.expandContinueReading || 'Continue reading')}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  icon: Icon,
  title,
  accentColor,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}88)` }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accentColor}15` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
            {title}
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
