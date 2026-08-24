export default function JournalDetailLoadingSkeleton() {
  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950">
      {[1, 2, 3].map((i) => (
        <div key={i} className="max-w-2xl mx-auto px-5 py-4">
          <div className="h-4 w-16 bg-muted rounded animate-pulse mb-3" />
          <div className="h-6 w-3/4 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-muted dark:bg-stone-800/50 rounded animate-pulse mb-1" />
        </div>
      ))}
    </div>
  );
}
