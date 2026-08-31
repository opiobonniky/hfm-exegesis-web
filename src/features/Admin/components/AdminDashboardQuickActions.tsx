// AdminDashboardQuickActions — quick action links for admin dashboard
import {
  Sun, BookOpen, BookText, BookMarked, Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

interface Props {
  onNavigate: (path: string) => void;
}

export function AdminDashboardQuickActions({ onNavigate }: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common admin tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ADMIN_QUICK_ACTIONS.map((action) => {
            const Icon = ICON_MAP[action.icon] || BookOpen;
            return (
              <button
                key={action.path}
                onClick={() => onNavigate(action.path)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all text-left"
              >
                <Icon
                  className={cn("w-5 h-5 shrink-0", action.color)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{action.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
