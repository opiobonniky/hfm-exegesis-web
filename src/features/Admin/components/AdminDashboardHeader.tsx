// AdminDashboardHeader — header section for admin dashboard
import { LayoutDashboard } from "lucide-react";

interface Props {
  subtitle?: string;
}

export function AdminDashboardHeader({ subtitle }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
          Admin Console
        </h1>
        <p className="text-sm text-muted-foreground">
          {subtitle || "Manage your platform from one place"}
        </p>
      </div>
    </div>
  );
}
