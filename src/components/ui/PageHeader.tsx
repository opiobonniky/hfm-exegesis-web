"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRTL } from "@/providers/RTLProvider";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  onRefresh,
  refreshing,
  actions,
}: PageHeaderProps) {
  const { isRtl } = useRTL();

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="gap-1.5"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", refreshing && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}
      </div>
    </div>
  );
}
