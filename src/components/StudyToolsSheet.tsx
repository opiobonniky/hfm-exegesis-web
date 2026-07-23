import { useState, useEffect, useCallback } from "react";
import {
  Command,
  ShieldCheck,
  AlertTriangle,
  Repeat,
  ArrowRightLeft,
  ArrowLeftRight,
  Loader2,
  BookOpen,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getChapterStudyTools, type ChapterStudyTools } from "@/services/studyToolsApi";

// ── Types ──

interface StudyToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName: string;
  chapter: number;
  onOpenHowToStudy: () => void;
  onGoToVerse?: (verseKey: string) => void;
}

// ── Tool type config ──

interface ToolTypeConfig {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const TOOL_TYPES: ToolTypeConfig[] = [
  {
    key: "COMMAND",
    label: "Commands",
    description: "Imperative verbs and direct instructions in this passage",
    icon: <Command className="w-4 h-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    key: "PROMISE",
    label: "Promises",
    description: "God's promises declared in this passage",
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    key: "WARNING",
    label: "Warnings",
    description: "Cautions and admonitions to pay attention to",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    key: "REPEATED_WORD",
    label: "Repeated Words",
    description: "Key words and themes that appear multiple times",
    icon: <Repeat className="w-4 h-4" />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    key: "TRANSITION",
    label: "Transition Words",
    description: "Therefore, but, for, because, if, then — the logical connectors",
    icon: <ArrowRightLeft className="w-4 h-4" />,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    key: "CONTRAST",
    label: "ArrowLeftRights",
    description: "Light/darkness, flesh/spirit, death/life — opposing ideas",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
];

// ── Component ──

export default function StudyToolsSheet({
  open,
  onOpenChange,
  bookName,
  chapter,
  onOpenHowToStudy,
  onGoToVerse,
}: StudyToolsSheetProps) {
  const [tools, setTools] = useState<ChapterStudyTools>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchTools = useCallback(async () => {
    if (!bookName || !chapter) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getChapterStudyTools(bookName, chapter);
      setTools(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [bookName, chapter]);

  useEffect(() => {
    if (open) {
      fetchTools();
    }
  }, [open, fetchTools]);

  const toolTypeKey = (key: string) => `${bookName}-${chapter}-${key}`;
  const hasAnyTools = Object.values(tools).some((arr) => arr && arr.length > 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/40">
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Study Tools
          </SheetTitle>
          <SheetDescription>
            {bookName} · Chapter {chapter}
          </SheetDescription>
        </SheetHeader>

        {/* "How Do I Study This?" button */}
        <div className="px-4 py-3 border-b border-border/20">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10 text-sm font-medium border-primary/30 bg-primary/5 hover:bg-primary/10"
            onClick={() => {
              onOpenHowToStudy();
              onOpenChange(false);
            }}
          >
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>How Do I Study This Passage?</span>
          </Button>
        </div>

        {/* Content area */}
        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground">
                Could not load study tools for this chapter.
              </p>
              <Button variant="outline" size="sm" onClick={fetchTools} className="mt-3">
                Retry
              </Button>
            </div>
          ) : !hasAnyTools ? (
            <div className="text-center py-16 space-y-3">
              <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">
                No study tools available for this chapter yet.
              </p>
              <p className="text-xs text-muted-foreground/60 max-w-xs mx-auto">
                Study tools are created by the content team. Check back later or try{" "}
                <button
                  onClick={() => {
                    onOpenHowToStudy();
                    onOpenChange(false);
                  }}
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  How Do I Study This?
                </button>{" "}
                for guided study.
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {TOOL_TYPES.map((toolType) => {
                const items = tools[toolType.key as keyof ChapterStudyTools];
                if (!items || items.length === 0) return null;

                return (
                  <AccordionItem
                    key={toolType.key}
                    value={toolTypeKey(toolType.key)}
                    className={cn(
                      "rounded-lg border border-border/50 overflow-hidden",
                      toolType.bgColor,
                    )}
                  >
                    <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-black/5 dark:hover:bg-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("shrink-0", toolType.color)}>
                          {toolType.icon}
                        </span>
                        <div className="text-left">
                          <span className="text-sm font-semibold">{toolType.label}</span>
                          <Badge
                            variant="secondary"
                            className="ml-2 text-[10px] font-bold px-1.5 py-0"
                          >
                            {items.length}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-3 pt-1">
                      <p className="text-[11px] text-muted-foreground mb-2.5 leading-relaxed">
                        {toolType.description}
                      </p>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-md bg-background/80 border border-border/30 p-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-foreground leading-snug">
                                {item.label}
                              </p>
                              {item.verseRefs && onGoToVerse && (
                                <button
                                  onClick={() => onGoToVerse(item.verseRefs)}
                                  className="shrink-0 mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                                  title="Go to verse"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.verseRefs && (
                              <Badge
                                variant="outline"
                                className="mt-1.5 text-[9px] font-mono font-semibold px-1.5 py-0"
                              >
                                {item.verseRefs}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
