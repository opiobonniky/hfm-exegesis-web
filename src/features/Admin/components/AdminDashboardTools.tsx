// AdminDashboardTools — tools grid for admin dashboard
import {
  Sparkles, CalendarDays, CreditCard, ScrollText,
  Lightbulb, BookOpen, ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ADMIN_TOOLS } from "../constants";
import type { LucideIcon } from "lucide-react";
import { StatsSectionHeading } from "./AdminDashboardStats";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  CalendarDays,
  CreditCard,
  ScrollText,
  Lightbulb,
  BookOpen,
};

const TOOL_GRADIENTS = [
  "from-amber-50 via-white to-orange-50 border-amber-200/80 dark:from-amber-950/20 dark:via-card dark:to-orange-950/20",
  "from-emerald-50 via-white to-teal-50 border-emerald-200/80 dark:from-emerald-950/20 dark:via-card dark:to-teal-950/20",
  "from-rose-50 via-white to-pink-50 border-rose-200/80 dark:from-rose-950/20 dark:via-card dark:to-pink-950/20",
  "from-sky-50 via-white to-cyan-50 border-sky-200/80 dark:from-sky-950/20 dark:via-card dark:to-cyan-950/20",
  "from-violet-50 via-white to-fuchsia-50 border-violet-200/80 dark:from-violet-950/20 dark:via-card dark:to-fuchsia-950/20",
  "from-indigo-50 via-white to-blue-50 border-indigo-200/80 dark:from-indigo-950/20 dark:via-card dark:to-blue-950/20",
];

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminDashboardTools({ onNavigate }: Props) {
  return (
    <section className="space-y-3">
      <StatsSectionHeading
        title="Management Tools"
        subtitle="Jump into any admin area"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ADMIN_TOOLS.map((tool, index) => {
          const Icon = ICON_MAP[tool.icon] || Sparkles;
          return (
            <button
              key={tool.path}
              onClick={() => onNavigate(tool.path)}
              className="group text-left w-full"
            >
              <Card className={cn(
                "relative h-full bg-gradient-to-br hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden",
                TOOL_GRADIENTS[index % TOOL_GRADIENTS.length],
              )}>
                <div
                  className={cn(
                    "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl opacity-25 transition-opacity duration-200 group-hover:opacity-40",
                    tool.color.replace(/dark:bg-[^\s]+/, "").replace("text-", "bg-").split(/\s+/)[0],
                  )}
                />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/[0.05] to-transparent pointer-events-none" />
                <CardContent className="relative p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110",
                        tool.color,
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm sm:text-base mb-1">
                          {tool.title}
                        </h3>
                        <span className="text-[10px] font-bold text-muted-foreground/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
