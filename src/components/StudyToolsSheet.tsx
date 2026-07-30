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
  ChevronDown,
  User,
  Calendar,
  MapPin,
  Heart,
  BookMarked,
  Search,
  MessageSquareText,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getChapterStudyTools, type ChapterStudyTools } from "@/services/studyToolsApi";
import { getBookPrologue, type BookPrologue } from "@/services/bookProloguesApi";
import { getVerseResources, type VerseResourceData } from "@/services/verseResourcesApi";

// ── Types ──

interface StudyToolsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookName: string;
  chapter: number;
  verseNumber?: number | null;
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
  verseNumber,
  onOpenHowToStudy,
  onGoToVerse,
}: StudyToolsSheetProps) {
  const [tools, setTools] = useState<ChapterStudyTools>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [prologue, setPrologue] = useState<BookPrologue | null>(null);
  const [prologueLoading, setPrologueLoading] = useState(false);
  const [prologueExpanded, setPrologueExpanded] = useState(true);

  const [verseResources, setVerseResources] = useState<VerseResourceData | null>(null);
  const [verseResourcesLoading, setVerseResourcesLoading] = useState(false);

  const effectiveVerse = verseNumber || 1;

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

  const fetchPrologue = useCallback(async () => {
    if (!bookName) return;
    setPrologueLoading(true);
    try {
      const data = await getBookPrologue(bookName);
      setPrologue(data);
    } catch {
      setPrologue(null);
    } finally {
      setPrologueLoading(false);
    }
  }, [bookName]);

  const fetchVerseResources = useCallback(async () => {
    if (!bookName || !chapter) return;
    setVerseResourcesLoading(true);
    try {
      const data = await getVerseResources(bookName, chapter, effectiveVerse);
      setVerseResources(data);
    } catch {
      setVerseResources(null);
    } finally {
      setVerseResourcesLoading(false);
    }
  }, [bookName, chapter, effectiveVerse]);

  useEffect(() => {
    if (open) {
      fetchTools();
      fetchPrologue();
      fetchVerseResources();
    }
  }, [open, fetchTools, fetchPrologue, fetchVerseResources]);

  const toolTypeKey = (key: string) => `${bookName}-${chapter}-${key}`;
  const hasAnyTools = Object.values(tools).some((arr) => arr && arr.length > 0);

  const hasVerseResources =
    verseResources && (
      (verseResources.crossReferences && verseResources.crossReferences.length > 0) ||
      (verseResources.wordStudies && verseResources.wordStudies.length > 0) ||
      (verseResources.commentaries && verseResources.commentaries.length > 0)
    );

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
          {/* ── Book Prologue Section ── */}
          {prologueLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : prologue ? (
            <div className="mb-4">
              <button
                onClick={() => setPrologueExpanded((p) => !p)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">About {bookName}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {prologue.keyTheme || `${prologue.author ? `${prologue.author} · ` : ""}Book introduction & context`}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    prologueExpanded && "rotate-180",
                  )}
                  strokeWidth={2}
                />
              </button>

              {prologueExpanded && (
                <div className="mt-2 p-3 rounded-xl border border-border/50 bg-muted/30 space-y-3">
                  {prologue.summary && (
                    <p className="text-xs text-foreground/70 leading-6">{prologue.summary}</p>
                  )}

                  <div className="w-full h-px bg-border/50" />

                  {/* Author, Audience, Date, Location badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {prologue.author && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/50 px-2.5 py-1.5">
                        <User className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Author</p>
                          <p className="text-xs font-bold text-foreground">{prologue.author}</p>
                        </div>
                      </div>
                    )}
                    {prologue.audience && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/50 px-2.5 py-1.5">
                        <User className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Audience</p>
                          <p className="text-xs font-bold text-foreground">{prologue.audience}</p>
                        </div>
                      </div>
                    )}
                    {prologue.dateWritten && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/50 px-2.5 py-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
                          <p className="text-xs font-bold text-foreground">{prologue.dateWritten}</p>
                        </div>
                      </div>
                    )}
                    {prologue.locationWritten && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-background border border-border/50 px-2.5 py-1.5">
                        <MapPin className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
                          <p className="text-xs font-bold text-foreground">{prologue.locationWritten}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Key Theme */}
                  {prologue.keyTheme && (
                    <div className="rounded-lg bg-indigo-500/5 border border-indigo-500/20 p-2.5">
                      <p className="text-[9px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-0.5">
                        Key Theme
                      </p>
                      <p className="text-xs font-semibold text-foreground italic">{prologue.keyTheme}</p>
                    </div>
                  )}

                  {/* Purpose */}
                  {prologue.purpose && (
                    <div>
                      <p className="text-[11px] font-bold text-foreground mb-1">Purpose</p>
                      <p className="text-xs text-foreground/70 leading-6">{prologue.purpose}</p>
                    </div>
                  )}

                  {/* Main Themes */}
                  {prologue.mainThemes && prologue.mainThemes.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-foreground mb-1.5">Main Themes ({prologue.mainThemes.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {prologue.mainThemes.map((theme, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[9px] font-bold px-2 py-0 bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Christ Connection */}
                  {prologue.christConnection && (
                    <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Heart className="w-3 h-3 text-rose-500" strokeWidth={2.5} />
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                          Connection to Christ
                        </p>
                      </div>
                      <p className="text-xs text-foreground/70 leading-6">{prologue.christConnection}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}

          {/* ── Chapter Study Tools ── */}
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
            <div className="text-center py-8 space-y-3">
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
            <>
              {prologue && <div className="w-full h-px bg-border/40 mb-3" />}
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
                      <AccordionTrigger className="px-3 py-3 hover:no-underline hover:bg-black/5 dark:hover:bg-card/5">
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
            </>
          )}

          {/* ── Verse-Level Resources ── */}
          {verseResourcesLoading ? (
            <div className="flex items-center justify-center py-6 mt-2">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : hasVerseResources ? (
            <div className="mt-3 space-y-3">
              <div className="w-full h-px bg-border/40" />

              {/* Section header */}
              <div className="flex items-center gap-2">
                <div className="w-0.5 h-3.5 rounded-full bg-amber-500" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Verse Resources
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {bookName} {chapter}:{effectiveVerse}
                </span>
              </div>

              {/* Cross References */}
              {verseResources.crossReferences.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <BookMarked className="w-3.5 h-3.5 text-sky-500" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-foreground">
                      Cross References ({verseResources.crossReferences.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {verseResources.crossReferences.slice(0, 5).map((cr, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const parsed = cr.ref.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
                          if (parsed) {
                            const verseKey = parsed[3]
                              ? `${parsed[1].trim()} ${parsed[2]}:${parsed[3]}`
                              : `${parsed[1].trim()} ${parsed[2]}:1`;
                            onGoToVerse?.(verseKey);
                          }
                        }}
                        className="w-full text-left rounded-lg border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 p-2.5 transition-all"
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 min-w-[18px]">
                            {i + 1}.
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-bold text-sky-600 dark:text-sky-400">{cr.ref}</p>
                            <p className="text-[11px] text-foreground/70 leading-5 line-clamp-2 mt-0.5">{cr.text}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-sky-400/50 shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                    {verseResources.crossReferences.length > 5 && (
                      <p className="text-[10px] text-center text-muted-foreground py-1">
                        +{verseResources.crossReferences.length - 5} more cross-references
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Word Studies */}
              {verseResources.wordStudies.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Search className="w-3.5 h-3.5 text-violet-500" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-foreground">
                      Word Studies ({verseResources.wordStudies.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {verseResources.wordStudies.map((ws, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-2.5"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-violet-500/10 flex items-center justify-center text-[9px] font-extrabold text-violet-600 dark:text-violet-400 shrink-0">
                            {ws.word.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-foreground">{ws.word}</span>
                          <span className="text-[10px] text-muted-foreground italic">{ws.transliteration}</span>
                          {ws.strongs && (
                            <Badge variant="outline" className="text-[8px] font-mono px-1 py-0">
                              {ws.strongs}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-foreground/70 leading-5">
                          {ws.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaries (preview) */}
              {verseResources.commentaries.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquareText className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                    <span className="text-xs font-bold text-foreground">
                      Commentaries ({verseResources.commentaries.length})
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {verseResources.commentaries.slice(0, 2).map((c, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5 border-l-4 border-l-blue-500"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center text-[7px] font-extrabold text-blue-600 dark:text-blue-400">
                            {c.author.charAt(0)}
                          </span>
                          <span className="text-[10px] font-bold text-foreground">{c.author}</span>
                          {c.title && (
                            <span className="text-[9px] text-muted-foreground italic truncate">{c.title}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-foreground/70 leading-5 line-clamp-3">{c.text}</p>
                      </div>
                    ))}
                    {verseResources.commentaries.length > 2 && (
                      <p className="text-[10px] text-center text-muted-foreground py-1">
                        +{verseResources.commentaries.length - 2} more commentaries
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
