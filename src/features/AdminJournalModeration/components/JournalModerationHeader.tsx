import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
}

export function JournalModerationHeader({ refreshing, onRefresh }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Journal Moderation</h1>
        <p className="text-sm text-muted-foreground">Review and moderate public journal entries</p>
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={refreshing}>
        <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} /> Refresh
      </Button>
    </div>
  );
}
