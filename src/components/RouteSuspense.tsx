import { Suspense, type ReactNode } from "react";
import { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
import { PageSkeleton } from "@/components/ui/skeletons";
import { LoadingState } from "@/components/ui/LoadingState";

interface RouteSuspenseProps {
  children: ReactNode;
  featureName?: string;
  /** Custom loading component — defaults to PageSkeleton */
  loading?: ReactNode;
  /** Custom error fallback */
  errorFallback?: ReactNode;
  onReset?: () => void;
}

/**
 * Wraps lazy-loaded route components with:
 * 1. React Suspense for code-splitting loading states
 * 2. FeatureErrorBoundary for runtime error recovery
 * 3. Skeleton-based loading UI
 *
 * Usage in routes:
 * ```tsx
 * <Route path="/daily-verse" element={
 *   <RouteSuspense featureName="Daily Verse">
 *     <DailyVerse />
 *   </RouteSuspense>
 * } />
 * ```
 */
export function RouteSuspense({
  children,
  featureName,
  loading,
  errorFallback,
  onReset,
}: RouteSuspenseProps) {
  return (
    <FeatureErrorBoundary featureName={featureName} fallback={errorFallback} onReset={onReset}>
      <Suspense
        fallback={
          loading ?? (
            <div className="min-h-screen bg-background">
              <PageSkeleton />
            </div>
          )
        }
      >
        {children}
      </Suspense>
    </FeatureErrorBoundary>
  );
}

/**
 * Lightweight suspense wrapper for non-page components
 * (modals, sidebars, drawers, etc.)
 */
export function ComponentSuspense({
  children,
  loading,
  className,
}: {
  children: ReactNode;
  loading?: ReactNode;
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        loading ?? (
          <div className={className}>
            <LoadingState className="py-8" size={20} />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
