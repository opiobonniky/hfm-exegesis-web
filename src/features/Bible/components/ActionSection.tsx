import { LucideIcon } from "lucide-react";

interface ActionSectionProps {
  title: string;
  children: React.ReactNode;
  gridCols?: string;
}

export function ActionSection({ title, children, gridCols = "grid-cols-1 gap-2 sm:grid-cols-2" }: ActionSectionProps) {
  return (
    <section className="space-y-2.5">
      <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className={`grid ${gridCols}`}>
        {children}
      </div>
    </section>
  );
}
