// PageHeader — shared page header with back button, icon, title, subtitle
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  back?: string | false;
  onBack?: () => void;
  icon?: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ back = "Back", onBack, icon, title, subtitle, action }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {back !== false && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        {icon && (
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0", iconBg || "bg-primary/10")}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
