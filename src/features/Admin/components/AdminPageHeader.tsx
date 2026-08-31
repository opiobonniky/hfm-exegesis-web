// AdminPageHeader — shared back+title+add button header for admin pages (responsive)
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  onBack: () => void;
  onAdd: () => void;
  addLabel?: string;
}

export function AdminPageHeader({
  title,
  subtitle,
  icon,
  onBack,
  onAdd,
  addLabel = "Add",
}: Props) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-auto min-h-[4rem] py-2 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 truncate">
                {icon} {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={onAdd}
            className="gap-1.5 sm:gap-2 shrink-0 text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{" "}
            <span className="hidden sm:inline">{addLabel}</span>
            <span className="sm:hidden">
              {addLabel.length > 6 ? addLabel.slice(0, 5) + "…" : addLabel}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
