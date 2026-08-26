import { useMemo } from "react";
import { useDailyExegesisPage } from "../hooks/useDailyExegesisPage";
import { useNavigate } from "react-router-dom";
import { Loader2, PenLine, BookOpen, RefreshCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExegesisHero, ExegesisContent } from "../components";
import { ExegesisHeader } from "../components/ExegesisHeader";
import { fmtDate, parsePassage } from "../helpers";

interface DailyExegesis {
  id: number; title: string; passageReference: string; introduction: string;
  contextSummary: string; teachingBody: string; application: string;
  prayer: string; tags: string; displayDate: string; createdOn: string; isPublished: boolean;
}

const FALLBACK: DailyExegesis = {
  id: 0, title: "The Word That Leads Us Home", passageReference: "John 15:4-5",
  introduction: "Daily Exegesis will appear here once it is published.",
  contextSummary: "This placeholder keeps the screen useful while content is being prepared.",
  teachingBody: "The Lordsbook Daily Exegesis is designed to give the reader a focused passage, a short explanation, and a clear path into prayer and application.",
  application: "Read slowly, ask what the passage reveals about God, and write one faithful response in your journal.",
  prayer: "Lord, open my eyes to Your Word and teach me to abide faithfully today.",
  tags: "daily,exegesis", displayDate: new Date().toISOString(), createdOn: new Date().toISOString(), isPublished: true,
};

export default function DailyExegesisPage() {
  const p = useDailyExegesisPage();
  const { navigate, t, isRtl, loading, error, exegesis, series, refresh } = p;
  const item = exegesis ?? FALLBACK;
  const passage = useMemo(() => parsePassage(item.passageReference), [item.passageReference]);
  const isUpcoming = useMemo(() => { try { return new Date(item.displayDate) >= new Date(new Date().toDateString()); } catch { return false; } }, [item.displayDate]);

  const openInBible = () => {
    if (!passage) return;
    navigate(`/bible-reader?book=${encodeURIComponent(passage.bookName)}&chapter=${passage.chapter}&verse=${passage.verseNumber}`);
  };

  const saveToLedger = () => {
    const params = new URLSearchParams({
      title: item.title, reflection: [item.introduction, item.contextSummary, item.teachingBody].filter(Boolean).join("\n\n"),
      prayer: item.prayer || "", application: item.application || "", tags: item.tags || "", passage: item.passageReference,
      source: "daily-exegesis", date: item.displayDate,
    });
    if (passage) { params.set("book", passage.bookName); params.set("chapter", String(passage.chapter)); params.set("verse", String(passage.verseNumber)); }
    navigate(`/journal/new?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <ExegesisHeader onBack={() => navigate(-1)} t={t} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold text-muted-foreground">Preparing today's teaching…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <ExegesisHeader onBack={() => navigate(-1)} t={t} />

      <ExegesisHero item={item} series={series} onSelect={() => {}} onOpenBible={openInBible}
        displayDate={fmtDate(item.displayDate, "long")} isUpcoming={isUpcoming} canOpenBible={!!passage} />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {error && (
            <Button variant="outline" onClick={refresh} className="w-full mb-4 flex items-center gap-2 justify-center">
              <RefreshCcw className="w-4 h-4" /> {error}
            </Button>
          )}
          <ExegesisContent item={item} />
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button onClick={openInBible} disabled={!passage} className="flex-1 gap-2 h-11">
              <BookOpen className="w-4 h-4" /> Open in Bible
            </Button>
            <Button variant="outline" onClick={saveToLedger} className="flex-1 gap-2 h-11">
              <PenLine className="w-4 h-4" /> Save to Journal
            </Button>
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-2 py-4 border-t border-border/30 text-xs text-muted-foreground/60">
        <Sparkles className="w-3 h-3 text-muted-foreground/40" />
        <span>Lordsbook Daily Exegesis</span>
      </footer>
    </div>
  );
}
