import { ChevronRight } from "lucide-react";
import type { LabStageItemProps } from "../types";

export function LabStageItem({
  index,
  title,
  description,
  onClick,
}: LabStageItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-14 w-full items-center gap-3 rounded-xl px-1 py-2 text-start transition-colors hover:bg-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-extrabold text-primary">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-[19px] text-foreground">
          {title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs font-medium leading-4 text-muted-foreground">
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
