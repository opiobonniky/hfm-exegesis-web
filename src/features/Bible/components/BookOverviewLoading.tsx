// BookOverviewLoading — skeleton matching the new layout
export default function BookOverviewLoading() {
  return (
    <div className="animate-pulse">
      {/* Title skeleton */}
      <div className="bg-gradient-to-b from-muted/30 to-transparent px-4 sm:px-6 pt-8 pb-6 text-center space-y-3">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-muted" />
        <div className="mx-auto h-9 w-56 rounded bg-muted" />
        <div className="mx-auto h-4 w-40 rounded bg-muted" />
        <div className="flex justify-center gap-2">
          <div className="h-6 w-24 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="mx-auto h-3 w-48 rounded bg-muted" />
      </div>
      {/* Section skeletons */}
      <div className="px-4 sm:px-6 pt-6 space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-3/4 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
