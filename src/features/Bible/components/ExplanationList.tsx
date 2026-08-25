// Explanation list — renders list of explanation cards with search/filter
import { BookOpen, Plus, Loader2, Filter, Edit2, Trash2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { VerseExplanation } from "../types";

const BIBLE_BOOKS = [
  "All Books","Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
  "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah",
  "Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah",
  "Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah",
  "Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke",
  "John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy",
  "Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
];

interface ExplanationListProps {
  explanations: VerseExplanation[];
  filtered: VerseExplanation[];
  loading: boolean;
  search: string;
  bookFilter: string;
  isAdmin: boolean;
  onSearchChange: (s: string) => void;
  onBookFilterChange: (b: string) => void;
  onEdit: (item: VerseExplanation) => void;
  onDelete: (item: VerseExplanation) => void;
  onAddFirst: () => void;
}

export default function ExplanationList({
  explanations, filtered, loading, search, bookFilter, isAdmin,
  onSearchChange, onBookFilterChange, onEdit, onDelete, onAddFirst,
}: ExplanationListProps) {
  return (
    <div className="space-y-4">
      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input placeholder="Search by book, chapter, verse..." className="pl-9" value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
        <Select value={bookFilter} onValueChange={onBookFilterChange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent className="max-h-64">{BIBLE_BOOKS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
              <BookOpen className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-muted-foreground font-medium">{explanations.length === 0 ? "No verse explanations yet" : "No results match your search"}</p>
              {explanations.length === 0 && (
                <Button variant="outline" size="sm" onClick={onAddFirst} className="gap-2 mt-1"><Plus className="w-4 h-4" /> Add your first explanation</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filtered.map((item) => (
            <Card key={item.id} className="border-border/40 hover:shadow-sm transition-all">
              <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0 border border-primary/20">
                    <span className="text-[10px] font-bold text-primary/70 leading-none uppercase">{item.bookName.split(" ").pop()?.slice(0, 3)}</span>
                    <span className="text-sm font-extrabold text-primary leading-tight">{item.chapter}:{item.verseNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{item.bookName} {item.chapter}:{item.verseNumber}</h3>
                      {item.bibleVersion && <Badge variant="outline" className="text-xs font-mono">{item.bibleVersion}</Badge>}
                      {item.learnMore && <Badge variant="outline" className="text-xs gap-1 border-amber-200 bg-amber-50 text-amber-700"><Sparkles className="w-3 h-3" /> Learn More</Badge>}
                    </div>
                    {item.updatedOn && <p className="text-xs text-muted-foreground/60 mb-2">Updated {new Date(item.updatedOn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(item)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
                {/* Content — always visible, no collapse */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                  <div className="rounded-lg bg-muted/20 border border-border/30 p-4">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.explanation}</p>
                    {item.learnMore && (
                      <div className="mt-3 pt-3 border-t border-border/20">
                        <p className="text-xs font-semibold text-amber-600 mb-1">Learn More</p>
                        <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">{item.learnMore}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pb-4">Showing {filtered.length} of {explanations.length} explanations</p>
      )}
    </div>
  );
}
