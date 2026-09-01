/**
 * DailyContentPageHeader — shared page header for Add/Edit DailyContent pages.
 * Replaces the repeated back-link + icon + title + subtitle pattern.
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  /** Route to go back to */
  backTo: string;
  backLabel: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Icon color class, e.g. "text-accent" */
  iconColor?: string;
  title: string;
  subtitle: string;
}

export function DailyContentPageHeader({
  backTo,
  backLabel,
  icon: Icon,
  iconColor = "text-accent",
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex items-center gap-4">
      <Link
        to={backTo}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
      >
        ← {backLabel}
      </Link>
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shadow-sm">
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gradient">
            {title}
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
