import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StableLoadingContentProps {
  loading: boolean;
  idle: ReactNode;
  pending: ReactNode;
  className?: string;
}

/** Keeps both translated DOM branches mounted so Google cannot break React reconciliation. */
export function StableLoadingContent({ loading, idle, pending, className }: StableLoadingContentProps) {
  return (
    <span className={cn("grid place-items-center", className)}>
      <span className={cn("col-start-1 row-start-1 inline-flex items-center gap-2", loading && "invisible")} aria-hidden={loading}>
        {idle}
      </span>
      <span className={cn("col-start-1 row-start-1 inline-flex items-center gap-2", !loading && "invisible")} aria-hidden={!loading}>
        {pending}
      </span>
    </span>
  );
}
