// AdminStates — shared empty state, loading grid, search bar for admin pages
import { Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

/** Empty state with icon, message, and optional action button */
export function AdminEmptyState({ icon, title, message, onAction, actionLabel }: {
  icon: ReactNode; title: string; message: string; onAction?: () => void; actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-muted-foreground/50 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {onAction && <Button onClick={onAction} className="gap-2"><Plus className="w-4 h-4" /> {actionLabel || "Add"}</Button>}
    </div>
  );
}
/** Loading skeleton grid for card-based listings */
export function AdminLoadingGrid({ count = 6 }: { count?: number }) {
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></CardHeader>
          <CardContent><Skeleton className="h-16 w-full" /></CardContent>
        </Card>
      ))}
/** Search bar with input + button */
export function AdminSearchBar({ value, onChange, onSearch, placeholder = "Search..." }: {
  value: string; onChange: (v: string) => void; onSearch: () => void; placeholder?: string;
    <div className="flex items-center gap-3 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()} className="pl-9" />
      </div>
      <Button variant="outline" onClick={onSearch}>Search</Button>
