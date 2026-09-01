/**
 * UserVerseStickyHeader — transparent-to-solid sticky header for user-facing verse/devotion pages.
 */
import { ChevronLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  label: string;
  scrolled: boolean;
  refreshing: boolean;
  onBack: () => void;
  onRefresh: () => void;
}

export function UserVerseStickyHeader({
  label,
  scrolled,
  refreshing,
  onBack,
  onRefresh,
}: Props) {
  return (
    <div
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Badge variant="outline" className="text-xs">
          {label}
        </Badge>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
