"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data",
  message,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">{title}</p>
      {message && (
        <p className="text-xs text-muted-foreground max-w-sm">{message}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
