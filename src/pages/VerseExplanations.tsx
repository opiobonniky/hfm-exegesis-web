"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Search,
  X,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Filter,
  BookMarked,
  Sparkles,
  ScrollText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { generatePath, routes } from "@/components/Routes/routes";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface VerseExplanation {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore: string;
  bibleVersion?: string;
  updatedOn?: string;
  createdOn?: string;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const BIBLE_BOOKS = [
  "All Books",
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalm",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi",
  "Matthew",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Romans",
  "1 Corinthians",
  "2 Corinthians",
  "Galatians",
  "Ephesians",
  "Philippians",
  "Colossians",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Timothy",
  "2 Timothy",
  "Titus",
  "Philemon",
  "Hebrews",
  "James",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Jude",
  "Revelation",
];

// ─────────────────────────────────────────────
// Inline preview card for expanded explanation
// ─────────────────────────────────────────────
function ExplanationPreview({ item }: { item: VerseExplanation }) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  const renderContent = (text?: string) => {
    if (!text) return null;
    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    return lines.map((line, i) => {
      const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
      if (isBullet) {
        return (
          <div key={i} className="flex gap-2.5 items-start mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
            <span className="text-sm text-muted-foreground leading-relaxed">
              {line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}
            </span>
          </div>
        );
      }
      return (
        <p
          key={i}
          className="text-sm text-muted-foreground leading-relaxed mb-2"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div className="px-4 pb-5 pt-3 border-t border-border/30 space-y-4 bg-muted/10">
      {/* Explanation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Explanation
          </span>
        </div>
        <div className="pl-3">{renderContent(item.explanation)}</div>
      </div>

      {/* Learn more toggle */}
      {item.learnMore && (
        <div className="space-y-2">
          <button
            onClick={() => setShowLearnMore((p) => !p)}
            className="flex items-center gap-2 group"
          >
            <div className="w-1 h-4 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider group-hover:text-amber-700">
              Learn More
            </span>
            {showLearnMore ? (
              <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
          {showLearnMore && (
            <div className="pl-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-3">
              {renderContent(item.learnMore)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
const VerseExplanations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [explanations, setExplanations] = useState<VerseExplanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("All Books");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<VerseExplanation | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  // ── fetch ─────────────────────────────────
  const loadExplanations = async () => {
    setLoading(true);
    try {
      const res = await sendPostRequest("bible", "get-all-verses-explanation", {
        bookName: bookFilter !== "All Books" ? bookFilter : undefined,
      });
      if (res.returnCode === 200 && res.returnData) {
        const data = res.returnData;
        const explanations = Array.isArray(data) ? data : (data?.explanations ?? []);
        setExplanations(explanations as VerseExplanation[]);
      } else {
        toast({
          title: "Failed to load explanations",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExplanations();
  }, [bookFilter]);

  // ── filter ────────────────────────────────
  const filtered = explanations.filter((v) => {
    const q = search.toLowerCase();
    return (
      !q ||
      v.bookName.toLowerCase().includes(q) ||
      String(v.chapter).includes(q) ||
      String(v.verseNumber).includes(q) ||
      v.explanation?.toLowerCase().includes(q)
    );
  });

  // ── delete ────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("bible", "delete-verse-explanation", {
        id: deleteTarget.id,
      });
      if (res.returnCode === 200) {
        toast({
          title: "Explanation deleted",
          description: `${deleteTarget.bookName} ${deleteTarget.chapter}:${deleteTarget.verseNumber} removed.`,
        });
        setExplanations((prev) => prev.filter((v) => v.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast({
          title: "Delete failed",
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Network error",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── stats ─────────────────────────────────
  const stats = {
    total: explanations.length,
    withLearnMore: explanations.filter((v) => v.learnMore).length,
    books: new Set(explanations.map((v) => v.bookName)).size,
  };

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 lg:p-10">
      <div className="mx-auto space-y-6">
        {/* ── Page header ── */}
        <div className="fade-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                <ScrollText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight font-heading text-gradient">
                  Verse Explanations
                </h1>
                <p className="text-muted-foreground text-sm">
                  Admin management
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate(routes.addExplanation.path)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Add Explanation
          </Button>
        </div>

        {/* ── Stats row ── */}
        <div className="fade-up stagger-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Total Explanations",
              value: stats.total,
              color: "text-primary",
              icon: ScrollText,
            },
            {
              label: "With Learn More",
              value: stats.withLearnMore,
              color: "text-amber-600",
              icon: Sparkles,
            },
            {
              label: "Books Covered",
              value: stats.books,
              color: "text-emerald-600",
              icon: BookMarked,
            },
          ].map((s) => (
            <Card key={s.label} className="border-border/40">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center shrink-0">
                  <s.icon className={cn("w-5 h-5", s.color)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="fade-up stagger-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by book, chapter, verse, or keyword…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={bookFilter} onValueChange={setBookFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {BIBLE_BOOKS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── List ── */}
        <div className="fade-up stagger-3 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                <BookOpen className="w-12 h-12 text-muted-foreground/40" />
                <p className="text-muted-foreground font-medium">
                  {explanations.length === 0
                    ? "No verse explanations yet"
                    : "No results match your search"}
                </p>
                {explanations.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(routes.addExplanation.path)}
                    className="gap-2 mt-1"
                  >
                    <Plus className="w-4 h-4" /> Add your first explanation
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filtered.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <Card
                  key={item.id}
                  className={cn(
                    "border-border/40 transition-all overflow-hidden",
                    isExpanded
                      ? "border-primary/30 shadow-md"
                      : "hover:shadow-sm hover:border-border/70",
                  )}
                >
                  <CardContent className="p-0">
                    {/* Row */}
                    <div className="flex items-start gap-4 p-4 sm:p-5">
                      {/* Reference badge */}
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                        <span className="text-[10px] font-bold text-primary/70 leading-none uppercase tracking-wide">
                          {item.bookName.split(" ").pop()?.slice(0, 3)}
                        </span>
                        <span className="text-sm font-extrabold text-primary leading-tight">
                          {item.chapter}:{item.verseNumber}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-base leading-tight">
                            {item.bookName} {item.chapter}:{item.verseNumber}
                          </h3>
                          {item.bibleVersion && (
                            <Badge
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {item.bibleVersion}
                            </Badge>
                          )}
                          {item.learnMore && (
                            <Badge
                              variant="outline"
                              className="text-xs gap-1 border-amber-200 bg-amber-50 text-amber-700"
                            >
                              <Sparkles className="w-3 h-3" />
                              Learn More
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.explanation}
                        </p>
                        {item.updatedOn && (
                          <p className="text-xs text-muted-foreground/60 mt-1.5">
                            Updated{" "}
                            {new Date(item.updatedOn).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 shrink-0">
                        {/* Expand/collapse */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : item.id)
                          }
                          title={
                            isExpanded ? "Collapse" : "Preview explanation"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        {/* Edit */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() =>
                            navigate(
                              generatePath("editVerseExplanation", {
                                bookName: item.bookName,
                                chapter: item.chapter,
                                verseNumber: item.verseNumber,
                              }),
                            )
                          }
                          title="Edit explanation"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(item)}
                          title="Delete explanation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Inline preview */}
                    {isExpanded && <ExplanationPreview item={item} />}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* ── Results count ── */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center pb-4">
            Showing {filtered.length} of {explanations.length} explanation
            {explanations.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ══════════════════════════
          DELETE DIALOG
      ══════════════════════════ */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Explanation
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the explanation for{" "}
              <strong>
                {deleteTarget?.bookName} {deleteTarget?.chapter}:
                {deleteTarget?.verseNumber}
              </strong>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1">
              <p className="font-semibold text-sm">
                {deleteTarget.bookName} {deleteTarget.chapter}:
                {deleteTarget.verseNumber}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {deleteTarget.explanation}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerseExplanations;
