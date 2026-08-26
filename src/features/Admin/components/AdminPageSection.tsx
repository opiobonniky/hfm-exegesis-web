// AdminPageSection — reusable section wrapper with title, description, and action button
import { Plus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";

interface Props {
  title: string;
  count?: number;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
  onRefresh?: () => void;
  children: ReactNode;
}
export function AdminPageSection({ title, count, actionLabel, onAction, loading, onRefresh, children }: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base">
            {title}
            {count !== undefined && <span className="text-muted-foreground font-normal ml-1">({count})</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="h-8 gap-1">
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Refresh
              </Button>
            )}
            {actionLabel && onAction && (
              <Button size="sm" onClick={onAction} className="h-8 gap-1">
                <Plus className="w-3.5 h-3.5" /> {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
