import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface ErrorStateProps {
  /** Error message to display */
  message: string;
  /** Optional title/heading */
  title?: string;
  /** Icon color class — defaults to text-destructive */
  iconColor?: string;
  /** Custom className for the container */
  className?: string;
  /** Retry callback — hides button if not provided */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
  /** Icon size in pixels — defaults to 36 */
  iconSize?: number;
}

/**
 * Shared error state with optional retry button.
 *
 * Usage:
 * ```tsx
 * <ErrorState message="Failed to load data" onRetry={() => refetch()} />
 * <ErrorState title="Something went wrong" message={error.message} />
 * ```
 */
export function ErrorState({
  message,
  title,
  iconColor = "text-destructive",
  className,
  onRetry,
  retryLabel = "Try again",
  iconSize = 36,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8 text-center",
        className
      )}
    >
      <AlertCircle
        className={cn("shrink-0", iconColor)}
        size={iconSize}
        strokeWidth={1.5}
      />
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="default"
          size="sm"
          onClick={onRetry}
          className="mt-2 gap-2"
        >
          <RefreshCw size={14} />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
