import {
  BookHeart, BookMarked, BookOpen, BookText, Brain, Copy,
  GitFork, Headphones, Highlighter, Languages,
  Library, Lightbulb, ListOrdered, NotebookPen, ScrollText, Search, Share2, Sparkles, Star,
  StickyNote, Tags, Wrench,
} from "lucide-react";

import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import type { LabStage, VerseActionSheetProps } from "../types";
import type { LucideIcon } from "lucide-react";
import { LAB_STAGE_CONFIG } from "../constants";
import { ActionButton } from "./ActionButton";
import { LabStageItem } from "./LabStageItem";
import { ActionSection } from "./ActionSection";
import {
  getLabStageIcon,
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
    ? `${target.book} ${target.chapter}:${target.verse}`
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
  const resourceActions: Array<{
    section: string;
    icon: LucideIcon;
    title: string;
    count: number | null;
    onClick: () => void;
  }> = [
    {
      section: "explanation",
      icon: Lightbulb,
      title: getReaderLabel(labels, "explanation", "Explanation"),
      count: countOf("explanation"),
      onClick: () => { onOpenChange(false); onExplain(); },
    },
    {
      section: "commentaries",
      icon: Library,
      title: getReaderLabel(labels, "commentaries", "Commentaries"),
      count: countOf("commentaries"),
      onClick: () => { onOpenChange(false); onOpenResources("commentaries"); },
    },
    {
      section: "crossReferences",
      icon: GitFork,
      title: getReaderLabel(labels, "crossReferences", "Cross References"),
      count: countOf("crossReferences"),
      onClick: () => { onOpenChange(false); onOpenResources("crossReferences"); },
    },
    {
      section: "wordStudies",
      icon: BookMarked,
      title: getReaderLabel(labels, "wordStudies", "Word Studies"),
      count: countOf("wordStudies"),
      onClick: () => { onOpenChange(false); onOpenResources("wordStudies"); },
    },
    {
      section: "dictionary",
      icon: BookText,
      title: getReaderLabel(labels, "dictionary", "Bible Dictionary"),
      count: countOf("dictionary"),
      onClick: () => { onOpenChange(false); onOpenResources("dictionary"); },
    },
    {
      section: "interlinear",
      icon: ListOrdered,
      title: getReaderLabel(labels, "interlinear", "Interlinear"),
      count: countOf("interlinear"),
      onClick: () => { onOpenChange(false); onOpenResources("interlinear"); },
    },
    {
      section: "topics",
      icon: Tags,
      title: getReaderLabel(labels, "themes", "Themes & Topics"),
      count: countOf("topics"),
      onClick: () => { onOpenChange(false); onOpenResources("topics"); },
    },
    {
      section: "verseReferences",
      icon: ScrollText,
      title: getReaderLabel(labels, "verseReferences", "Where Else It Appears"),
      count: countOf("verseReferences"),
      onClick: () => { onOpenChange(false); onOpenResources("verseReferences"); },
    },
    {
      section: "translations",
      icon: Languages,
      title: getReaderLabel(labels, "translations", "Translations"),
      count: countOf("translations"),
      onClick: () => { onOpenChange(false); onOpenResources("translations"); },
    },
    {
      section: "prologue",
      icon: BookOpen,
      title: getReaderLabel(labels, "bookContext", "Book Context"),
      count: countOf("prologue"),
      onClick: () => { onOpenChange(false); onOpenResources("prologue"); },
    },
    {
      section: "studyTools",
      icon: Wrench,
      title: getReaderLabel(labels, "studyTools", "Study Tools"),
      count: countOf("studyTools"),
      onClick: () => { onOpenChange(false); onStudyTools(); },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        dir={isRtl ? "rtl" : "ltr"}
        className="flex w-[calc(100%-0.75rem)] max-w-[460px] flex-col gap-0 overflow-hidden p-0 sm:w-full sm:max-w-[460px]"
      >
        <SheetHeader className="shrink-0 border-b border-border bg-muted/20 px-5 py-5 pe-12 text-start">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="size-4" aria-hidden="true" />
            {getReaderLabel(labels, "verseActions", "Verse actions")}
          </div>
          <SheetTitle className="text-xl font-bold leading-tight">
            {reference || getReaderLabel(labels, "selectVerse", "Select Verse")}
          </SheetTitle>
          <SheetDescription className="line-clamp-3 font-serif text-sm italic leading-relaxed text-foreground/75">
            {target?.text ? (
              <>&ldquo;{target.text}&rdquo;</>
            ) : (
              getReaderLabel(
                labels,
                "verseActionsDescription",
                "Study, save, and share this verse.",
              )
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-5">
          <div className="space-y-6">
            <section aria-labelledby="exegesis-lab-title">
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3 border-b border-primary/15 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id="exegesis-lab-title"
                      className="font-bold text-foreground"
                    >
                      {getReaderLabel(labels, "exegesisLab", "Exegesis Lab")}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {getReaderLabel(
                        labels,
                        "exegesisLabDescription",
                        "Take this verse through a guided journey from observation to practice.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="grid gap-1.5 p-2">
                  {LAB_STAGE_CONFIG.map(
                    ({ stage, icon, titleKey, titleFallback, descKey, descFallback }, index) => (
                      <LabStageItem
                        key={stage}
                        index={index}
                        stage={stage}
                        icon={getLabStageIcon(icon)}
                        title={getReaderLabel(labels, titleKey, titleFallback)}
                        description={getReaderLabel(labels, descKey, descFallback)}
                        onClick={() => {
                          onOpenChange(false);
                          onStartLab(stage as LabStage);
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            </section>

            {/* Every visible entry here opens the Verse Resources page on
                that exact section, so the reader lands on the study they
                tapped. Sections with no content for this verse are hidden. */}
            <ActionSection title={getReaderLabel(labels, "resources", "Resources")}>
              {resourceActions
                .filter((action) => sectionHasContent(action.count))
                .map((action) => (
                  <ActionButton
                    key={action.section}
                    icon={action.icon}
                    title={action.title}
                    count={action.count}
                    onClick={action.onClick}
                  />
                ))}
            </ActionSection>

            <ActionSection title={getReaderLabel(labels, "moreStudy", "More study")}>
              <ActionButton
                icon={BookHeart}
                title={getReaderLabel(labels, "devotional", "Devotional")}
                onClick={() => { onOpenChange(false); onDevotional(); }}
              />
              <ActionButton
                icon={BookOpen}
                title={getReaderLabel(labels, "strongs", "Strong's Word Study")}
                onClick={() => { onOpenChange(false); onStrongs(); }}
              />
              <ActionButton
                icon={Brain}
                title={getReaderLabel(labels, "trivia", "Verse Trivia")}
                onClick={() => { onOpenChange(false); onTrivia(); }}
              />
            </ActionSection>

            <ActionSection title={getReaderLabel(labels, "listenHighlightSave", "Listen, highlight & save")} gridCols="grid-cols-2 gap-2">
              <ActionButton
                icon={Headphones}
                title={getReaderLabel(labels, "listen", "Listen")}
                onClick={() => { onOpenChange(false); onListen(); }}
              />
              <ActionButton
                icon={Highlighter}
                title={getReaderLabel(labels, "highlight", "Highlight")}
                onClick={() => { onOpenChange(false); onHighlight(); }}
              />
              <ActionButton
                icon={StickyNote}
                title={getReaderLabel(labels, "addNote", "Add Note")}
                onClick={() => { onOpenChange(false); onNote(); }}
              />
              <ActionButton
                icon={NotebookPen}
                title={getReaderLabel(labels, "journal", "Journal")}
                onClick={() => { onOpenChange(false); onJournal(); }}
              />
              <ActionButton
                icon={Star}
                title={getReaderLabel(labels, "favorite", "Favorite")}
                onClick={() => { onOpenChange(false); onFavorite(); }}
              />
              <ActionButton
                icon={Search}
                title={getReaderLabel(labels, "searchBible", "Search Bible")}
                onClick={() => { onOpenChange(false); onSearch(); }}
              />
            </ActionSection>

            <ActionSection title={getReaderLabel(labels, "shareExport", "Share & export")} gridCols="grid-cols-2 gap-2">
              <ActionButton
                icon={Share2}
                title={getReaderLabel(labels, "shareVerse", "Share Verse")}
                onClick={() => { onOpenChange(false); onShare(); }}
              />
              <ActionButton
                icon={Copy}
                title={getReaderLabel(labels, "copyVerse", "Copy Verse")}
                onClick={() => { onOpenChange(false); onCopy(); }}
              />
            </ActionSection>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
