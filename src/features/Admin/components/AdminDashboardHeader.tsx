// AdminDashboardHeader — welcome banner header for admin dashboard
import { LayoutDashboard, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  subtitle?: string;
}

export function AdminDashboardHeader({ subtitle }: Props) {
  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-r from-primary via-primary/90 to-indigo-600 p-6 sm:p-8">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_55%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-primary-foreground shadow-inner">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary-foreground font-[family-name:var(--font-heading)]">
                Admin Console
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-primary-foreground/85">
                <Sparkles className="w-3.5 h-3.5" />
                {subtitle || "Manage your platform from one place"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
