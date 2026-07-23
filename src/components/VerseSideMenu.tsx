// ── VerseSideMenu ────────────────────────────────────────────────────────────
// Slide-out drawer from the right triggered by tapping a verse number.
// Contains all verse-level actions from the spec (Screen 7):
//   Study This Verse | Open Strong's | Add Note | Highlight
//   Save to Journal | Cross References | Compare Translations
//   Devotional on This Verse | Trivia from This Verse
//   Search This Word/Phrase | Share Verse

import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BookText,
  PenLine,
  Highlighter,
  BookMarked,
  Crosshair,
  Languages,
  Heart,
  Brain,
  Search,
  Share2,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
import { useToast } from "@/hooks/use-toast";

export interface VerseInfo {
  verseKey: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
}

interface VerseSideMenuProps {
  open: boolean;
  onClose: () => void;
  verse: VerseInfo | null;
  /** If provided, shows action-specific modals */
  onStudy?: (verse: VerseInfo) => void;
  onAddNote?: (verse: VerseInfo) => void;
  onHighlight?: (verse: VerseInfo) => void;
  onSaveToJournal?: (verse: VerseInfo) => void;
  /** Navigate to search prefilled */
  onSearch?: (verse: VerseInfo) => void;
  /** Native share */
  onShare?: (verse: VerseInfo) => void;
}

interface ActionItem {
  icon: typeof BookOpen;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  action: "study" | "strongs" | "note" | "highlight" | "journal" | "crossrefs" | "compare" | "devotional" | "trivia" | "search" | "share";
  /** If true, this requires navigation rather than inline action */
  navigates?: boolean;
  path?: string;
}

const ACTIONS: ActionItem[] = [
  {
    icon: BookOpen,
    label: "Study This Verse",
    description: "Open Exegesis Lab with this verse",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200/50 dark:border-indigo-800/30",
    action: "study",
    navigates: true,
  },
  {
    icon: BookText,
    label: "Open Strong's",
    description: "View Greek & Hebrew word studies",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200/50 dark:border-violet-800/30",
    action: "strongs",
  },
  {
    icon: PenLine,
    label: "Add Note",
    description: "Quick note linked to this verse",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200/50 dark:border-emerald-800/30",
    action: "note",
  },
  {
    icon: Highlighter,
    label: "Highlight",
    description: "Mark this verse in color",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200/50 dark:border-amber-800/30",
    action: "highlight",
  },
  {
    icon: BookMarked,
    label: "Save to Journal",
    description: "Create journal entry with verse",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200/50 dark:border-rose-800/30",
    action: "journal",
    navigates: true,
  },
  {
    icon: Crosshair,
    label: "Cross References",
    description: "See related passages",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
    borderColor: "border-cyan-200/50 dark:border-cyan-800/30",
    action: "crossrefs",
  },
  {
    icon: Languages,
    label: "Compare Translations",
    description: "Read in other versions",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200/50 dark:border-blue-800/30",
    action: "compare",
  },
  {
    icon: Heart,
    label: "Devotional on This Verse",
    description: "Read related devotional",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-pink-200/50 dark:border-pink-800/30",
    action: "devotional",
    navigates: true,
  },
  {
    icon: Brain,
    label: "Trivia from This Verse",
    description: "Answer a question from this passage",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200/50 dark:border-orange-800/30",
    action: "trivia",
    navigates: true,
  },
  {
    icon: Search,
    label: "Search This Word",
    description: "Find other occurrences",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200/50 dark:border-purple-800/30",
    action: "search",
    navigates: true,
  },
  {
    icon: Share2,
    label: "Share Verse",
    description: "Share with others",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    borderColor: "border-slate-200/50 dark:border-slate-800/30",
    action: "share",
  },
];

export default function VerseSideMenu({
  open,
  onClose,
  verse,
  onStudy,
  onAddNote,
  onHighlight,
  onSaveToJournal,
  onSearch,
  onShare,
}: VerseSideMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!open || !verse) return null;

  const handleAction = (action: ActionItem) => {
    switch (action.action) {
      case "study":
        navigate(
          `${routes.labFlow.path}?bookName=${encodeURIComponent(verse.bookName)}&chapter=${verse.chapter}&verseStart=${verse.verseNumber}`,
        );
        onClose();
        break;
      case "strongs":
        window.dispatchEvent(
          new CustomEvent("open-strongs", {
            detail: {
              bookName: verse.bookName,
              chapter: verse.chapter,
              verseNumber: verse.verseNumber,
              verseKey: verse.verseKey,
            },
          }),
        );
        onClose();
        break;
      case "note":
        onAddNote?.(verse);
        onClose();
        break;
      case "highlight":
        onHighlight?.(verse);
        onClose();
        break;
      case "journal":
        navigate(
          `${routes.newJournalEntry.path}?book=${encodeURIComponent(verse.bookName)}&chapter=${verse.chapter}&verse=${verse.verseNumber}&reflection=${encodeURIComponent(verse.verseText)}&source=verse-menu`,
        );
        onClose();
        break;
      case "crossrefs":
        toast({
          title: "Coming Soon",
          description: "Cross references will be available in the next update.",
        });
        onClose();
        break;
      case "compare":
        toast({
          title: "Coming Soon",
          description: "Translation comparison will be available in the next update.",
        });
        onClose();
        break;
      case "devotional":
        navigate(routes.userDevotions.path);
        onClose();
        break;
      case "trivia":
        navigate(routes.trivia.path);
        onClose();
        break;
      case "search":
        navigate(
          `${routes.search.path}?q=${encodeURIComponent(verse.verseText.slice(0, 60))}`,
        );
        onClose();
        break;
      case "share":
        navigator
          .share({
            title: `${verse.bookName} ${verse.chapter}:${verse.verseNumber}`,
            text: `"${verse.verseText}" — ${verse.bookName} ${verse.chapter}:${verse.verseNumber}`,
          })
          .catch(() => {});
        onClose();
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-sm h-full bg-background border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Verse Actions
            </p>
            <p className="text-sm font-semibold text-foreground truncate mt-0.5">
              {verse.bookName} {verse.chapter}:{verse.verseNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Verse preview */}
        <div className="px-5 py-3 border-b border-border/20 bg-muted/20">
          <div className="rounded-lg bg-card border border-border/50 p-3">
            <p className="text-xs text-foreground/80 leading-relaxed italic line-clamp-3 font-serif">
              &ldquo;{verse.verseText}&rdquo;
            </p>
          </div>
        </div>

        {/* Actions */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="space-y-1.5">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              const navIcon = action.navigates ? (
                <ExternalLink className="w-3 h-3 text-muted-foreground/40" />
              ) : null;

              return (
                <button
                  key={action.action}
                  onClick={() => handleAction(action)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-all text-left",
                    "hover:shadow-sm active:scale-[0.99]",
                    action.borderColor,
                    action.bgColor,
                  )}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      action.bgColor,
                    )}
                  >
                    <Icon className={cn("w-4.5 h-4.5", action.color)} strokeWidth={1.8} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">
                        {action.label}
                      </span>
                      {navIcon}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground/40 text-center">
            Tap a verse number to open this menu while reading
          </p>
        </div>
      </div>
    </div>
  );
}
