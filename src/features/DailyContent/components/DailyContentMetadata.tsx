import { CalendarClock, CalendarDays, Check, Clock3, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayDate } from '@/services/numberLocale/format';

interface Props {
  creatorName?: string | null;
  createdOn?: string | null;
  displayDate?: string | null;
  /** Show the published/draft state next to the creator in the footer. */
  showStatus?: boolean;
  isPublished?: boolean;
}

export function DailyContentMetadata({
  creatorName,
  createdOn,
  displayDate: publishDate,
  showStatus = false,
  isPublished = false,
}: Props) {
  const { lang } = useLanguage();
  const date = (value?: string | null) => value && !Number.isNaN(new Date(value).getTime())
    ? displayDate(value, lang, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="mt-auto space-y-1 border-t border-border/40 pt-2 text-[11px]">
      <dl className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <UserRound className="h-3 w-3 shrink-0" aria-hidden="true" />{tt('Created by')}
          </dt>
          <dd className="flex min-w-0 items-center justify-end gap-2">
            {showStatus && (
              <span className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ring-1',
                isPublished
                  ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] ring-[hsl(var(--success)/0.25)]'
                  : 'bg-muted text-muted-foreground ring-border/50',
              )}>
                {isPublished ? <Check className="h-2.5 w-2.5" aria-hidden="true" /> : <Clock3 className="h-2.5 w-2.5" aria-hidden="true" />}
                {isPublished ? tt('Published') : tt('Draft')}
              </span>
            )}
            <span className="truncate font-medium text-foreground" title={creatorName || undefined}>{creatorName || '—'}</span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />{tt('Created date')}
          </dt>
          <dd className="shrink-0 tabular-nums text-foreground/90">{date(createdOn)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />{tt('Publish date')}
          </dt>
          <dd className="shrink-0 tabular-nums text-foreground/90">{date(publishDate)}</dd>
        </div>
      </dl>
    </div>
  );
}
