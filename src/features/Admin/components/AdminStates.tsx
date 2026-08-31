import { Search, Loader2 } from "lucide-react";

export function AdminSearchBar({
  value, onChange, onSearch, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          placeholder={placeholder || "Search..."}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </div>
  );
}

export function AdminEmptyState({
  icon, title, description, message, onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  message?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {(description || message) && <p className="text-sm text-muted-foreground mt-1">{description || message}</p>}
      {onAction && (
        <button onClick={onAction} className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          Get Started
        </button>
      )}
    </div>
  );
}

export function AdminLoadingGrid() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
