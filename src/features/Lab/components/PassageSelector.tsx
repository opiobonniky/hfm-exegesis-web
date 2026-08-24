// Book, chapter, verse selection with preview
import { BookOpen, BookText, Sparkles, Loader2 } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import LockedFeatureBadge from "@/components/LockedFeatureBadge";

const BOOK_CHAPTERS: Record<string, number> = {
  Genesis: 50, Exodus: 40, Leviticus: 27, Numbers: 36, Deuteronomy: 34,
  Joshua: 24, Judges: 21, Ruth: 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36,
  Ezra: 10, Nehemiah: 13, Esther: 10, Job: 42, Psalms: 150,
  Proverbs: 31, Ecclesiastes: 12, "Song of Solomon": 8, Isaiah: 66,
  Jeremiah: 52, Lamentations: 5, Ezekiel: 48, Daniel: 12, Hosea: 14,
  Joel: 3, Amos: 9, Obadiah: 1, Jonah: 4, Micah: 7, Nahum: 3,
  Habakkuk: 3, Zephaniah: 3, Haggai: 2, Zechariah: 14, Malachi: 4,
  Matthew: 28, Mark: 16, Luke: 24, John: 21, Acts: 28,
  Romans: 16, "1 Corinthians": 16, "2 Corinthians": 13, Galatians: 6,
  Ephesians: 6, Philippians: 4, Colossians: 4, "1 Thessalonians": 5,
  "2 Thessalonians": 3, "1 Timothy": 6, "2 Timothy": 4, Titus: 3,
  Philemon: 1, Hebrews: 13, James: 5, "1 Peter": 5, "2 Peter": 3,
  "1 John": 5, "2 John": 1, "3 John": 1, Jude: 1, Revelation: 22,
};
interface PassageSelectorProps {
  bookName: string;
  chapter: string;
  verseStart: string;
  verseEnd: string;
  books: string[];
  previewText: string;
  previewLoading: boolean;
  isFree: boolean;
  loading: boolean;
  error: string;
  onUpdate: (patch: { bookName?: string; chapter?: string; verseStart?: string; verseEnd?: string }) => void;
  onStart: () => void;
}
const SelectionCard = ({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) => (
  <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm">
    <div className="p-4 pb-3 border-b border-border/30">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary/60" />
        </div>
        <p className="text-xs font-bold text-foreground">{label}</p>
      </div>
    </div>
    <div className="p-4">{children}</div>
  </div>
);
export function PassageSelector({
  bookName, chapter, verseStart, verseEnd, books, previewText, previewLoading,
  isFree, loading, error, onUpdate, onStart,
}: PassageSelectorProps) {
  const maxCh = bookName ? BOOK_CHAPTERS[bookName] || 50 : 50;
  const hasPassage = bookName && chapter && verseStart;
  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Book selection */}
      <SelectionCard icon={BookOpen} label="Book">
        <Combobox
          options={books.map((b) => ({ value: b, label: b }))}
          value={bookName}
          onChange={(v) => onUpdate({ bookName: v, chapter: "", verseStart: "", verseEnd: "" })}
          placeholder="Select a book..."
          searchPlaceholder="Search 66 books..."
          width="w-full"
        />
        <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">OT: 39 books, NT: 27 books</p>
      </SelectionCard>
      {/* Chapter selection */}
      {bookName && (
        <SelectionCard icon={BookText} label="Chapter">
          <Combobox
            options={Array.from({ length: maxCh }, (_, i) => ({ value: String(i + 1), label: `Chapter ${i + 1}` }))}
            value={chapter}
            onChange={(v) => onUpdate({ chapter: v, verseStart: "", verseEnd: "" })}
            placeholder={`Select chapter (1–${maxCh})...`}
            searchPlaceholder="Search chapters..."
            width="w-full"
          />
          <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">{bookName} has {maxCh} chapters</p>
        </SelectionCard>
      )}
      {/* Verse selection */}
      {bookName && chapter && (
        <SelectionCard icon={Sparkles} label="Verse(s)">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-muted-foreground/60 mb-1 block">From</label>
                <Combobox
                  options={Array.from({ length: 176 }, (_, i) => ({ value: String(i + 1), label: `Verse ${i + 1}` }))}
                  value={verseStart}
                  onChange={(v) => onUpdate({ verseStart: v, verseEnd: "" })}
                  placeholder="Select start verse..."
                  searchPlaceholder="Search verses..."
                  width="w-full"
                />
              </div>
              <div className="flex items-center pt-7"><div className="w-4 h-px bg-border/40" /></div>
                <label className="text-[10px] font-semibold text-muted-foreground/60 mb-1 block">To (optional)</label>
                  value={verseEnd}
                  onChange={(v) => onUpdate({ verseEnd: v })}
                  placeholder="–"
            </div>
            <p className="text-[11px] text-muted-foreground/50 text-center">
              Leave "To" empty for a single verse, or select an end verse for a range.
            </p>
          </div>
      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4 text-center">
          <p className="text-xs font-semibold text-destructive">{error}</p>
      {/* Passage preview */}
      {hasPassage && (
        <div className="rounded-2xl bg-gradient-to-b from-card to-card/80 border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 bg-muted/15">
            <p className="text-xs font-bold text-foreground">Passage Preview</p>
            <p className="text-[9px] text-muted-foreground/60">{bookName} {chapter}:{verseStart}{verseEnd ? `–${verseEnd}` : ""}</p>
          <div className="p-4">
            {previewLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground/50 italic">Loading...</span>
            ) : previewText ? (
              <p className="text-sm text-foreground/80 leading-6 font-serif italic">
                "{previewText.length > 350 ? previewText.slice(0, 350) + "..." : previewText}"
              </p>
            ) : (
              <p className="text-xs text-muted-foreground/40 italic">Could not load preview.</p>
            )}
      {/* Begin button */}
      {isFree && hasPassage ? (
        <LockedFeatureBadge compact featureName="Exegesis Lab" featureDescription="Available for Sower subscribers." />
      ) : (
        <button
          onClick={onStart}
          disabled={loading || !hasPassage}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-primary-foreground font-extrabold text-sm transition-all bg-primary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/30 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Starting..." : "Begin Study Journey"}
        </button>
  );
