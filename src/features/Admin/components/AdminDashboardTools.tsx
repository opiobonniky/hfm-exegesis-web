// AdminDashboardTools — tools grid for admin dashboard
import {
  Sparkles, CalendarDays, CreditCard, ScrollText,
  Lightbulb, BookOpen, ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ADMIN_TOOLS } from "../constants";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  CalendarDays,
  CreditCard,
  ScrollText,
  Lightbulb,
  BookOpen,
};

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminDashboardTools({ onNavigate }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ADMIN_TOOLS.map((tool) => {
        const Icon = ICON_MAP[tool.icon] || Sparkles;
        return (
          <button
            key={tool.path}
            onClick={() => onNavigate(tool.path)}
            className="group text-left w-full"
          >
            <Card className="border-border/50 h-full hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <CardContent className="p-5 sm:p-6">
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
                    <h3 className="font-semibold text-sm sm:text-base mb-1">
                      {tool.title}
                    </h3>
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
  );
}
