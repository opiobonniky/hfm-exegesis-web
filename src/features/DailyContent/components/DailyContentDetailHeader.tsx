/**
 * DailyContentDetailHeader — shared sticky header for DailyContent detail pages.
 * Replaces the repeated sticky header + back button + title + edit button pattern.
 */
import { ReactNode } from "react";
import { ArrowLeft, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  onBack: () => void;
  onEdit?: () => void;
  editLabel?: string;
}

export function DailyContentDetailHeader({
  title,
  subtitle,
  icon: Icon,
  onBack,
  onEdit,
  editLabel = "Edit",
}: Props) {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> {editLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
