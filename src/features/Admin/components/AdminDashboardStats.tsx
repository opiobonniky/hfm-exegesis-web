// AdminDashboardStats — stats row for admin dashboard
import { Users, ShieldCheck, BarChart3, UserCheck } from "lucide-react";
import { StatCard } from "./StatCard";

interface Props {
  stats: {
    totalUsers?: number;
    activeUsers?: number;
    verifiedUsers?: number;
    adminCount?: number;
  } | null;
  loading: boolean;
}

export function AdminDashboardStats({ stats, loading }: Props) {
  const value = (v: number | undefined) =>
    loading ? "—" : (v ?? "—");

  return (
    <section className="space-y-3">
      <StatsSectionHeading title="Overview" subtitle="Platform statistics at a glance" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Users"
          value={value(stats?.totalUsers)}
          icon={Users}
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Active Users"
          value={value(stats?.activeUsers)}
          icon={UserCheck}
          color="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          label="Verified"
          value={value(stats?.verifiedUsers)}
          icon={ShieldCheck}
          color="bg-sky-500/10 text-sky-600"
        />
        <StatCard
          label="Admins"
          value={value(stats?.adminCount)}
          icon={BarChart3}
          color="bg-violet-500/10 text-violet-600"
        />
      </div>
    </section>
  );
}

export function StatsSectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-6 w-1 rounded-full bg-gradient-to-b from-primary to-primary/40" />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-muted-foreground/70">{subtitle}</p>}
      </div>
    </div>
  );
}
