// PageHeader — shared page header with back button, icon, title, subtitle
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface Props {
  /** Back button label or false to hide */
  back?: string | false;
  onBack?: () => void;
  /** Icon element to show left of title */
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  /** Right side action button */
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
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-sm shrink-0">
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
