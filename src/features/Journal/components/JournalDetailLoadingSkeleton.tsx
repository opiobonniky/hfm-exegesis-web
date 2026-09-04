export default function JournalDetailLoadingSkeleton() {
  return (
    <div className="min-h-full bg-amber-50/30 dark:bg-stone-950">
      {[1, 2, 3].map((i) => (
        <div key={i} className="max-w-2xl mx-auto px-5 py-4">
          <div className="h-4 w-16 bg-[hsl(var(--skeleton))] rounded animate-pulse mb-3" />
          <div className="h-6 w-3/4 bg-[hsl(var(--skeleton))] rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-[hsl(var(--skeleton))] rounded animate-pulse mb-1" />
        </div>
      ))}
    </div>
  );
}
