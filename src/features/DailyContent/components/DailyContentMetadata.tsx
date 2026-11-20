import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayDate } from '@/services/numberLocale/format';

export function DailyContentMetadata({ creatorName, createdOn, displayDate: publishDate }: {
  creatorName?: string | null; createdOn?: string | null; displayDate?: string | null;
}) {
  const { lang } = useLanguage();
  const date = (value?: string | null) => value && !Number.isNaN(new Date(value).getTime())
    ? displayDate(value, lang, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  return <dl className="space-y-1 border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
    <div className="flex justify-between gap-2"><dt className="shrink-0">{tt('Created by')}</dt><dd className="truncate text-end" title={creatorName || undefined}>{creatorName || '—'}</dd></div>
    <div className="flex justify-between gap-2"><dt>{tt('Created date')}</dt><dd>{date(createdOn)}</dd></div>
    <div className="flex justify-between gap-2"><dt>{tt('Publish date')}</dt><dd>{date(publishDate)}</dd></div>
  </dl>;
}
