// AdminDashboardStats — stats row for admin dashboard
import { Users, ShieldCheck, BarChart3 } from "lucide-react";
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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Total Users"
        value={value(stats?.totalUsers)}
        icon={Users}
        color="bg-primary/10 text-primary"
      />
      <StatCard
        label="Active Users"
        value={value(stats?.activeUsers)}
        icon={ShieldCheck}
        color="bg-emerald-500/10 text-emerald-600"
      />
      <StatCard
        label="Verified"
        value={value(stats?.verifiedUsers)}
        icon={BarChart3}
        color="bg-sky-500/10 text-sky-600"
      />
      <StatCard
        label="Admins"
        value={value(stats?.adminCount)}
        icon={Users}
        color="bg-violet-500/10 text-violet-600"
      />
    </div>
  );
}
