import {
  BookHeart, BookOpen, Brain, ChevronRight, Copy,
  GitFork, Headphones, Highlighter, Languages,
  Library, Lightbulb, NotebookPen, Search, Share2, Sparkles, Star,
  StickyNote, Wrench,
} from "lucide-react";

import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import type { LabStage, VerseActionSheetProps } from "../types";
import { LAB_STAGE_CONFIG } from "../constants";
import { ActionButton } from "./ActionButton";
import { LabStageItem } from "./LabStageItem";
import { ActionSection } from "./ActionSection";
import {
  getLabStageIcon,
  getReaderLabel,
} from "../utils/readerPresentation";

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

            <ActionSection title={getReaderLabel(labels, "resources", "Resources")}>
              <ActionButton
                icon={Lightbulb}
                title={getReaderLabel(labels, "explanation", "Explanation")}
                onClick={() => { onOpenChange(false); onExplain(); }}
              />
              <ActionButton
                icon={Library}
                title={getReaderLabel(labels, "commentaries", "Commentaries")}
                onClick={() => { onOpenChange(false); onOpenResources("commentaries"); }}
              />
              <ActionButton
                icon={GitFork}
                title={getReaderLabel(labels, "crossReferences", "Cross References")}
                onClick={() => { onOpenChange(false); onOpenResources("crossReferences"); }}
              />
              <ActionButton
                icon={Languages}
                title={getReaderLabel(labels, "translations", "Translations")}
                onClick={() => { onOpenChange(false); onOpenResources("translations"); }}
              />
              <ActionButton
                icon={BookHeart}
                title={getReaderLabel(labels, "devotional", "Devotional")}
                onClick={() => { onOpenChange(false); onDevotional(); }}
              />
              <ActionButton
                icon={Wrench}
                title={getReaderLabel(labels, "studyTools", "Study Tools")}
                onClick={() => { onOpenChange(false); onStudyTools(); }}
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
