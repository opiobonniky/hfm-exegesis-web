"use client";

// VerseResources — verse study resources page (commentaries, cross refs, word studies)
import { BookOpen, Library, ExternalLink, BookMarked, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useVerseResources } from "../hooks/useVerseResources";
import { RESOURCE_TABS, ResourceTabBar, ResourceStatsRow, CommentariesView, CrossReferencesView, WordStudiesView, DictionaryView, TranslationComparisonView, InterlinearView, TopicsView, StudyToolsSection, BookPrologueSection, LoadingSkeleton } from "@/components/verseResources";

export default function VerseResources() {
  const h = useVerseResources();

  if (h.loading) return <LoadingSkeleton />;

  if (h.error || (!h.data && !h.loading)) {
    return (
      <div className="p-4">
        <div className="rounded-xl bg-card border border-border p-8 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">No Resources Available</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{h.error || "Could not load verse resources for this passage."}</p>
        </div>
        {h.bookName && h.chapter && (
          <Button variant="outline" size="sm" onClick={h.goToReader} className="mt-3 mx-auto block gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Open {h.verseRef} in Reader
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Sticky hero */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 pb-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Library className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-foreground truncate">Verse Resources</h1>
              <p className="text-[11px] text-muted-foreground">{h.verseRef}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 shrink-0" onClick={h.goToReader}>
            <ExternalLink className="w-3 h-3" /><span className="hidden sm:inline">Reader</span>
          </Button>
        </div>
        {h.data && <ResourceStatsRow data={h.data} />}
        {h.visibleTabs.length > 0 ? (
          <ResourceTabBar tabs={RESOURCE_TABS} activeTab={h.activeTab} onTabChange={h.setActiveTab} visibleTabs={h.visibleTabs} />
        ) : (
          <div className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
            <Info className="w-3.5 h-3.5 text-muted-foreground" /><span className="text-[11px] font-medium text-muted-foreground">No resources for this verse</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {h.bookName && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-primary/40" />
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" /> Book Prologue — {h.bookName}
              </h3>
              {h.prologueLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
            </div>
            {h.prologueLoading ? (
              <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                <Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-full" /><Skeleton className="h-8 w-3/4" />
              </div>
            ) : h.prologue ? (
              <BookPrologueSection prologue={h.prologue} bookName={h.bookName} />
            ) : (
              <div className="rounded-xl bg-card border border-border p-6 text-center">
                <BookMarked className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No book prologue available for {h.bookName}.</p>
              </div>
            )}
          </div>
        )}

        {h.activeTab === "commentaries" && h.data?.commentaries && <CommentariesView data={h.data.commentaries} verseRef={h.verseRef} />}
        {h.activeTab === "crossReferences" && h.data?.crossReferences && <CrossReferencesView data={h.data.crossReferences} />}
        {h.activeTab === "wordStudies" && h.data?.wordStudies && <WordStudiesView data={h.data.wordStudies} />}
        {h.activeTab === "dictionary" && h.data?.dictionaryTerms && <DictionaryView data={h.data.dictionaryTerms} />}
        {h.activeTab === "translations" && <TranslationComparisonView data={h.translations} loading={h.translationsLoading} error={h.translationsError} />}
        {h.activeTab === "interlinear" && h.data?.interlinearWords && <InterlinearView data={h.data.interlinearWords} />}
        {h.activeTab === "topics" && h.data?.relatedTopics && <TopicsView data={h.data.relatedTopics} />}
        {h.data?.studyTools && h.data.studyTools.length > 0 && <StudyToolsSection tools={h.data.studyTools} />}

        <div className="h-8" />
      </div>
    </div>
  );
}
