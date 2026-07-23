import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Feather,
  FileText,
  Heart,
  Layers,
  PenLine,
  RefreshCcw,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DailyExegesis {
  id: number;
  title: string;
  passageReference: string;
  introduction: string;
  contextSummary: string;
  teachingBody: string;
  application: string;
  prayer: string;
  tags: string;
  displayDate: string;
  createdOn: string;
  isPublished: boolean;
}

interface ExegesisListResponse {
  content: DailyExegesis[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isFirst: boolean;
  isLast: boolean;
}

// ── Fallback ───────────────────────────────────────────────────────────────────

const fallbackExegesis: DailyExegesis = {
  id: 0,
  title: "The Word That Leads Us Home",
  passageReference: "John 15:4-5",
  introduction:
    "Daily Exegesis will appear here once it is published by an administrator.",
  contextSummary:
    "This placeholder keeps the screen useful while content is being prepared.",
  teachingBody:
    "The Lordsbook Daily Exegesis is designed to give the reader a focused passage, a short explanation, and a clear path into prayer and application. It should remain concise enough for daily reading while still helping the user study faithfully.",
  application:
    "Read slowly, ask what the passage reveals about God, and write one faithful response in your journal.",
  prayer:
    "Lord, open my eyes to Your Word and teach me to abide faithfully today.",
  tags: "daily,exegesis,abide",
  displayDate: new Date().toISOString(),
  createdOn: new Date().toISOString(),
  isPublished: true,
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const parsePassage = (reference: string) => {
  const match = reference.match(/^(.+?)\s+(\d+)(?::(\d+))?/);
  if (!match) return null;
  return {
    bookName: match[1].trim(),
    chapter: Number(match[2]),
    verseNumber: match[3] ? Number(match[3]) : 1,
  };
};

const formatDisplayDate = (dateStr: string): string => {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const isCurrentOrFuture = (dateStr: string): boolean => {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d >= today;
  } catch {
    return false;
  }
};

// ── Sections ───────────────────────────────────────────────────────────────────

type SectionIcon = typeof Feather | typeof Layers | typeof FileText | typeof PenLine | typeof Heart;

const SECTION_CONFIG: {
  icon: SectionIcon;
  title: string;
  field: keyof Pick<DailyExegesis, "introduction" | "contextSummary" | "teachingBody" | "application" | "prayer">;
  required?: boolean;
}[] = [
  { icon: Feather, title: "Introduction", field: "introduction" },
  { icon: Layers, title: "Context Summary", field: "contextSummary" },
  { icon: FileText, title: "Teaching", field: "teachingBody", required: true },
  { icon: PenLine, title: "Application", field: "application" },
  { icon: Heart, title: "Prayer", field: "prayer" },
];

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DailyExegesisPage() {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exegesis, setExegesis] = useState<DailyExegesis | null>(null);
  const [series, setSeries] = useState<DailyExegesis[]>([]);

  const loadExegesis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayRes, listRes] = await Promise.all([
        sendPostRequest("bible", "get-todays-exegesis", {}),
        sendPostRequest("bible", "get-all-daily-exegesis", {
          page: 0,
          size: 10,
          smartDefault: true,
          futureDays: 30,
        }),
      ]);

      if (todayRes.returnCode === 200 && todayRes.returnData) {
        setExegesis(todayRes.returnData);
      } else {
        throw new Error(todayRes.returnMessage || "No exegesis available");
      }

      if (listRes.returnCode === 200 && listRes.returnData) {
        const data = listRes.returnData as ExegesisListResponse;
        const sorted = (data.content || []).sort(
          (a, b) =>
            new Date(a.displayDate).getTime() -
            new Date(b.displayDate).getTime(),
        );
        setSeries(sorted);
      }
    } catch (err: any) {
      setError(err?.message || "Daily exegesis is not available yet.");
      setExegesis(fallbackExegesis);
      setSeries([fallbackExegesis]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExegesis();
  }, [loadExegesis]);

  const item = exegesis ?? fallbackExegesis;
  const passage = parsePassage(item.passageReference);
  const displayDate = formatDisplayDate(item.displayDate);
  const isUpcoming = isCurrentOrFuture(item.displayDate);

  const openInBible = () => {
    if (!passage) return;
    navigate(`/bible-reader?book=${encodeURIComponent(passage.bookName)}&chapter=${passage.chapter}&verse=${passage.verseNumber}`);
  };

  const saveToLedger = () => {
    navigate(
      `/journal/new?title=${encodeURIComponent(item.title)}&reflection=${encodeURIComponent(
        [item.introduction, item.contextSummary, item.teachingBody].filter(Boolean).join("\n\n"),
      )}&prayer=${encodeURIComponent(item.prayer || "")}&application=${encodeURIComponent(item.application || "")}&tags=${encodeURIComponent(item.tags || "")}&passage=${encodeURIComponent(item.passageReference)}&source=daily-exegesis` +
        (passage ? `&book=${encodeURIComponent(passage.bookName)}&chapter=${passage.chapter}&verse=${passage.verseNumber}` : ""),
    );
  };

  // ── Loading ──
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col bg-background"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Header onBack={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">
              Preparing today's teaching...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header onBack={() => navigate(-1)} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 pb-16">
          {/* Error banner */}
          {error && (
            <button
              onClick={loadExegesis}
              className="w-full flex items-center gap-2 p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-500/15 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">{error}</span>
            </button>
          )}

          {/* Hero card */}
          <div className="rounded-2xl bg-card border border-border p-5 sm:p-6 mb-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-extrabold text-primary tracking-wide">
                {displayDate}
              </span>
              {isUpcoming && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold px-1.5 py-0 border-primary/30 text-primary ml-1"
                >
                  Upcoming
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-4">
              {item.title}
            </h1>

            <button
              onClick={openInBible}
              disabled={!passage}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-extrabold border transition-colors",
                passage
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15"
                  : "bg-muted border-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              <BookOpen className="w-3.5 h-3.5" />
              {item.passageReference}
            </button>
          </div>

          {/* Series navigation */}
          {series.length > 1 && (
            <div className="mb-4">
              <p className="text-xs font-black text-muted-foreground mb-2">
                Daily Exegesis Series
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {series.map((entry) => {
                  const active = entry.id === item.id;
                  return (
                    <button
                      key={entry.id}
                      onClick={() => setExegesis(entry)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition-all shrink-0",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:bg-muted",
                      )}
                    >
                      {entry.passageReference}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section cards */}
          <div className="space-y-2.5">
            {SECTION_CONFIG.map(({ icon: Icon, title, field, required }) => {
              const text = item[field];
              if (!text && !required) return null;
              return (
                <div
                  key={field}
                  className="rounded-xl bg-card border border-border p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-black text-foreground">
                      {title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-6 font-medium whitespace-pre-wrap">
                    {text || "No content added yet."}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5 mt-6">
            <Button
              onClick={openInBible}
              disabled={!passage}
              className="w-full gap-2 h-11"
            >
              <BookOpen className="w-4 h-4" />
              Open in Bible
            </Button>
            <Button
              variant="outline"
              onClick={saveToLedger}
              className="w-full gap-2 h-11"
            >
              <PenLine className="w-4 h-4" />
              Save to Ledger
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-border/30">
            <Sparkles className="w-3 h-3 text-accent/50" />
            <span className="text-[10px] text-muted-foreground/40 font-medium">
              Lordsbook Daily Exegesis
            </span>
            <Sparkles className="w-3 h-3 text-accent/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Header Sub-component ───────────────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
  const { t, isRtl } = useLanguage();

  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1
              className="text-base sm:text-lg font-semibold tracking-wide text-foreground leading-none"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {t.dailyExegesis?.title || "Daily Exegesis"}
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
              {t.dailyExegesis?.subtitle || "Lordsbook teaching"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
