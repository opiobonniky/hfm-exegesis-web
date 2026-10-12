import { cn } from "@/lib/utils";
import { SUPPORT_CATEGORY_LABELS, SUPPORT_STATUS_META } from "../constants";
import type { SupportCategory, SupportStatus } from "../types";

export function SupportStatusBadge({ status }: { status: SupportStatus }) {
  const meta = SUPPORT_STATUS_META[status] ?? SUPPORT_STATUS_META.open;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function SupportCategoryBadge({ category }: { category: SupportCategory }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {SUPPORT_CATEGORY_LABELS[category] ?? SUPPORT_CATEGORY_LABELS.other}
    </span>
  );
}

export function SupportPriorityDot({ priority }: { priority: string }) {
  const color =
    priority === "high"
      ? "bg-red-500"
      : priority === "low"
        ? "bg-slate-400"
        : "bg-sky-500";
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} />;
}
