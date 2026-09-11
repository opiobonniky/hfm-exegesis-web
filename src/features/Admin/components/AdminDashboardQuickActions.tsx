// AdminDashboardQuickActions — quick action links for admin dashboard
import {
  Sun,
  BookOpen,
  BookText,
  BookMarked,
  Users,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ADMIN_QUICK_ACTIONS } from "../constants";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sun,
  BookOpen,
  BookText,
  BookMarked,
  Users,
};

const ACTION_GRADIENTS = [
  "bg-primary/50 to-primary-50/80 hover:border-amber-300 dark:from-amber-950/20 dark:to-orange-950/20",
  "bg-primary/50 to-teal-50/80 hover:border-emerald-300 dark:from-emerald-950/20 dark:to-teal-950/20",
  "bg-primary/50 to-cyan-50/80 hover:border-sky-300 dark:from-sky-950/20 dark:to-cyan-950/20",
  "bg-primary/50 to-fuchsia-50/80 hover:border-violet-300 dark:from-violet-950/20 dark:to-fuchsia-950/20",
  "bg-primary/50 to-blue-50/80 hover:border-blue-300 dark:from-blue-950/20 dark:to-indigo-950/20",
  "bg-primary/50 to-rose-50/80 hover:border-rose-300 dark:from-rose-950/20 dark:to-pink-950/20",
];

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminDashboardQuickActions({ onNavigate }: Props) {
  return (
    <Card className="relative overflow-hidden border-primary/10 bg-inherit -shadow-md shadow-primary/[0.26] dark:bg-card">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/[0.06] to-transparent pointer-events-none" />
      <div className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </span>
            Quick Actions
          </CardTitle>
          <CardDescription>Common admin tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ADMIN_QUICK_ACTIONS.map((action, index) => {
              const Icon = ICON_MAP[action.icon] || BookOpen;
              return (
                <button
                  key={action.path}
                  onClick={() => onNavigate(action.path)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl shadow-lg bg-gradient-to-br p-3 text-left overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-sm",
                    ACTION_GRADIENTS[index % ACTION_GRADIENTS.length],
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity",
                      "bg-gradient-to-br bg-muted/20",
                    )}
                  />
                  <span
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/40 group-hover:scale-105 transition-transform",
                    )}
                  >
                    <Icon className={cn("w-5 h-5", action.color)} />
                  </span>
                  <div className="relative min-w-0 flex-1">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p
                      className={`"truncate text-xs ${action.color} -foreground/70 group-hover:text-[--color] transition-colors duration-200"`}
                    >
                      {action.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    className={`relative w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0`}
                  />
                </button>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
