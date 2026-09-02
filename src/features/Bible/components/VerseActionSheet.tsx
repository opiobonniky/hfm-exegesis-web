import {
  BookHeart, BookOpen, Brain, CheckCircle2, ChevronRight, Copy, Ear, Eye,
  GitFork, GraduationCap, Headphones, Heart, Highlighter, Languages,
  Library, Lightbulb, NotebookPen, Search, Share2, Sparkles, Star,
  StickyNote, Wrench,
} from "lucide-react";

import { useLanguage } from "@/components/languages/languageProvider";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { VerseActionTarget, LabStage } from "../types";
import { LAB_STAGE_CONFIG } from "../constants";
import { ActionButton } from "./ActionButton";
import { LabStageItem } from "./LabStageItem";
import { ActionSection } from "./ActionSection";

interface VerseActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: VerseActionTarget | null;
  isRtl: boolean;
  onExplain: () => void;
  onStartLab: (stage: LabStage) => void;
  onOpenResources: (
    tab: "commentaries" | "crossReferences" | "translations",
  ) => void;
  onDevotional: () => void;
  onStudyTools: () => void;
  onStrongs: () => void;
  onTrivia: () => void;
  onListen: () => void;
  onHighlight: () => void;
  onNote: () => void;
  onJournal: () => void;
  onFavorite: () => void;
  onSearch: () => void;
  onShare: () => void;
  onCopy: () => void;
}

export default function VerseActionSheet({
  open,
  onOpenChange,
  target,
  isRtl,
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
  const { t } = useLanguage();
  const bibleReader = t.bibleReader as unknown as Record<string, string>;
  const label = (key: string, fallback: string) => bibleReader[key] || fallback;
  const run = (callback: () => void) => () => {
    onOpenChange(false);
    callback();
  };

  const reference = target
    ? `${target.book} ${target.chapter}:${target.verse}`
    : "";

  const getIcon = (iconName: string): any => {
    const icons: any = {
      Eye, Ear, GraduationCap, Heart, CheckCircle2,
    };
    return icons[iconName];
  };

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
            {label("verseActions", "Verse actions")}
          </div>
          <SheetTitle className="text-xl font-bold leading-tight">
            {reference || label("selectVerse", "Select Verse")}
          </SheetTitle>
          <SheetDescription className="line-clamp-3 font-serif text-sm italic leading-relaxed text-foreground/75">
            {target?.text ? (
              <>&ldquo;{target.text}&rdquo;</>
            ) : (
              label(
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
                      {label("exegesisLab", "Exegesis Lab")}
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {label(
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
                        icon={getIcon(icon)}
                        title={label(titleKey, titleFallback)}
                        description={label(descKey, descFallback)}
                        onClick={run(() => onStartLab(stage as any))}
                      />
                    ),
                  )}
                </div>
              </div>
            </section>

            <ActionSection title={label("resources", "Resources")}>
              <ActionButton
                icon={Lightbulb}
                title={label("explanation", "Explanation")}
                onClick={run(onExplain)}
              />
              <ActionButton
                icon={Library}
                title={label("commentaries", "Commentaries")}
                onClick={run(() => onOpenResources("commentaries"))}
              />
              <ActionButton
                icon={GitFork}
                title={label("crossReferences", "Cross References")}
                onClick={run(() => onOpenResources("crossReferences"))}
              />
              <ActionButton
                icon={Languages}
                title={label("translations", "Translations")}
                onClick={run(() => onOpenResources("translations"))}
              />
              <ActionButton
                icon={BookHeart}
                title={label("devotional", "Devotional")}
                onClick={run(onDevotional)}
              />
              <ActionButton
                icon={Wrench}
                title={label("studyTools", "Study Tools")}
                onClick={run(onStudyTools)}
              />
              <ActionButton
                icon={BookOpen}
                title={label("strongs", "Strong's Word Study")}
                onClick={run(onStrongs)}
              />
              <ActionButton
                icon={Brain}
                title={label("trivia", "Verse Trivia")}
                onClick={run(onTrivia)}
              />
            </ActionSection>

            <ActionSection title={label("listenHighlightSave", "Listen, highlight & save")} gridCols="grid-cols-2 gap-2">
              <ActionButton
                icon={Headphones}
                title={label("listen", "Listen")}
                onClick={run(onListen)}
              />
              <ActionButton
                icon={Highlighter}
                title={label("highlight", "Highlight")}
                onClick={run(onHighlight)}
              />
              <ActionButton
                icon={StickyNote}
                title={label("addNote", "Add Note")}
                onClick={run(onNote)}
              />
              <ActionButton
                icon={NotebookPen}
                title={label("journal", "Journal")}
                onClick={run(onJournal)}
              />
              <ActionButton
                icon={Star}
                title={label("favorite", "Favorite")}
                onClick={run(onFavorite)}
              />
              <ActionButton
                icon={Search}
                title={label("searchBible", "Search Bible")}
                onClick={run(onSearch)}
              />
            </ActionSection>

            <ActionSection title={label("shareExport", "Share & export")} gridCols="grid-cols-2 gap-2">
              <ActionButton
                icon={Share2}
                title={label("shareVerse", "Share Verse")}
                onClick={run(onShare)}
              />
              <ActionButton
                icon={Copy}
                title={label("copyVerse", "Copy Verse")}
                onClick={run(onCopy)}
              />
            </ActionSection>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
