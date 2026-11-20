import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AdminCardGridSkeleton({ label, count, dailyVerses = false }: {
  label: string;
  count: number;
  dailyVerses?: boolean;
}) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2',
        dailyVerses ? 'xl:grid-cols-3 2xl:grid-cols-4' : 'lg:grid-cols-3')}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28 max-w-full" />
                <Skeleton className="h-3 w-14" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
