"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

interface DataCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function DataCard({
  title,
  icon: Icon,
  iconColor = "text-muted-foreground",
  iconBg = "bg-muted",
  headerAction,
  children,
  className,
  loading = false,
}: DataCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl sm:rounded-2xl border border-border/50 shadow-sm overflow-hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-border/50">
        {Icon && (
          <div
            className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center",
              iconBg,
            )}
          >
            <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", iconColor)} />
          </div>
        )}
        <h3 className="text-xs sm:text-sm font-bold text-foreground/80 flex-1">
          {title}
        </h3>
        {headerAction}
      </div>
      <div className="p-4 sm:p-5">{loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : children}</div>
    </div>
  );
}
