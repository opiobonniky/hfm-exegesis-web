import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Page Skeleton ────────────────────────────────────────────────────────────

export function PageSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("min-h-screen bg-background p-4 sm:p-6 lg:p-8 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Content */}
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ─── Card Skeleton ────────────────────────────────────────────────────────────

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

// ─── Card Grid Skeleton ──────────────────────────────────────────────────────

export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Table Skeleton ──────────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-muted/50 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 px-5 py-3 border-b border-border/50 last:border-0">
          {Array.from({ length: cols }).map((_, col) => (
            <Skeleton key={col} className={cn("h-3", col === 0 ? "w-24" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── List Skeleton ───────────────────────────────────────────────────────────

export function ListSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Stats Skeleton ──────────────────────────────────────────────────────────

export function StatsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Tabs Skeleton ───────────────────────────────────────────────────────────

export function TabsSkeleton({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-9 rounded-lg" style={{ width: `${60 + Math.random() * 40}px` }} />
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ─── Profile Skeleton ────────────────────────────────────────────────────────

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard Skeleton ──────────────────────────────────────────────────────

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border p-5 space-y-3">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border p-5 space-y-3">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Verse Skeleton ──────────────────────────────────────────────────────────

export function VerseSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── Quiz Skeleton ───────────────────────────────────────────────────────────

export function QuizSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
