// SubscriptionTierCard — tier list item for subscription management
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  id: string;
  name: string;
  price: number;
  interval: string;
  description: string | null;
  features: string[];
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubscriptionTierCard({ name, price, interval, description, features, isActive, onEdit, onDelete }: Props) {
  return (
    <div className="p-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-sm">{name}</p>
            {isActive ? (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
            )}
          </div>
          <p className="text-sm font-bold text-primary">${price}/{interval === "none" ? "free" : interval}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {features.map((f, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={onEdit}><Edit2 className="w-4 h-4 text-foreground/60" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}><Trash2 className="w-4 h-4 text-foreground/60" /></Button>
        </div>
      </div>
    </div>
  );
}
