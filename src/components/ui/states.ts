// Barrel export for shared state components
export { LoadingState, InlineLoading } from "./LoadingState";
export type { LoadingStateProps } from "./LoadingState";

export { ErrorState } from "./ErrorState";
export type { ErrorStateProps } from "./ErrorState";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export {
  PageSkeleton, CardSkeleton, CardGridSkeleton, TableSkeleton,
  ListSkeleton, StatsSkeleton, TabsSkeleton, ProfileSkeleton,
  DashboardSkeleton, VerseSkeleton, QuizSkeleton,
} from "./skeletons";

export { FeatureErrorBoundary } from "@/components/FeatureErrorBoundary";
export { RouteSuspense, ComponentSuspense } from "@/components/RouteSuspense";
