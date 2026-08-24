// DashboardSkeleton — loading skeleton for UserDashboard
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <div className="bg-gradient-to-br from-primary/5 via-background to-background pb-8">
        <div className="max-w-7xl mx-auto px-4 pt-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-muted" />
            <div className="space-y-2"><div className="w-24 h-3 bg-muted rounded" /><div className="w-40 h-6 bg-muted rounded" /></div>
          </div>
          <div className="h-40 rounded-3xl bg-muted" />
          <div className="grid grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted" />)}</div>
        </div>
      </div>
    </div>
  );
}
