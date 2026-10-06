import type { ActionSectionProps } from "../types";

export function ActionSection({ title, children }: ActionSectionProps) {
  return (
    <section className="border-t border-border/70 pt-3 first:border-t-0">
      <h2 className="pb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}
