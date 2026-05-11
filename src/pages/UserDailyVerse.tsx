import { useEffect, useState } from "react";
import {
  Sun,
  Loader2,
  BookOpen,
  ChevronLeft,
  Calendar,
  Lightbulb,
  GraduationCap,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { getVerseText, setActiveVersion } from "@/utilities/bibleUtils";
import { BIBLE_VERSIONS } from "@/assets/bibleVersion/json/bibleVersions";

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
  if (typeof displayDate === 'string') return displayDate;
  try {
    const obj = displayDate as { seconds?: number; _seconds?: number };
    if (obj.seconds) return new Date(obj.seconds * 1000).toISOString();
    if (obj._seconds) return new Date(obj._seconds * 1000).toISOString();
  } catch {
    return new Date().toISOString();
  }
  return new Date().toISOString();
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
  const lines = content.split('\n').filter(p => p.trim());
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
          <span className="text-xs font-bold tracking-wide uppercase opacity-85" style={{ color: accentColor }}>
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
          {copied ? 'Copied!' : 'Copy'}
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
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 mt-2 px-2 py-1 text-xs font-semibold hover:opacity-80 transition-opacity"
            style={{ color: accentColor }}
          >
            {expanded ? (
              <>
                <ChevronUp size={12} />
                Show less
              </>
            ) : (
              <>
                <ChevronDown size={12} />
                Continue reading
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const getGreetingHeader = () => {
  const hour = new Date().getHours();
  let greeting: string;
  let icon: string;

  if (hour < 5) {
    greeting = 'Good evening';
    icon = '🌙';
  } else if (hour < 12) {
    greeting = 'Good morning';
    icon = '☀️';
  } else if (hour < 17) {
    greeting = 'Good afternoon';
    icon = '🌤️';
  } else {
    greeting = 'Good evening';
    icon = '🌅';
  }

  const time = new Date().toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${greeting} ${icon} · ${time}`;
};

const getFormattedDate = (dateVal: string | object): string => {
  try {
    const d = new Date(parseDisplayDate(dateVal));
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
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

export default function UserDailyVerse() {
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDailyVerse = async () => {
      try {
        setLoading(true);
        const response = await sendPostRequest("bible", "get-todays-verse", {});
        const { returnData, returnCode, returnMessage } = response;

        if (returnCode === 200 && returnData) {
          // Set the active version to match the verse's Bible version
          if (returnData.bibleVersion) {
            setActiveVersion(returnData.bibleVersion);
          }
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

  const verseText = dailyVerse ? getVerseText(
    dailyVerse.bookName,
    dailyVerse.chapter,
    dailyVerse.verseNumber
  ) || '' : '';

  const verseReference = dailyVerse ? `${dailyVerse.bookName} ${dailyVerse.chapter}:${dailyVerse.verseNumber}` : '';
  const headerTitle = scrollOffset > 50 ? verseReference : getGreetingHeader();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Preparing today's verse...</p>
        </div>
      </div>
    );
  }

  if (!dailyVerse) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Daily Verse</h1>
                <p className="text-sm text-muted-foreground">Start each day with God's Word</p>
              </div>
            </div>
          </div>

          <Card className="border-amber-200 bg-amber-50/50 shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No verse available yet</h3>
              <p className="text-muted-foreground mb-4">
                Check back later for today's inspirational verse.
              </p>
              <p className="text-xs text-amber-600">
                New verses are added daily • Refresh to check again
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">{headerTitle}</h1>
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        onScroll={(e) => setScrollOffset((e.target as HTMLElement).scrollTop)}
      >
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-6 space-y-6">

          {/* Date Badge */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isToday(dailyVerse.displayDate) ? 'Today' : getFormattedDate(dailyVerse.displayDate)}
            </span>
          </div>

          {/* Main Verse Card */}
          <Card className="border-0 shadow-xl bg-white dark:bg-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary to-primary/80" />
            <CardContent className="p-8 pb-6">
              <div className="text-xs font-bold uppercase tracking-wider text-primary opacity-80 mb-4">
                Verse of the Day
              </div>

              <div className="relative">
                <div className="text-6xl text-primary/10 leading-none mb-2 font-serif">"</div>
                <blockquote className="text-xl lg:text-2xl font-serif leading-relaxed text-foreground/90 italic -mt-8 mb-4 px-4">
                  {verseText || dailyVerse.reflection || 'The Lord is my shepherd, I shall not want.'}
                </blockquote>
                <div className="text-6xl text-primary/10 leading-none text-right -mt-4 mb-4 font-serif">"</div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-lg font-semibold text-primary">
                      {verseReference}
                    </span>
                    {dailyVerse.bibleVersion && (
                      <div className="px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-xs font-medium text-primary">
                          {BIBLE_VERSIONS.find(v => v.id === dailyVerse.bibleVersion)?.abbreviation || dailyVerse.bibleVersion}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${verseText} — ${verseReference}`);
                      toast({ title: "Copied to clipboard", description: "Verse copied successfully." });
                    }}
                    className="h-8 px-3 text-xs hover:bg-muted/50"
                  >
                    <Copy size={14} className="mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reflection Card */}
          {dailyVerse.reflection && (
            <Card className="border-0 shadow-lg bg-white dark:bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookMarked className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-purple-600">
                    Reflection
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

          {/* Explanation Card */}
          {dailyVerse.explanation && (
            <Card className="border-0 shadow-lg bg-white dark:bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-blue-600">
                    Explanation
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

          {/* Learn More Card */}
          {dailyVerse.learnMore && (
            <Card className="border-0 shadow-lg bg-white dark:bg-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-bold uppercase tracking-wide text-emerald-600">
                    Learn More
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

          {/* Footer */}
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground italic">
              "Let God's word guide your thoughts and actions."
            </p>
            <p className="text-xs text-muted-foreground">
              Meditate on this verse today
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}