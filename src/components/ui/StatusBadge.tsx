"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type StatusVariant = "published" | "draft" | "active" | "inactive" | "completed" | "pending" | "error" | "success" | "info";

const STATUS_CONFIG: Record<StatusVariant, { label: string; className: string }> = {
  published: { label: "Published", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400" },
  error: { label: "Error", className: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
  success: { label: "Success", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
  info: { label: "Info", className: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
};

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  className?: string;
  dot?: boolean;
}

/**
 * Reusable status badge with predefined variants for common states.
 * Supports custom labels and optional status dot indicator.
 */
export function StatusBadge({ status, label, className, dot = false }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as StatusVariant] || { label: status, className: "bg-muted text-muted-foreground" };
  const displayLabel = label || config.label;

  return (
    <Badge variant="secondary" className={cn("text-[10px] font-semibold gap-1", config.className, className)}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {displayLabel}
    </Badge>
  );
}

/**
 * Simple published/unpublished badge — the most common status pattern.
 */
export function PublishedBadge({ isPublished }: { isPublished: boolean }) {
  return <StatusBadge status={isPublished ? "published" : "draft"} />;
}

/**
 * Active/inactive badge for toggles.
 */
export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <StatusBadge status={isActive ? "active" : "inactive"} />;
}
