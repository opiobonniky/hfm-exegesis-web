// Bible sidebar — book picker with close button
import { useNavigate } from "react-router-dom";
import BookPicker from "./BookPicker";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookOpen, Info } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";

interface BibleSidebarProps {
  open: boolean;
  onClose: () => void;
  isRtl: boolean;
  books: { bookNumber: number; bookName: string; maxChapter: number }[];
  selectedBook: string;
  selectedChapter: number;
  onSelect: (book: string, chapter: number) => void;
  onBookOverview?: () => void;
  loading: boolean;
}
export default function BibleSidebar({
  open, onClose, isRtl, books, selectedBook, selectedChapter, onSelect, onBookOverview, loading,
}: BibleSidebarProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <SheetContent
        side={isRtl ? "right" : "left"}
        className="w-[min(22rem,90vw)] p-0 flex flex-col gap-0"
      >
        <SheetHeader className="border-b border-border px-4 py-3 text-start">
          <SheetTitle className="text-sm">{t.bibleReader.selectBook}</SheetTitle>
          <SheetDescription className="sr-only">{t.bibleReader.selectBookChapter}</SheetDescription>
        </SheetHeader>
        {/* Book Overview link */}
        <div className="px-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={() => {
              onClose();
              if (onBookOverview) onBookOverview();
              else navigate(`/book-overview?book=${encodeURIComponent(selectedBook)}`);
            }}
          >
            <Info className="w-3.5 h-3.5" />
            {selectedBook} Overview
          </Button>
        </div>
        <div className="min-h-0 flex-1">
          <BookPicker
            books={books}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            onSelect={(book, ch) => { onSelect(book, ch); onClose(); }}
            loading={loading}
          />
      </SheetContent>
    </Sheet>
  );
