// VerseExplanationTable — responsive cards for a single page of explanations
import { Trash2, Edit2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayDate } from '@/services/numberLocale/format';
import { bibleVersionFullName } from "../utils";
import type { VerseExplanationListItem } from "../types";

interface VerseExplanationTableProps {
  items: VerseExplanationListItem[];
  onView: (item: VerseExplanationListItem, index: number) => void;
  onEdit: (item: VerseExplanationListItem) => void;
  onDelete: (item: VerseExplanationListItem) => void;
}

const summarizeText = (value?: string | null) => {
  if (!value) return "—";
  return value.replace(/\s+/g, " ").trim();
};

/** Creator name and the latest relevant date, shown at the bottom of the card, left of its action icons. */
function VerseExplanationMetadata({
  creatorName,
  createdOn,
  updatedOn,
  studyCreatedOn,
}: {
  creatorName?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
  studyCreatedOn?: string | null;
}) {
  const { lang } = useLanguage();
  // An update is newer (or the only date available), so show that instead of
  // the creation date. Bad/older updatedOn values keep the created date.
  const updatedTime = updatedOn ? new Date(updatedOn).getTime() : NaN;
  const createdTime = createdOn ? new Date(createdOn).getTime() : NaN;
  const useUpdated =
    !Number.isNaN(updatedTime) &&
    (Number.isNaN(createdTime) || updatedTime > createdTime);
  const useStudyDate = !useUpdated && !Number.isFinite(createdTime) &&
    !!studyCreatedOn && Number.isFinite(new Date(studyCreatedOn).getTime());
  const dateLabel = useUpdated ? tt("Updated date") : useStudyDate ? tt("Study created") : tt("Created date");
  const dateValue = useUpdated ? updatedOn : useStudyDate ? studyCreatedOn : Number.isFinite(createdTime) ? createdOn : null;
  const exactTime = dateValue && displayDate(dateValue, lang, { dateStyle: 'long', timeStyle: 'long' });
  return (
    <div className="min-w-0 text-[11px] text-muted-foreground">
      <span className="block truncate" title={creatorName || undefined}>
        {tt("Created by")}:{creatorName ? ` ${creatorName}` : " —"}
      </span>
      <span className="block">
        {dateValue ? <>{dateLabel}: <time dateTime={dateValue}
          title={useStudyDate ? `${tt("Original creation date was not recorded.")} ${exactTime}` : exactTime}>{displayDate(dateValue, lang, {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })}</time></> : tt("Date not recorded")}
      </span>
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
        aria-label={tt("View")}
        title={tt("View")}
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label={tt("Edit")}>
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        onClick={onDelete}
        aria-label={tt("Delete")}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function VerseExplanationTable({
  items,
  onView,
  onEdit,
  onDelete,
}: VerseExplanationTableProps) {
  return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            id={`verse-explanation-${item.id}`}
            className="border rounded-xl p-4 bg-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    {item.preview?.reference || `${item.bookName} ${item.chapter}:${item.verseNumber}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {bibleVersionFullName(item.bibleVersion)}
                  </div>
                </div>
                <Badge
                  variant={item.isPublished === false ? "secondary" : "default"}
                  className="text-[10px]"
                >
                  {item.isPublished === false ? tt("Draft") : tt("Published")}
                </Badge>
              </div>

              <div className="mt-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.preview?.explanation || item.explanation || tt("No explanation provided.")}
                </p>
              </div>

              <div className="mt-3">
                <h4 className="text-xs uppercase text-muted-foreground font-medium">{tt("Learn More")}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {summarizeText(item.preview?.learnMore ?? item.learnMore)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
              <VerseExplanationMetadata
                creatorName={item.creatorName}
                createdOn={item.createdOn}
                updatedOn={item.updatedOn}
                studyCreatedOn={item.studyCreatedOn}
              />
              <VerseExplanationActions
                onView={() => onView(item, index)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            </div>
          </article>
        ))}
      </div>

  );
}
