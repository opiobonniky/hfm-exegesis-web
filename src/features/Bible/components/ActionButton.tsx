import { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
};

export function ActionButton({
  icon: Icon,
  title,
  description,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 text-start transition-colors hover:border-primary/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-muted-foreground/60 rtl:rotate-180" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  );
}
