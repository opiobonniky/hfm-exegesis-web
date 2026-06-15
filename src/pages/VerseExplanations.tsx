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
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
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
  const { t } = useLanguage();

  const renderContent = (text?: string) => {
    if (!text) return null;
    const paragraphs = text.replace(/\r/g, "").split(/\n\s*\n/).filter(Boolean);
    return paragraphs.map((para, pi) => {
      const lines = para.split("\n").map((s) => s.trim()).filter(Boolean);
      const isBulletList = lines.some((l) => /^(\-|\*|•|\d+\.)\s+/.test(l));
      if (isBulletList) {
        return (
          <div key={pi} className="space-y-2 mb-4">
            {lines.map((line, li) => {
              const isBullet = /^(\-|\*|•|\d+\.)\s+/.test(line);
              if (isBullet) {
                return (
                  <div key={li} className="flex gap-3 items-start">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                      {line.replace(/^(\-|\*|•|\d+\.)\s+/, "")}
                    </span>
                  </div>
                );
              }
              return (
                <p key={li} className="text-sm sm:text-base text-foreground/80 leading-relaxed">
                  {line}
                </p>
              );
            })}
          </div>
        );
      }
      return (
        <p key={pi} className="text-sm sm:text-base text-foreground/80 leading-relaxed mb-4 last:mb-0">
          {lines.join(" ")}
        </p>
      );
    });
  };

  return (
    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-border/30 space-y-4 bg-muted/10">
      {/* Explanation */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {t.verseExplanations?.explanationTitle || "Explanation"}
          </span>
        </div>
        <div className="pl-4">{renderContent(item.explanation)}</div>
      </div>

      {/* Learn more toggle with accordion */}
      {item.learnMore && (
        <div className="space-y-3">
          <button
            onClick={() => setShowLearnMore((p) => !p)}
            className="flex items-center gap-2 group"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              {t.verseExplanations?.learnMoreTitle || "Learn More"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-amber-500 transition-transform duration-300 ease-in-out ${
                showLearnMore ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className="grid transition-all duration-300 ease-in-out"
            style={{
              gridTemplateRows: showLearnMore ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <div className="pl-4 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 sm:p-5">
                {renderContent(item.learnMore)}
              </div>
            </div>
          </div>
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
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [explanations, setExplanations] = useState<VerseExplanation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bookFilter, setBookFilter] = useState("All Books");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VerseExplanation | null>(null);
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
          title: t.verseExplanations?.failedToLoad || 'Failed to load explanations',
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.verseExplanations?.networkError || 'Network error',
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
          title: t.verseExplanations?.deletedToast || 'Explanation deleted',
          description: (t.verseExplanations?.deletedToastDesc || '{bookName} {chapter}:{verseNumber} removed.')
            .replace('{bookName}', deleteTarget.bookName)
            .replace('{chapter}', String(deleteTarget.chapter))
            .replace('{verseNumber}', String(deleteTarget.verseNumber)),
        });
        setExplanations((prev) => prev.filter((v) => v.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        toast({
          title: t.verseExplanations?.deleteFailed || 'Delete failed',
          description: res.returnMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: t.verseExplanations?.networkError || "Network error",
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
              {t.common?.back || 'Back'}
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm">
                <ScrollText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight font-heading text-gradient">
                  {t.verseExplanations?.pageTitle || 'Verse Explanations'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {t.verseExplanations?.adminManagement || 'Admin management'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate(routes.addExplanation.path)}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 shadow-md"
          >
            <Plus className="w-4 h-4" />
            {t.verseExplanations?.addExplanation || 'Add Explanation'}
          </Button>
        </div>

        {/* ── Stats row ── */}
        <div className="fade-up stagger-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: t.verseExplanations?.statTotal || 'Total Explanations',
              value: stats.total,
              color: "text-primary",
              icon: ScrollText,
            },
            {
              label: t.verseExplanations?.statWithLearnMore || 'With Learn More',
              value: stats.withLearnMore,
              color: "text-amber-600",
              icon: Sparkles,
            },
            {
              label: t.verseExplanations?.statBooksCovered || 'Books Covered',
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
              placeholder={t.verseExplanations?.searchPlaceholder || 'Search by book, chapter, verse, or keyword…'}
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
                    ? (t.verseExplanations?.noExplanationsYet || 'No verse explanations yet')
                    : (t.verseExplanations?.noSearchMatch || 'No results match your search')}
                </p>
                {explanations.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(routes.addExplanation.path)}
                    className="gap-2 mt-1"
                  >
                    <Plus className="w-4 h-4" /> {t.verseExplanations?.addFirstExplanation || 'Add your first explanation'}
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
                              {t.verseExplanations?.learnMoreBadge || 'Learn More'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.explanation}
                        </p>
                        {item.updatedOn && (
                          <p className="text-xs text-muted-foreground/60 mt-1.5">
                            {t.verseExplanations?.updatedLabel || 'Updated'}{" "}
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
                            isExpanded ? (t.verseExplanations?.collapseLabel || 'Collapse') : (t.verseExplanations?.previewLabel || 'Preview explanation')
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        {isAdmin && (
                          <>
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
                              title={t.verseExplanations?.editTitle || 'Edit explanation'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteTarget(item)}
                              title={t.verseExplanations?.deleteTitle || 'Delete explanation'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
            {explanations.length === 1
              ? (t.verseExplanations?.showingCount || 'Showing {filtered} of {total} explanation')
                  .replace('{filtered}', String(filtered.length))
                  .replace('{total}', String(explanations.length))
              : (t.verseExplanations?.showingCountPlural || 'Showing {filtered} of {total} explanations')
                  .replace('{filtered}', String(filtered.length))
                  .replace('{total}', String(explanations.length))}
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
              {t.verseExplanations?.deleteDialogTitle || 'Delete Explanation'}
            </DialogTitle>
            <DialogDescription>
              {(t.verseExplanations?.deleteDialogDesc || 'This will permanently delete the explanation for {bookName} {chapter}:{verseNumber}. This action cannot be undone.')
                .replace('{bookName}', deleteTarget?.bookName || '')
                .replace('{chapter}', String(deleteTarget?.chapter || ''))
                .replace('{verseNumber}', String(deleteTarget?.verseNumber || ''))}
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
              {t.common?.cancel || 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> {t.verseExplanations?.deleteDialogTitle || 'Deleting…'}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> {t.verseExplanations?.deleteDialogTitle || 'Delete'}
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
