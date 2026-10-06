import { cn } from "@/lib/utils";
import type { ActionButtonProps } from "../types";
import { VERSE_ACTION_TONE_CLASSES } from "../constants";

export function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
  count,
  tone = "primary",
}: ActionButtonProps) {
  const hasCount = typeof count === "number";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-14 w-full items-center gap-3 rounded-xl px-1 py-2 text-start transition-colors hover:bg-muted/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-[10px]", VERSE_ACTION_TONE_CLASSES[tone])}>
        <Icon className="size-[19px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold leading-[19px] text-foreground">{title}</span>
        {description && (
          <span className="mt-0.5 line-clamp-2 block text-xs font-medium leading-4 text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {hasCount && (
        <span
          aria-label={`${count} entries`}
          className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold tabular-nums text-primary"
        >
          {count}
        </span>
      )}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}
