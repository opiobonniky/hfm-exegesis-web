// Study panel wrapper with title, loading, and empty states
import { Loader2 } from "lucide-react";

interface StudyPanelProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}
export function StudyPanel({ title, subtitle, loading, empty, emptyMessage, children }: StudyPanelProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading {title}...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      {empty ? (
        <div className="py-8 text-center">
          <p className="text-xs text-muted-foreground">{emptyMessage || "No data available"}</p>
      ) : (
        children
      )}
    </div>
  );
