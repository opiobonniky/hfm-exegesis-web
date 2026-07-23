import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Library,
  ExternalLink,
  BookMarked,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getVerseResources, getTranslationComparison } from "@/services/verseResourcesApi";
import { getBookPrologue } from "@/services/bookProloguesApi";
import type { VerseResourceData, TranslationComparisonEntry } from "@/services/verseResourcesApi";
import type { BookPrologue } from "@/services/bookProloguesApi";

import {
  RESOURCE_TABS,
  ResourceTabBar,
  ResourceStatsRow,
  CommentariesView,
  CrossReferencesView,
  WordStudiesView,
  DictionaryView,
  TranslationComparisonView,
  InterlinearView,
  TopicsView,
  StudyToolsSection,
  BookPrologueSection,
  LoadingSkeleton,
} from "@/components/verseResources";

type TabKey = (typeof RESOURCE_TABS)[number]["key"];

// ── Main Page Component ───────────────────────────────────────────────────────

export default function VerseResources() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookName = searchParams.get("book") || "";
  const chapter = parseInt(searchParams.get("chapter") || "0", 10);
  const verseNumber = parseInt(searchParams.get("verse") || "1", 10);

  const [activeTab, setActiveTab] = useState<TabKey>("commentaries");
  const [data, setData] = useState<VerseResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translation comparison
  const [translations, setTranslations] = useState<TranslationComparisonEntry[] | null>(null);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState<string | null>(null);

  // Book prologue
  const [prologue, setPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);

  const verseRef = `${bookName} ${chapter}:${verseNumber}`;

  // ── Fetch data ──
  useEffect(() => {
    if (!bookName || !chapter) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await getVerseResources(bookName, chapter, verseNumber);
        setData(res);
      } catch {
        setError("Failed to load verse resources.");
      } finally {
        setLoading(false);
      }

      setTranslationsLoading(true);
      try {
        const trans = await getTranslationComparison(bookName, chapter, verseNumber);
        setTranslations(trans);
      } catch {
        setTranslationsError("No translations available");
        setTranslations(null);
      } finally {
        setTranslationsLoading(false);
      }

      setPrologueLoading(true);
      try {
        const p = await getBookPrologue(bookName);
        setPrologue(p);
      } catch {
        setPrologue(null);
      } finally {
        setPrologueLoading(false);
      }
    };

    fetchAll();
  }, [bookName, chapter, verseNumber]);

  // ── Compute visible tabs ──
  const visibleTabs = useMemo(() => {
    const tabs: TabKey[] = [];
    if (!data) return tabs;

    if (data.commentaries.length > 0) tabs.push("commentaries");
    if (data.crossReferences.length > 0) tabs.push("crossReferences");
    if (data.wordStudies.length > 0) tabs.push("wordStudies");
    if (data.dictionaryTerms.length > 0) tabs.push("dictionary");
    if (translations && translations.length > 0) tabs.push("translations");
    if (data.interlinearWords.length > 0) tabs.push("interlinear");
    if (data.relatedTopics.length > 0) tabs.push("topics");

    return tabs;
  }, [data, translations]);

  // Auto-switch to first visible tab if current is not visible
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0]);
    }
  }, [visibleTabs, activeTab]);

  // Reset active tab on verse change
  useEffect(() => {
    setActiveTab("commentaries");
  }, [bookName, chapter, verseNumber]);

  // ── Loading State ──
  if (loading) {
    return <LoadingSkeleton />;
  }

  // ── Error State ──
  if (error || (!data && !loading)) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">No Resources Available</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {error || "Could not load verse resources for this passage."}
          </p>
        </div>
        {bookName && chapter && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber}`)}
            className="mt-3 mx-auto block gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open {verseRef} in Reader
          </Button>
        )}
      </div>
    );
  }

  // ── Main Render ──
  return (
    <div className="flex flex-col">
      {/* Hero card */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 pb-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Library className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Verse Resources</h1>
              <p className="text-[11px] text-muted-foreground">{verseRef}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[11px] gap-1 shrink-0"
            onClick={() => navigate(`/bible-reader?book=${encodeURIComponent(bookName)}&chapter=${chapter}&verse=${verseNumber}`)}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Reader</span>
          </Button>
        </div>

        {/* Stats row */}
        {data && <ResourceStatsRow data={data} />}

        {/* Tab bar */}
        {visibleTabs.length > 0 ? (
          <ResourceTabBar
            tabs={RESOURCE_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            visibleTabs={visibleTabs}
          />
        ) : (
          <div className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
            <Info className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">No resources for this verse</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* ── Book Prologue (always first) ── */}
        {bookName && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-primary/40" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" />
                Book Prologue — {bookName}
              </h3>
              {prologueLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>

            {prologueLoading ? (
              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : prologue ? (
              <BookPrologueSection prologue={prologue} bookName={bookName} />
            ) : (
              <div className="rounded-xl bg-card border border-border p-6 text-center">
                <BookMarked className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No book prologue available for {bookName}.
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Prologues provide author, date, audience, purpose, and key themes for each book.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Commentaries ── */}
        {activeTab === "commentaries" && data?.commentaries && (
          <CommentariesView data={data.commentaries} verseRef={verseRef} />
        )}

        {/* ── Cross References ── */}
        {activeTab === "crossReferences" && data?.crossReferences && (
          <CrossReferencesView data={data.crossReferences} />
        )}

        {/* ── Word Studies ── */}
        {activeTab === "wordStudies" && data?.wordStudies && (
          <WordStudiesView data={data.wordStudies} />
        )}

        {/* ── Dictionary ── */}
        {activeTab === "dictionary" && data?.dictionaryTerms && (
          <DictionaryView data={data.dictionaryTerms} />
        )}

        {/* ── Translations ── */}
        {activeTab === "translations" && (
          <TranslationComparisonView
            data={translations}
            loading={translationsLoading}
            error={translationsError}
          />
        )}

        {/* ── Interlinear ── */}
        {activeTab === "interlinear" && data?.interlinearWords && (
          <InterlinearView data={data.interlinearWords} />
        )}

        {/* ── Topics ── */}
        {activeTab === "topics" && data?.relatedTopics && (
          <TopicsView data={data.relatedTopics} />
        )}

        {/* ── Study Tools (always shown when available) ── */}
        {data?.studyTools && data.studyTools.length > 0 && (
          <StudyToolsSection tools={data.studyTools} />
        )}

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}
