import { Loader2 } from "lucide-react";

interface StudyPanelProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}

export function StudyPanel({ title, subtitle, loading, empty, emptyMessage = "No data available", children }: StudyPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-4"><h3 className="text-sm font-bold text-foreground">{title}</h3>{subtitle && <p className="mt-0.5 text-[10px] text-muted-foreground">{subtitle}</p>}</div>
      {loading ? <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" />Loading {title}...</div> : empty ? <div className="py-8 text-center text-xs text-muted-foreground">{emptyMessage}</div> : children}
    </div>
  );
}
