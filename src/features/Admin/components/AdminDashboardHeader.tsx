// AdminDashboardHeader — welcome banner header for admin dashboard
import { LayoutDashboard, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  subtitle?: string;
}

export function AdminDashboardHeader({ subtitle }: Props) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-white shadow-lg shadow-primary/10 dark:bg-card">
      <CardContent className="p-0">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-[#55758f] p-6 sm:p-8">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.9),transparent_50%)]" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-white/15 text-primary-foreground shadow-inner">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <span className="mb-2 inline-flex items-center rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Control center
              </span>
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
