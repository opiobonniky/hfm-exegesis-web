import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  /** Loading message displayed below the spinner */
  message?: string;
  /** Spinner color class — defaults to text-primary */
  color?: string;
  /** Custom className for the container */
  className?: string;
  /** Spinner size in pixels — defaults to 24 */
  size?: number;
  /** Optional children rendered below the message */
  children?: React.ReactNode;
}

/**
 * Shared full-page or inline loading state.
 *
 * Usage:
 * ```tsx
 * <LoadingState message="Loading verse..." />
 * <LoadingState size={32} color="text-primary" />
 * <LoadingState className="py-20" />
 * ```
 */
export function LoadingState({
  message,
  color = "text-primary",
  className,
  size = 24,
  children,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8",
        className
      )}
    >
      <Loader2
        className={cn("animate-spin", color)}
        size={size}
      />
      {message && (
        <p className="text-sm text-muted-foreground text-center">{message}</p>
      )}
      {children}
    </div>
  );
}

/**
 * Compact inline loading indicator (for buttons, rows, etc.).
 *
 * Usage:
 * ```tsx
 * <InlineLoading />
 * <InlineLoading size={14} color="text-muted-foreground" />
 * ```
 */
export function InlineLoading({
  size = 16,
  color = "text-muted-foreground",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <Loader2
      className={cn("animate-spin", color, className)}
      size={size}
    />
  );
}
