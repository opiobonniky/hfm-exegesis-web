// BookOverviewLoading — skeleton matching the new layout
export default function BookOverviewLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl animate-pulse">
      {/* Title skeleton */}
      <div className="border-b border-border/70 bg-card px-5 py-9 text-center sm:px-8 sm:py-12">
        <div className="mx-auto mb-5 size-14 rounded-2xl bg-muted sm:size-16" />
        <div className="mx-auto mb-3 h-3 w-32 rounded bg-muted" />
        <div className="mx-auto h-11 w-56 rounded bg-muted sm:h-12" />
        <div className="mx-auto mt-3 h-4 w-40 rounded bg-muted" />
        <div className="mt-5 flex justify-center gap-2">
          <div className="h-6 w-24 rounded-full bg-muted" />
          <div className="h-6 w-20 rounded-full bg-muted" />
        </div>
        <div className="mx-auto mt-7 flex max-w-xl justify-center gap-3 border-t border-border/70 pt-5">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
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
