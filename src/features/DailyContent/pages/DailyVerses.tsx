import { CalendarDays } from 'lucide-react';
import { useDailyVersesPage } from '../hooks/useDailyVersesPage';
import { VerseExplanationFilters } from '@/features/Admin/components/VerseExplanationFilters';
import { DailyContentGrid } from '@/features/Admin/components/DailyContentGrid';
import { PaginationControls } from '@/features/Admin/components/PaginationControls';
import { AdminDeleteDialog } from '@/features/Admin/components/AdminDeleteDialog';
import { ContentLoading } from '@/features/Admin/components/ContentLoading';
import { PAGE_SIZE } from '@/features/Admin/constants';
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

export default function DailyVerses() {
  const data = useDailyVersesPage();
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
      {data.loading ? <ContentLoading /> : !data.content.length
        ? <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">{tt('No daily verses found.')}</p>
        : <DailyContentGrid items={data.content} onView={data.view} onEdit={data.edit} onDelete={data.setDeleteTarget} />}
      <PaginationControls page={data.page} total={data.total} pageSize={PAGE_SIZE} onPageChange={data.setPage} />
    <AdminDeleteDialog open={!!data.deleteTarget} onOpenChange={open => !open && data.setDeleteTarget(null)}
      title={tt('Delete Daily Verse')} description={tt('This action cannot be undone.')}
      deleting={data.deleting} onConfirm={data.confirmDelete} />
  </div>;
}
