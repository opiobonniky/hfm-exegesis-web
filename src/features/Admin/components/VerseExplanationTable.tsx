// VerseExplanationTable — responsive table (desktop) / card list (mobile) with infinite scroll
import { RefObject } from "react";
import { Trash2, Edit2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayDate } from '@/services/numberLocale/format';

interface VerseExplanationItem {
  id: number;
  bookName: string;
  chapter: number;
  verseNumber: number;
  explanation: string;
  learnMore?: string;
  isPublished: boolean;
  bibleVersion?: string;
  creatorName?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
}

interface VerseExplanationTableProps {
  items: VerseExplanationItem[];
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onView: (item: VerseExplanationItem) => void;
  onEdit: (item: VerseExplanationItem) => void;
  onDelete: (item: VerseExplanationItem) => void;
}

const summarizeText = (value?: string) => {
  if (!value) return "—";
  return value.replace(/\s+/g, " ").trim();
};

/** Creator name and the latest relevant date, shown at the bottom of the card, left of its action icons. */
function VerseExplanationMetadata({
  creatorName,
  createdOn,
  updatedOn,
}: {
  creatorName?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
}) {
  const { lang } = useLanguage();
  const date = (value?: string | null) =>
    value && !Number.isNaN(new Date(value).getTime())
      ? displayDate(value, lang, { month: 'short', day: 'numeric', year: 'numeric' })
      : "—";
  // An update is newer (or the only date available), so show that instead of
  // the creation date. Bad/older updatedOn values keep the created date.
  const updatedTime = updatedOn ? new Date(updatedOn).getTime() : NaN;
  const createdTime = createdOn ? new Date(createdOn).getTime() : NaN;
  const useUpdated =
    !Number.isNaN(updatedTime) &&
    (Number.isNaN(createdTime) || updatedTime >= createdTime);
  const dateLabel = useUpdated ? tt("Updated date") : tt("Created date");
  const dateValue = useUpdated ? updatedOn : createdOn;
  return (
    <div className="min-w-0 text-[11px] text-muted-foreground">
      <span className="block truncate" title={creatorName || undefined}>
        {tt("Created by")}:{creatorName ? ` ${creatorName}` : " —"}
      </span>
      <span className="block">{dateLabel}: {date(dateValue)}</span>
    </div>
  );
}

function VerseExplanationActions({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onView}
        title={tt("View")}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onEdit}>
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function VerseExplanationTable({
  items,
  loadingMore,
  hasMore,
  sentinelRef,
  onView,
  onEdit,
  onDelete,
}: VerseExplanationTableProps) {
  return (
    <>
      {/* Desktop card grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 bg-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {item.bookName} {item.chapter}:{item.verseNumber}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.bibleVersion || tt("BSB")}
                  </div>
                </div>
                <Badge
                  variant={item.isPublished ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {item.isPublished ? tt("Published") : tt("Draft")}
                </Badge>
              </div>

              <div className="mt-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.explanation || tt("No explanation provided.")}
                </p>
              </div>

              <div className="mt-3">
                <h4 className="text-xs uppercase text-muted-foreground font-medium">{tt("Learn More")}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {summarizeText(item.learnMore)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <VerseExplanationMetadata
                creatorName={item.creatorName}
                createdOn={item.createdOn}
                updatedOn={item.updatedOn}
              />
              <VerseExplanationActions
                onView={() => onView(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="border rounded-xl p-3 bg-card">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">
                  {item.bookName} {item.chapter}:{item.verseNumber}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {item.explanation}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {item.bibleVersion || tt("BSB")}
                </p>
              </div>
              <Badge
                variant={item.isPublished ? "default" : "secondary"}
                className="text-[10px] shrink-0"
              >
                {item.isPublished ? tt("Pub") : tt("Draft")}
              </Badge>
            </div>
            <div
              className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <VerseExplanationMetadata
                creatorName={item.creatorName}
                createdOn={item.createdOn}
                updatedOn={item.updatedOn}
              />
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onView(item)}
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(item)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">{tt("All explanations loaded")}</p>
      )}
    </>
  );
}
