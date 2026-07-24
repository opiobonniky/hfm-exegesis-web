import { useState, useMemo } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

interface MobileNavDrawerProps {
  selectedBook: string;
  selectedChapter: number;
  selectedVerse: number | null;
  versionId: string;
  maxChapter: number;
  onBookChange: (b: string) => void;
  onChapterChange: (c: number) => void;
  onVerseChange: (v: string) => void;
  onVersionChange: (v: string) => void;
  books: string[];
  availableTranslations: { id: string; name: string; shortName: string }[];
  verseCount: number;
  onOpenStudyTools?: () => void;
}

export default function MobileNavDrawer({
  selectedBook,
  selectedChapter,
  selectedVerse,
  versionId,
  maxChapter,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onVersionChange,
  books,
  availableTranslations,
  verseCount,
  onOpenStudyTools,
}: MobileNavDrawerProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [bookFilter, setBookFilter] = useState("");
  const [tab, setTab] = useState<"books" | "chapters" | "verses" | "version" | "study">("books");

  const filtered = useMemo(
    () =>
      bookFilter
        ? books.filter((b) =>
            b.toLowerCase().includes(bookFilter.toLowerCase()),
          )
        : books,
    [bookFilter, books],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/40 transition-all active:scale-95">
          <Menu className="w-4 h-4 text-muted-foreground" />
          <span
            className="text-sm font-medium text-foreground max-w-[100px] truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {selectedBook}
          </span>
          <span className="text-xs text-muted-foreground">
            {selectedChapter}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl p-0 flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 px-4 pb-3 pt-1 border-b border-border/40">
          {(["books", "chapters", "verses", "version", "study"] as const).map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => {
                if (tabKey === "study") {
                  setOpen(false);
                  onOpenStudyTools?.();
                } else {
                  setTab(tabKey);
                }
              }}
              className={cn(
                "flex-1 min-h-[44px] py-2 rounded-xl text-xs font-semibold capitalize transition-all active:scale-[0.97] [touch-action:manipulation]",
                tab === tabKey
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {{
                books: t.common.search,
                chapters: t.bibleReader.selectChapter,
                verses: t.bibleReader.selectVerse,
                version: t.bibleReader.translation,
                study: 'Study',
              }[tabKey] || tabKey}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-4 pb-safe">
          {tab === "books" && (
            <div className="flex flex-col h-full gap-3 pt-3">
              {/* <Input
                placeholder={t.bibleReader.filterBooks}
                value={bookFilter}
                onChange={(e) => setBookFilter(e.target.value)}
                className="h-9 text-sm"
              /> */}
              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 gap-1.5 pb-6">
                  {filtered.map((book) => (
                    <button
                      key={book}
                      onClick={() => {
                        onBookChange(book);
                        setOpen(false);
                      }}                        className={cn(
                          "text-left px-3 py-2.5 rounded-xl text-sm transition-all active:scale-95 [touch-action:manipulation]",
                          selectedBook === book
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-muted/50 hover:bg-muted text-foreground",
                        )}
                    >
                      {book}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {tab === "chapters" && (
            <ScrollArea className="h-full pt-3">
              <div className="grid grid-cols-5 gap-2 pb-6">
                {Array.from({ length: maxChapter }, (_, i) => i + 1).map(
                  (ch) => (
                    <button
                      key={ch}
                      onClick={() => {
                        onChapterChange(ch);
                        setOpen(false);
                      }}                        className={cn(
                          "aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center [touch-action:manipulation]",
                          selectedChapter === ch
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted text-foreground",
                        )}
                    >
                      {ch}
                    </button>
                  ),
                )}
              </div>
            </ScrollArea>
          )}

          {tab === "verses" && (
            <ScrollArea className="h-full pt-3">
              <div className="grid grid-cols-5 gap-2 pb-6">
                {verseCount > 0 ? (
                  Array.from({ length: verseCount }, (_, i) => i + 1).map(
                    (v) => (
                      <button
                        key={v}
                        onClick={() => {
                          onVerseChange(v.toString());
                          setOpen(false);
                        }}
                        className={cn(
                          "aspect-square rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center [touch-action:manipulation]",
                          selectedVerse === v
                            ? "bg-red-500 text-primary-foreground"
                            : "bg-muted/50 hover:bg-muted text-foreground",
                        )}
                      >
                        {v}
                      </button>
                    ),
                  )
                ) : (
                  <div className="col-span-5 text-center text-xs text-muted-foreground py-8">
                    {t.bibleReader.loadingBooks}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {tab === "version" && (
            <div className="pt-3 space-y-2">
              {availableTranslations.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    onVersionChange(v.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all active:scale-95 [touch-action:manipulation]",
                    versionId === v.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 hover:bg-muted text-foreground",
                  )}
                >
                  <span className="font-semibold">{v.shortName}</span>
                  <span
                    className={cn(
                      "text-xs",
                      versionId === v.id
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {v.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
