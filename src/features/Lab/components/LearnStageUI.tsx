import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceButtonProps {
  icon: React.ReactNode; label: string; sublabel?: string; color?: string; onClick?: () => void; disabled?: boolean;
}
export function ResourceButton({ icon, label, sublabel, color = "bg-violet-100 text-violet-700", onClick, disabled }: ResourceButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-all text-left", disabled && "opacity-50 cursor-not-allowed")}>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", color)}>{icon}</div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground truncate">{label}</p>{sublabel && <p className="text-xs text-muted-foreground truncate">{sublabel}</p>}</div>
    </button>
  );
export function EmptyPanel({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">{icon}</div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
export function PanelShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="p-5">{children}</div>
export function LoadingPanel({ color = "violet" }: { color?: "amber" | "blue" | "violet" | "emerald" }) {
  const colorMap = { amber: "text-amber-500", blue: "text-blue-500", violet: "text-violet-500", emerald: "text-emerald-500" };
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className={cn("w-6 h-6 animate-spin", colorMap[color])} />
      <p className="text-sm text-muted-foreground mt-3">Loading...</p>
