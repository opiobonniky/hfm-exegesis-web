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
  Heart,
  Sparkles,
  RefreshCw,
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
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────

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
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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
  const navigate = useNavigate();
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
          toast({ title: "Error", description: r.returnMessage || "Failed to load.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Unable to load.", variant: "destructive" });
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
        toast({ title: "Refreshed", description: "Updated." });
      }
    } catch {
      toast({ title: "Error", description: "Failed.", variant: "destructive" });
    } finally { setRefreshing(false); }
  };

  const text = verse ? (getVerseText(verse.bookName, verse.chapter, verse.verseNumber) || "") : "";
  const ref = verse ? `${verse.bookName} ${verse.chapter}:${verse.verseNumber}` : "";
  const verInfo = verse?.bibleVersion ? BIBLE_VERSIONS.find(v => v.id === verse.bibleVersion) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
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
      <div className="min-h-screen flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary/60" />
            </div>
            <h2 className="text-xl font-bold mb-1.5">{t.dailyVerse?.noVersesYet || "No verse yet"}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.dailyVerse?.pageSubtitle || "Check back later."}</p>
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
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm",
        scrolled ? "shadow" : ""
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <h1 className="text-base font-semibold text-foreground">{t.dailyVerse?.dailyVerse || "Daily Verse"}</h1>
          <div />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto" ref={scrollRef} onScroll={e => setScrolled((e.target as HTMLElement).scrollTop > 30)}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Date & version */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{fmtDate(verse.displayDate)}</span>
            {verInfo && <span className="ml-auto font-mono text-xs text-muted-foreground/60">{verInfo.abbreviation}</span>}
            <Badge variant="outline" className="ml-2">{isToday(verse.displayDate) ? "Today" : (t.dailyVerse?.badgePast || "Past")}</Badge>
          </div>
          {/* Reference */}
          <h2 className="text-xl font-bold">{ref}</h2>
          {/* Verse text */}
          <blockquote className="text-2xl font-serif leading-relaxed text-foreground/90">{text}</blockquote>
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 gap-2" onClick={() => navigate(`/bible-reader?book=${verse.bookName}&chapter=${verse.chapter}&verse=${verse.verseNumber}`)}>
              <BookOpen className="w-4 h-4" />{t.dailyVerse?.openInBible || "Open in Bible"}
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={() => { navigator.clipboard.writeText(`${text} — ${ref}`); toast({ title: "Copied!" }); }}>
              <Copy className="w-4 h-4" />{t.dailyVerse?.copy || "Copy"}
            </Button>
            <Button variant="ghost" className="flex-1 gap-2" onClick={() => setLiked(!liked)}>
              <Heart className={cn("w-4 h-4", liked && "fill-primary text-primary")} />{liked ? "Liked" : "Like"}
            </Button>
          </div>
          {/* Explanation */}
          {hasExplanation && (
            <section>
              <h3 className="text-sm font-bold mb-2">{t.verseExplanations?.explanation || "Explanation"}</h3>
              <RenderContent text={verse.explanation!} />
            </section>
          )}
          {/* Learn More */}
          {hasLearnMore && (
            <section>
              <h3 className="text-sm font-bold mb-2">{t.dailyVerse?.learnMore || "Learn More"}</h3>
              <RenderContent text={verse.learnMore!} />
            </section>
          )}
          {/* Reflection */}
          {hasReflection && (
            <section>
              <h3 className="text-sm font-bold mb-2">{t.journal?.gratitude || "Reflection"}</h3>
              <RenderContent text={verse.reflection!} />
            </section>
          )}
          {/* Footer */}
          <section className="text-center pt-6 border-t border-border/10">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3 text-accent/60" />
              <span className="text-xs text-muted-foreground/40">{t.dailyVerse?.footer || "Let this verse guide your day"}</span>
              <Sparkles className="w-3 h-3 text-accent/60" />
            </div>
          </section>
        </div>
      </main>
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
                      <span className="text-sm text-foreground/80 leading-relaxed">{line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}</span>
                    </div>
                  );
                }
                return <p key={j} className="text-sm text-foreground/80 leading-relaxed">{line}</p>;
              })}
            </div>
          );
        }
        return (
          <div key={i} className="space-y-3">
            {lines.map((line, j) => (
              <p key={j} className="text-sm text-foreground/80 leading-relaxed">{line}</p>
            ))}
          </div>
        );
      })}
      {truncate && (
        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="w-4 h-4" />{t.dailyVerse?.expandShowLess || "Show less"}</>
          ) : (
            <><ChevronDown className="w-4 h-4" />{t.dailyVerse?.expandContinueReading || "Continue reading"}</>
          )}
        </button>
      )}
    </div>
  );
}
