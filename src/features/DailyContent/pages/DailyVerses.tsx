import { CalendarDays } from 'lucide-react';
import { useDailyVersesPage } from '../hooks/useDailyVersesPage';
import { VerseExplanationFilters } from '@/features/Admin/components/VerseExplanationFilters';
import { DailyContentGrid } from '@/features/Admin/components/DailyContentGrid';
import { AdminDeleteDialog } from '@/features/Admin/components/AdminDeleteDialog';
import { AdminCardGridSkeleton } from '@/features/Admin/components/AdminCardGridSkeleton';
import { useScrollEnd } from '@/hooks/useScrollEnd';
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

export default function DailyVerses() {
  const data = useDailyVersesPage();
  const watchEnd = data.hasMore && !data.loading && !data.loadError;
  const endRef = useScrollEnd(watchEnd, data.loadMore);
  return <div className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <header className="flex items-center gap-3">
      <CalendarDays className="h-6 w-6 text-primary" />
      <div><h1 className="text-2xl font-bold">{tt('Daily Verses')}</h1>
        <p className="text-sm text-muted-foreground">{tt('Manage daily verses')}</p></div>
    </header>
    <VerseExplanationFilters
      bookName={data.bookName}
      chapter={data.chapter}
      creatorName={data.search}
      onBookChange={data.changeBook}
      onChapterChange={data.changeChapter}
      onCreatorNameChange={data.changeSearch}
      searchLabel={tt('Search daily verses')}
      searchPlaceholder={tt('Creator, book, Bible version or verse content')}
      hasAdditionalFilters={Boolean(data.startDate || data.endDate)}
      onClear={data.clearFilters}
    >
      <div className="grid w-full grid-cols-2 gap-2 sm:w-[22rem]">
        <div className="min-w-0 space-y-1.5 text-xs text-muted-foreground">
          <label htmlFor="daily-verse-start">{tt('From (publish date)')}</label>
          <DatePicker id="daily-verse-start" valueFormat="string" value={data.startDate} max={data.endDate || undefined}
            onChange={data.changeStartDate} onClear={() => data.changeStartDate('')} clearable
            className="h-9 text-xs" placeholder={tt('Start date')} aria-label={tt('From (publish date)')} />
        </div>
        <div className="min-w-0 space-y-1.5 text-xs text-muted-foreground">
          <label htmlFor="daily-verse-end">{tt('To (publish date)')}</label>
          <DatePicker id="daily-verse-end" valueFormat="string" value={data.endDate} min={data.startDate || undefined}
            onChange={data.changeEndDate} onClear={() => data.changeEndDate('')} clearable
            className="h-9 text-xs" placeholder={tt('End date')} aria-label={tt('To (publish date)')} />
        </div>
      </div>
    </VerseExplanationFilters>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">{data.total} {tt('results')}</span>
        <Button onClick={data.add}>{tt('Add Daily Verse')}</Button>
      </div>
      {data.page === 0 && data.loading ? (
        <AdminCardGridSkeleton count={8} dailyVerses label={tt('Loading daily verses…')} />
      ) : data.page === 0 && data.loadError ? null : data.content.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">{tt('No daily verses found.')}</p>
      ) : (
        <DailyContentGrid items={data.content} onView={data.view} onEdit={data.edit} onDelete={data.setDeleteTarget} />
      )}
      {data.loadError && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm">
          <p>{tt('Failed to load daily verses')}</p>
          <Button type="button" variant="outline" size="sm" onClick={data.retry}>{tt('Retry')}</Button>
        </div>
      )}
      {data.page > 0 && data.loading && <AdminCardGridSkeleton count={4} dailyVerses label={tt('Loading more daily verses…')} />}
      {watchEnd && <div ref={endRef} className="h-px" aria-hidden="true" />}
    <AdminDeleteDialog open={!!data.deleteTarget} onOpenChange={open => !open && data.setDeleteTarget(null)}
      title={tt('Delete Daily Verse')} description={tt('This action cannot be undone.')}
      deleting={data.deleting} onConfirm={data.confirmDelete} />
  </div>;
}
