import { CalendarDays } from 'lucide-react';
import { useDailyVersesPage } from '../hooks/useDailyVersesPage';
import { DailyContentGrid } from '@/features/Admin/components/DailyContentGrid';
import { PaginationControls } from '@/features/Admin/components/PaginationControls';
import { AdminDeleteDialog } from '@/features/Admin/components/AdminDeleteDialog';
import { ContentLoading } from '@/features/Admin/components/ContentLoading';
import { PAGE_SIZE } from '@/features/Admin/constants';
import { tt } from '@/components/languages/hardcodedTranslate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DailyVerses() {
  const data = useDailyVersesPage();
  return <div className="space-y-6">
    <header className="flex items-center gap-3">
      <CalendarDays className="h-6 w-6 text-primary" />
      <div><h1 className="text-2xl font-bold">{tt('Daily Verses')}</h1>
        <p className="text-sm text-muted-foreground">{tt('Manage daily verses')}</p></div>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <label className="space-y-1 text-xs text-muted-foreground">{tt('Publish date')}
        <Input type="date" value={data.searchDate} onChange={event => data.changeDate(event.target.value)} />
      </label>
      {data.searchDate && <Button variant="ghost" onClick={() => data.changeDate('')}>{tt('Clear')}</Button>}
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
