import type { LucideIcon } from "lucide-react";
import {
  BookHeart,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Copy,
  Ear,
  Eye,
  GitFork,
  GraduationCap,
  Headphones,
  Heart,
  Highlighter,
  Languages,
  Library,
  Lightbulb,
  NotebookPen,
  Search,
  Share2,
  Sparkles,
  Star,
  StickyNote,
  Wrench,
} from "lucide-react";

import { useLanguage } from "@/components/languages/languageProvider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export type VerseActionTarget = {
  book: string;
  chapter: number;
  verse: number;
  text: string;
};

export type LabStage = "look" | "listen" | "learn" | "abide" | "apply";

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

type ActionButtonProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
};

function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-start transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
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

  const labStages: Array<{
    stage: LabStage;
    icon: LucideIcon;
    title: string;
    description: string;
  }> = [
    {
      stage: "look",
      icon: Eye,
      title: label("look", "Look"),
      description: label("lookDescription", "Observe what the passage says"),
    },
    {
      stage: "listen",
      icon: Ear,
      title: label("listen", "Listen"),
      description: label(
        "listenDescription",
        "Attend to what God is revealing",
      ),
    },
    {
      stage: "learn",
      icon: GraduationCap,
      title: label("learn", "Learn"),
      description: label("learnDescription", "Explore context and meaning"),
    },
    {
      stage: "abide",
      icon: Heart,
      title: label("abide", "Abide"),
      description: label("abideDescription", "Reflect and remain in the Word"),
    },
    {
      stage: "apply",
      icon: CheckCircle2,
      title: label("apply", "Apply"),
      description: label("applyDescription", "Put this truth into practice"),
    },
  ];

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
                  {labStages.map(
                    ({ stage, icon: Icon, title, description }, index) => (
                      <button
                        key={stage}
                        type="button"
                        onClick={run(() => onStartLab(stage))}
                        className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <Icon
                          className="size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-foreground">
                            {title}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {description}
                          </span>
                        </span>
                        <ChevronRight
                          className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180"
                          aria-hidden="true"
                        />
                      </button>
                    ),
                  )}
                </div>
              </div>
            </section>

            <section aria-labelledby="resources-title" className="space-y-2.5">
              <h2
                id="resources-title"
                className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {label("resources", "Resources")}
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
              </div>
            </section>

            <section aria-labelledby="keep-title" className="space-y-2.5">
              <h2
                id="keep-title"
                className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {label("listenHighlightSave", "Listen, highlight & save")}
              </h2>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
            </section>

            <section aria-labelledby="share-title" className="space-y-2.5 pb-1">
              <h2
                id="share-title"
                className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {label("shareExport", "Share & export")}
              </h2>
              <div className="grid grid-cols-2 gap-2">
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
              </div>
            </section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
