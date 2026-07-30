import { useCallback, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ArrowLeft,
  RefreshCcw,
  Loader2,
  Sparkles,
  PenLine,
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
          (a, b) => new Date(a.displayDate).getTime() - new Date(b.displayDate).getTime()
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

  // ── Derived data ────────────────────────────────────────────────────────

  const item = exegesis ?? fallbackExegesis;
  const passage = useMemo(() => parsePassage(item.passageReference), [item.passageReference]);
  const displayDate = formatDisplayDate(item.displayDate);
  const isUpcoming = isCurrentOrFuture(item.displayDate);

  const openInBible = () => {
    if (!passage) return;
    navigate(
      `/bible-reader?book=${encodeURIComponent(passage.bookName)}&chapter=${passage.chapter}&verse=${passage.verseNumber}`
    );
  };

  const saveToLedger = () => {
    const params = new URLSearchParams({
      title: item.title,
      reflection: [item.introduction, item.contextSummary, item.teachingBody]
        .filter(Boolean)
        .join("\n\n"),
      prayer: item.prayer || "",
      application: item.application || "",
      tags: item.tags || "",
      passage: item.passageReference,
      source: "daily-exegesis",
      date: item.displayDate,
    });
    if (passage) {
      params.set("book", passage.bookName);
      params.set("chapter", String(passage.chapter));
      params.set("verse", String(passage.verseNumber));
    }
    navigate(`/journal/new?${params.toString()}`);
  };

  // ── Render helpers ─────────────────────────────────────────────────────

  const renderSections = () => (
    <div className="space-y-6 mt-6">
      {/* Introduction */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">Introduction</h2>
        <p className="whitespace-pre-wrap text-muted-foreground leading-6">
          {item.introduction || "No introduction provided."}
        </p>
      </section>
      {/* Context */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">Context Summary</h2>
        <p className="whitespace-pre-wrap text-muted-foreground leading-6">
          {item.contextSummary || "No context provided."}
        </p>
      </section>
      {/* Teaching */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">Teaching</h2>
        <p className="whitespace-pre-wrap text-muted-foreground leading-6">
          {item.teachingBody || "No teaching content provided."}
        </p>
      </section>
      {/* Application */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">Application</h2>
        <p className="whitespace-pre-wrap text-muted-foreground leading-6">
          {item.application || "No application provided."}
        </p>
      </section>
      {/* Prayer */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-foreground">Prayer</h2>
        <p className="whitespace-pre-wrap text-muted-foreground leading-6">
          {item.prayer || "No prayer provided."}
        </p>
      </section>
    </div>
  );

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <Header onBack={() => navigate(-1)} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Preparing today's teaching…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header onBack={() => navigate(-1)} />

      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-indigo-600 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{displayDate}</span>
            {isUpcoming && (
              <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 ml-2">
                Upcoming
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">{item.title}</h1>
          <Button
            variant="secondary"
            onClick={openInBible}
            disabled={!passage}
            className="w-max gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {item.passageReference}
          </Button>
        </div>
      </section>

      {/* Series navigation (carousel) */}
      {series.length > 1 && (
        <section className="bg-muted py-3">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex gap-2">
            {series.map((entry) => {
              const active = entry.id === item.id;
              return (
                <button
                  key={entry.id}
                  onClick={() => setExegesis(entry)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all shrink-0",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  )}
                >
                  {entry.passageReference}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Error banner */}
          {error && (
            <Button
              variant="outline"
              onClick={loadExegesis}
              className="w-full mb-4 flex items-center gap-2 justify-center"
            >
              <RefreshCcw className="w-4 h-4" />
              {error}
            </Button>
          )}

          {/* Tabs with sections */}
          {renderSections()}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              onClick={openInBible}
              disabled={!passage}
              className="flex-1 gap-2 h-11"
              aria-label="Open passage in Bible reader"
            >
              <BookOpen className="w-4 h-4" />
              Open in Bible
            </Button>
            <Button
              variant="outline"
              onClick={saveToLedger}
              className="flex-1 gap-2 h-11"
              aria-label="Save this exegesis to your journal"
            >
              <PenLine className="w-4 h-4" />
              Save to Journal
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-2 py-4 border-t border-border/30 text-xs text-muted-foreground/60">
        <Sparkles className="w-3 h-3 text-muted-foreground/40" />
        <span>Lordsbook Daily Exegesis</span>
        <Sparkles className="w-3 h-3 text-muted-foreground/40" />
      </footer>
    </div>
  );
}

// ── Header Sub‑component ───────────────────────────────────────────────────────

function Header({ onBack }: { onBack: () => void }) {
  const { t, isRtl } = useLanguage();

  return (
    <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-wide text-foreground" style={{ fontFamily: "'Cinzel', serif" }}>
            {t.dailyExegesis?.title || "Daily Exegesis"}
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            {t.dailyExegesis?.subtitle || "Lordsbook teaching"}
          </p>
        </div>
        {/* placeholder for potential right‑side actions */}
        <div className="w-8" />
      </div>
    </header>
  );
}
