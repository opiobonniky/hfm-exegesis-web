// DashboardSkeleton — loading skeleton for UserDashboard
export function DashboardSkeleton() {
  return (
    <div className="min-h-full animate-pulse bg-[#f3f0e8] dark:bg-[#0d141b]">
      <div className="border-b border-[#d8d2c4] bg-[#faf8f2] pb-10 dark:border-white/10 dark:bg-[#111b24]">
        <div className="mx-auto max-w-7xl space-y-7 px-4 pt-7 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted" />
            <div className="space-y-2"><div className="w-24 h-3 bg-muted rounded" /><div className="w-40 h-6 bg-muted rounded" /></div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2"><div className="h-40 rounded-2xl bg-muted" /><div className="h-52 rounded-3xl bg-muted" /></div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-muted" />)}</div>
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]"><div className="h-96 rounded-2xl bg-muted" /><div className="h-72 rounded-2xl bg-muted" /></div>
      </div>
    </div>
  );
}
