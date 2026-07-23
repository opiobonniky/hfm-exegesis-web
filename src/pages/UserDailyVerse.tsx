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

function parseDisplayDate(d: string | object): string {
  if (!d) return new Date().toISOString();
  if (typeof d === "string") return d;
  try {
    const o = d as { seconds?: number; _seconds?: number };
    if (o.seconds) return new Date(o.seconds * 1000).toISOString();
    if (o._seconds) return new Date(o._seconds * 1000).toISOString();
  } catch {}
  return new Date().toISOString();
}

const fmtDate = (v: string | object) => {
  try {
    return new Date(parseDisplayDate(v)).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
  }
};

const isToday = (v: string | object) => {
  if (!v) return false;
  try {
    return new Date(parseDisplayDate(v)).toDateString() === new Date().toDateString();
  } catch { return false; }
};

export default function UserDailyVerse() {
  const { t, isRtl } = useLanguage();
  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [liked, setLiked] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await sendPostRequest("bible", "get-todays-verse", {});
        if (r.returnCode === 200 && r.returnData) {
          if (r.returnData.bibleVersion) setActiveVersion(r.returnData.bibleVersion);
          setVerse({ ...r.returnData, verseText: getVerseText(r.returnData.bookName, r.returnData.chapter, r.returnData.verseNumber) });
        } else if (r.returnCode !== 404) {
          toast({ title: 'Error', description: r.returnMessage || 'Failed to load.', variant: "destructive" });
        }
      } catch {
        toast({ title: 'Error', description: 'Unable to load.', variant: "destructive" });
      } finally { setLoading(false); setRefreshing(false); }
    })();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const r = await sendPostRequest("bible", "get-todays-verse", {});
      if (r.returnCode === 200 && r.returnData) {
        if (r.returnData.bibleVersion) setActiveVersion(r.returnData.bibleVersion);
        setVerse({ ...r.returnData, verseText: getVerseText(r.returnData.bookName, r.returnData.chapter, r.returnData.verseNumber) });
        toast({ title: 'Refreshed', description: 'Updated.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Failed.', variant: "destructive" });
    } finally { setRefreshing(false); }
  };

  const text = verse ? (getVerseText(verse.bookName, verse.chapter, verse.verseNumber) || "") : "";
  const ref = verse ? `${verse.bookName} ${verse.chapter}:${verse.verseNumber}` : "";
  const verInfo = verse?.bibleVersion ? BIBLE_VERSIONS.find(v => v.id === verse.bibleVersion) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-sm space-y-5">
            <Skeleton className="h-5 w-32 mx-auto" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-3 w-full" /> <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-32 rounded-xl" /> <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="min-h-screen flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary/60" />
            </div>
            <h2 className="text-xl font-bold mb-1.5">{t.dailyVerse?.noVersesYet || 'No verse yet'}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.dailyVerse?.pageSubtitle || 'Check back later.'}</p>
            <Button onClick={refresh} disabled={refreshing} size="sm" className="gap-1.5">
              <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
              {refreshing ? "Loading..." : (t.dailyVerse?.todaysVerse || "Check for Today's Verse")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasExplanation = !!verse.explanation;
  const hasLearnMore = !!verse.learnMore;
  const hasReflection = !!verse.reflection;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/10" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        scrolled ? "bg-background/90 backdrop-blur-lg border-b border-border/30 shadow-xs" : "bg-transparent",
      )}>
        <div className="px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground truncate">{scrolled ? ref : "Daily Verse"}</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(
              "text-[10px] font-medium px-2 py-0",
              isToday(verse.displayDate) ? "border-primary/30 text-primary bg-primary/[0.04]" : "",
            )}>
              {isToday(verse.displayDate) ? "Today" : (t.dailyVerse?.badgePast || "Past")}
            </Badge>
            <Button variant="ghost" size="icon" className="relative h-7 w-7 before:absolute before:content-[''] before:-inset-2 before:rounded-lg [touch-action:manipulation]" onClick={() => window.history.back()}>
              <ChevronLeft className={cn("w-4 h-4", isRtl && "rotate-180")} />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto" onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 30)}>
        <div className="px-5 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
          <div className="max-w-3xl mx-auto space-y-10 sm:space-y-14">

            {/* ── Verse intro ── */}
            <section>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-5">
                <Calendar className="w-3 h-3" />
                <span>{fmtDate(verse.displayDate)}</span>
                {verInfo && <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">{verInfo.abbreviation}</span>}
              </div>

              <div className="relative">
                <div className="text-5xl sm:text-6xl text-primary/[0.06] font-serif leading-none mb-2 select-none pointer-events-none">"</div>
                <blockquote className="relative text-xl sm:text-2xl lg:text-3xl font-serif leading-relaxed text-foreground/90 -mt-5 pl-2 sm:pl-3">
                  {text || verse.reflection}
                </blockquote>
                <div className="text-5xl sm:text-6xl text-primary/[0.06] font-serif leading-none text-right -mt-3 select-none pointer-events-none">"</div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-4 rounded-full bg-primary/60" />
                  <span className="text-sm font-semibold text-primary">{ref}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setLiked(!liked)} className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                    liked ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                    "[touch-action:manipulation]")}>
                    <Heart className={cn("w-3.5 h-3.5", liked && "fill-primary text-primary scale-110")} />
                    {liked ? "Liked" : "Like"}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(`${text} — ${ref}`); toast({ title: 'Copied!' }); }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all [touch-action:manipulation]">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
              </div>
            </section>

            {/* ── Explanation (hero content) ── */}
            {hasExplanation && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{t.verseExplanations?.explanation || 'Explanation'}</h2>
                    <p className="text-[11px] text-muted-foreground/50">A deeper look at this verse</p>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-blue-50/40 to-white dark:from-blue-950/10 dark:to-background rounded-2xl border border-blue-100/50 dark:border-blue-900/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-300/40" />
                  <div className="p-6 sm:p-8">
                    <RenderContent text={verse.explanation!} />
                  </div>
                </div>
              </section>
            )}

            {/* ── Learn More ── */}
            {hasLearnMore && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{t.dailyVerse?.learnMore || 'Learn More'}</h2>
                    <p className="text-[11px] text-muted-foreground/50">Additional context and study material</p>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/10 dark:to-background rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-300/40" />
                  <div className="p-6 sm:p-8">
                    <RenderContent text={verse.learnMore!} />
                  </div>
                </div>
              </section>
            )}

            {/* ── Reflection (secondary) ── */}
            {hasReflection && (
              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <BookMarked className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{t.journal?.gratitude || 'Reflection'}</h2>
                    <p className="text-[11px] text-muted-foreground/50">A personal reflection on this verse</p>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-purple-50/40 to-white dark:from-purple-950/10 dark:to-background rounded-2xl border border-purple-100/50 dark:border-purple-900/20 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-300/40" />
                  <div className="p-6 sm:p-8">
                    <RenderContent text={verse.reflection} />
                  </div>
                </div>
              </section>
            )}

            {/* ── Footer ── */}
            <section className="text-center pt-6 border-t border-border/10">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-accent/60" />
                <span className="text-[10px] text-muted-foreground/40">Let this verse guide your day</span>
                <Sparkles className="w-3 h-3 text-accent/60" />
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rich content renderer ─────────────────────────────────────────────────────

function RenderContent({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).filter(Boolean);
  const truncate = blocks.length > 3;
  const visible = expanded ? blocks : blocks.slice(0, 3);
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      {visible.map((block, i) => {
        const lines = block.split("\n").map(s => s.trim()).filter(Boolean);
        const isBullets = lines.some(l => /^(\-|\*|•|\d+\.)\s+/.test(l));

        if (isBullets) {
          return (
            <div key={i} className="space-y-2">
              {lines.map((line, j) => {
                const bullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
                if (bullet) {
                  return (
                    <div key={j} className="flex gap-2.5 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-foreground/20 mt-2 shrink-0" />
                      <span className="text-sm sm:text-base text-foreground/80 leading-relaxed">{line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}</span>
                    </div>
                  );
                }
                return <p key={j} className="text-sm sm:text-base text-foreground/80 leading-relaxed">{line}</p>;
              })}
            </div>
          );
        }

        return (
          <div key={i} className="space-y-3">
            {lines.length === 1 ? (
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed">{lines[0]}</p>
            ) : (
              lines.map((line, j) => (
                <p key={j} className="text-sm sm:text-base text-foreground/80 leading-relaxed">{line}</p>
              ))
            )}
          </div>
        );
      })}

      {truncate && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" />{t.dailyVerse?.expandShowLess || 'Show less'}</>
          ) : (
            <><ChevronDown className="w-4 h-4" />{t.dailyVerse?.expandContinueReading || 'Continue reading'}</>
          )}
        </button>
      )}
    </div>
  );
}
