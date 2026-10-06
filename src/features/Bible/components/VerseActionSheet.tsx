import {
  BookMarked, BookOpen, BookText, Copy, Hash, Headphones, Highlighter,
  Landmark, Library, Lightbulb, Link2, ListOrdered, NotebookPen, Play,
  Repeat2, ScrollText, Search, Share2, Star, StickyNote, Sun, Tags, Trophy,
} from "lucide-react";

import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import type {
  LabStage,
  VerseActionSheetProps,
  VerseResourceAction,
} from "../types";
import { LAB_STAGE_CONFIG } from "../constants";
import { ActionButton } from "./ActionButton";
import { LabStageItem } from "./LabStageItem";
import { ActionSection } from "./ActionSection";
import {
  getReaderLabel,
} from "../utils/readerPresentation";
import { useResourceSectionCounts } from "../hooks/useResourceSectionCounts";
import { sectionHasContent } from "@/components/verseResources";

export default function VerseActionSheet({
  open,
  onOpenChange,
  target,
  isRtl,
  labels,
  onExplain,
  onStartLab,
  onOpenResources,
  onDevotional,
  onStudyTools,
  onStrongs,
  onTrivia,
  onListen,
  onHighlight,
  onNote,
  onJournal,
  onFavorite,
  onSearch,
  onShare,
  onCopy,
}: VerseActionSheetProps) {
  const reference = target
    ? `${target.book} ${target.chapter}:${target.verse}${target.verseEnd && target.verseEnd !== target.verse ? `-${target.verseEnd}` : ''}`
    : "";

  // "3 commentaries", "2 cross references", … shown beside each resource
  // action, and actions whose count comes back 0 are removed entirely — the
  // reader only sees the studies this verse actually has. `null` counts
  // (still loading, or not counted) keep the action visible so buttons never
  // pop out from under the reader's finger.
  const { countOf } = useResourceSectionCounts({
    enabled: open,
    bookName: target?.book,
    chapter: target?.chapter,
    verse: target?.verse,
  });

  /** Resource action config: rendered only when the section has content. */
  const resourceActions: VerseResourceAction[] = [
    {
      section: "explanation",
      icon: Lightbulb,
      title: getReaderLabel(labels, "explanation", "Explanation"),
      description: getReaderLabel(labels, "explanationDescription", "Understand this verse in context."),
      count: countOf("explanation"),
      tone: "primary",
      onClick: () => { onOpenChange(false); onExplain(); },
    },
    {
      section: "commentaries",
      icon: Library,
      title: getReaderLabel(labels, "commentaries", "Commentaries"),
      description: getReaderLabel(labels, "commentariesDescription", "Read insights from trusted commentaries."),
      count: countOf("commentaries"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("commentaries"); },
    },
    {
      section: "crossReferences",
      icon: Link2,
      title: getReaderLabel(labels, "crossReferences", "Cross References"),
      description: getReaderLabel(labels, "crossReferencesDescription", "See related verses and passages."),
      count: countOf("crossReferences"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("crossReferences"); },
    },
    {
      section: "wordStudies",
      icon: BookMarked,
      title: getReaderLabel(labels, "wordStudies", "Word Studies"),
      description: getReaderLabel(labels, "wordStudiesDescription", "Explore important words and their meaning."),
      count: countOf("wordStudies"),
      tone: "primary",
      onClick: () => { onOpenChange(false); onOpenResources("wordStudies"); },
    },
    {
      section: "dictionary",
      icon: BookText,
      title: getReaderLabel(labels, "dictionary", "Bible Dictionary"),
      description: getReaderLabel(labels, "dictionaryDescription", "Look up people, places, and key terms."),
      count: countOf("dictionary"),
      tone: "primary",
      onClick: () => { onOpenChange(false); onOpenResources("dictionary"); },
    },
    {
      section: "interlinear",
      icon: ListOrdered,
      title: getReaderLabel(labels, "interlinear", "Interlinear"),
      description: getReaderLabel(labels, "interlinearDescription", "Follow the original-language word order."),
      count: countOf("interlinear"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("interlinear"); },
    },
    {
      section: "topics",
      icon: Tags,
      title: getReaderLabel(labels, "themes", "Themes & Topics"),
      description: getReaderLabel(labels, "themesDescription", "Discover themes connected to this verse."),
      count: countOf("topics"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("topics"); },
    },
    {
      section: "verseReferences",
      icon: ScrollText,
      title: getReaderLabel(labels, "verseReferences", "Where Else It Appears"),
      description: getReaderLabel(labels, "verseReferencesDescription", "Find other places this verse is referenced."),
      count: countOf("verseReferences"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("verseReferences"); },
    },
    {
      section: "translations",
      icon: Repeat2,
      title: getReaderLabel(labels, "compareTranslations", "Compare Translations"),
      description: getReaderLabel(labels, "translationsDescription", "See this verse in other versions."),
      count: countOf("translations"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("translations"); },
    },
    {
      section: "prologue",
      icon: Landmark,
      title: getReaderLabel(labels, "bookContext", "Background & Context"),
      description: getReaderLabel(labels, "bookContextDescription", "Explore historical and cultural insights."),
      count: countOf("prologue"),
      tone: "info",
      onClick: () => { onOpenChange(false); onOpenResources("prologue"); },
    },
    {
      section: "studyTools",
      icon: BookMarked,
      title: getReaderLabel(labels, "studyToolsForVerse", "Study Tools for Verse"),
      description: getReaderLabel(labels, "studyToolsDescription", "Open in-depth tools and commentaries."),
      count: countOf("studyTools"),
      tone: "primary",
      onClick: () => { onOpenChange(false); onStudyTools(); },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        dir={isRtl ? "rtl" : "ltr"}
        overlayClassName="bg-brand-dark/60 backdrop-blur-[1px]"
        className="flex !w-[78vw] max-w-[430px] flex-col gap-0 overflow-hidden rounded-ss-[28px] bg-background p-0 shadow-2xl sm:!w-[430px] [&>button]:right-4 [&>button]:top-5 [&>button]:rounded-full [&>button]:bg-white/10 [&>button]:p-2 [&>button]:text-white [&>button]:opacity-100 [&>button]:ring-offset-brand-primary-dark [&>button]:hover:bg-white/20 rtl:[&>button]:left-4 rtl:[&>button]:right-auto"
      >
        <SheetHeader className="shrink-0 space-y-0 bg-brand-primary-dark px-5 pb-5 pt-8 pe-14 text-start text-white dark:bg-brand-dark">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <BookOpen className="size-[18px]" aria-hidden="true" />
            </span>
            <SheetTitle className="truncate text-lg font-extrabold tracking-tight text-white">
              {reference || getReaderLabel(labels, "selectVerse", "Select Verse")}
            </SheetTitle>
          </div>
          <SheetDescription className="text-[15px] font-medium leading-[23px] text-white/90">
            {target?.text ? (
              <>
                <span className="line-clamp-4">{target.text}</span>
                <span className="mt-2 block text-[13px] font-bold text-white/55">&ndash; {reference}</span>
              </>
            ) : (
              getReaderLabel(
                labels,
                "verseActionsDescription",
                "Study, save, and share this verse.",
              )
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain bg-background px-[18px] pb-6 pt-4">
          <div className="space-y-3">
            <section className="rounded-2xl bg-brand-dark p-[18px] text-white" aria-labelledby="exegesis-lab-title">
              <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white/55">
                {getReaderLabel(labels, "labProject", "Lab project")}
              </p>
              <h2 id="exegesis-lab-title" className="text-[22px] font-black leading-tight">
                {getReaderLabel(labels, "exegesisLab", "Exegesis Lab")}
              </h2>
              <p className="mt-1.5 text-[13px] font-medium leading-[19px] text-white/70">
                {getReaderLabel(labels, "exegesisLabDescription", "Take this verse through a guided journey from observation to practice.")}
              </p>
              <button
                type="button"
                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/15 px-4 text-[15px] font-bold transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                onClick={() => {
                  onOpenChange(false);
                  onStartLab("look");
                }}
              >
                <Play className="size-4 fill-current" aria-hidden="true" />
                <span>{getReaderLabel(labels, "openVerseInLab", "Open Verse in Lab")}</span>
                <span aria-hidden="true">›</span>
              </button>
            </section>

            <ActionSection title={getReaderLabel(labels, "fiveStepStudyTools", "The 5-step study tools")}>
              {LAB_STAGE_CONFIG.map(
                ({ stage, titleKey, titleFallback, descKey, descFallback }, index) => (
                  <LabStageItem
                    key={stage}
                    index={index}
                    title={getReaderLabel(labels, titleKey, titleFallback)}
                    description={getReaderLabel(labels, descKey, descFallback)}
                    onClick={() => {
                      onOpenChange(false);
                      onStartLab(stage as LabStage);
                    }}
                  />
                ),
              )}
            </ActionSection>

            {/* Every visible entry opens the matching Verse Resources section.
                Sections confirmed empty for this verse remain hidden. */}
            <ActionSection title={getReaderLabel(labels, "resources", "Resources")}>
              {resourceActions
                .filter((action) => sectionHasContent(action.count))
                .map((action) => (
                  <ActionButton
                    key={action.section}
                    icon={action.icon}
                    title={action.title}
                    description={action.description}
                    count={action.count}
                    tone={action.tone}
                    onClick={action.onClick}
                  />
                ))}
              <ActionButton
                icon={Sun}
                title={getReaderLabel(labels, "devotionalOnVerse", "Devotional on This Verse")}
                description={getReaderLabel(labels, "devotionalDescription", "Read a devotional insight.")}
                tone="info"
                onClick={() => { onOpenChange(false); onDevotional(); }}
              />
              <ActionButton
                icon={Hash}
                title={getReaderLabel(labels, "strongsConcordance", "Strong's Concordance")}
                description={getReaderLabel(labels, "strongsDescription", "Explore original language and references.")}
                tone="primary"
                onClick={() => { onOpenChange(false); onStrongs(); }}
              />
              <ActionButton
                icon={Trophy}
                title={getReaderLabel(labels, "triviaFromVerse", "Trivia from This Verse")}
                description={getReaderLabel(labels, "triviaDescription", "Test your knowledge.")}
                tone="info"
                onClick={() => { onOpenChange(false); onTrivia(); }}
              />
            </ActionSection>

            <ActionSection title={getReaderLabel(labels, "listenHighlightSave", "Listen, highlight & save")}>
              <ActionButton
                icon={Headphones}
                title={getReaderLabel(labels, "listen", "Listen to Audio")}
                description={getReaderLabel(labels, "listenToAudioDescription", "Hear this verse read aloud.")}
                tone="success"
                onClick={() => { onOpenChange(false); onListen(); }}
              />
              <ActionButton
                icon={Highlighter}
                title={getReaderLabel(labels, "highlight", "Highlight Verse")}
                description={getReaderLabel(labels, "highlightDescription", "Highlight and color code.")}
                tone="warning"
                onClick={() => { onOpenChange(false); onHighlight(); }}
              />
              <ActionButton
                icon={StickyNote}
                title={getReaderLabel(labels, "notesLabel", "Notes")}
                description={getReaderLabel(labels, "notesDescription", "Add and view your verse notes.")}
                tone="primary"
                onClick={() => { onOpenChange(false); onNote(); }}
              />
              <ActionButton
                icon={NotebookPen}
                title={getReaderLabel(labels, "journal", "Journal")}
                description={getReaderLabel(labels, "journalDescription", "Write your personal reflections.")}
                tone="accent"
                onClick={() => { onOpenChange(false); onJournal(); }}
              />
              <ActionButton
                icon={Star}
                title={getReaderLabel(labels, "favorite", "Add to Favorites")}
                description={getReaderLabel(labels, "favoriteDescription", "Save this verse.")}
                tone="accent"
                onClick={() => { onOpenChange(false); onFavorite(); }}
              />
            </ActionSection>

            <ActionSection title={getReaderLabel(labels, "shareExport", "Share & export")}>
              <ActionButton
                icon={Search}
                title={getReaderLabel(labels, "searchThisText", "Search This Text")}
                description={getReaderLabel(labels, "searchThisTextDescription", "Find related words and passages.")}
                tone="primary"
                onClick={() => { onOpenChange(false); onSearch(); }}
              />
              <ActionButton
                icon={Share2}
                title={getReaderLabel(labels, "shareVerse", "Share Verse")}
                description={getReaderLabel(labels, "shareDescription", "Share this verse with others.")}
                tone="info"
                onClick={() => { onOpenChange(false); onShare(); }}
              />
              <ActionButton
                icon={Copy}
                title={getReaderLabel(labels, "copyVerse", "Copy Verse")}
                description={getReaderLabel(labels, "copyDescription", "Copy the verse text and reference.")}
                tone="info"
                onClick={() => { onOpenChange(false); onCopy(); }}
              />
            </ActionSection>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
