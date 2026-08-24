// AdminPageHeader — shared back+title+add button header for admin pages
import { ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface Props {
  title: string; subtitle?: string;
  icon: ReactNode;
  onBack: () => void; onAdd: () => void;
  addLabel?: string;
}

export function AdminPageHeader({ title, subtitle, icon, onBack, onAdd, addLabel = "Add" }: Props) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-lg font-semibold flex items-center gap-2">{icon} {title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <Button onClick={onAdd} className="gap-2"><Plus className="w-4 h-4" /> {addLabel}</Button>
        </div>
      </div>
    </div>
  );
}
