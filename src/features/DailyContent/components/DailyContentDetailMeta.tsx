/**
 * DailyContentDetailMeta — shared metadata section for detail pages.
 * Shows badges (published status, reference) and date info.
 */
import { Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fmtDate } from "../helpers/contentDetailHelpers";

interface Props {
  isPublished: boolean;
  /** Optional reference badge text */
  reference?: string | null;
  /** Optional extra badge */
  extraBadge?: string | null;
  displayDate?: string;
  createdOn?: string;
  updatedOn?: string;
}

export function DailyContentDetailMeta({
  isPublished,
  reference,
  extraBadge,
  displayDate,
  createdOn,
  updatedOn,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={isPublished ? "default" : "secondary"}>
          {isPublished ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" /> Published
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" /> Draft
            </>
          )}
        </Badge>
        {reference && (
          <Badge variant="outline" className="text-xs">
            {reference}
          </Badge>
        )}
        {extraBadge && (
          <Badge variant="outline" className="text-xs">
            {extraBadge}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {displayDate && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {fmtDate(displayDate)}
          </span>
        )}
        {createdOn && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Created {fmtDate(createdOn)}
          </span>
        )}
        {updatedOn && <span>Updated {fmtDate(updatedOn)}</span>}
      </div>

      <div className="h-px bg-border/40" />
    </>
  );
}
