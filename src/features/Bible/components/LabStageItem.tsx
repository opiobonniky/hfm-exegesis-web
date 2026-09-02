import { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface LabStageItemProps {
  index: number;
  stage: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export function LabStageItem({
  index,
  stage,
  icon: Icon,
  title,
  description,
  onClick,
}: LabStageItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background text-xs font-bold text-primary">
        {index + 1}
      </span>
      <Icon
        className="size-4 shrink-0 text-primary"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {description}
        </span>
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}
