export default function DailyVerseLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-12 w-48 bg-muted rounded" />
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
