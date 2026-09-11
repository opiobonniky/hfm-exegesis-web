// AdminSignupRateCard — one card summarizing user registration rate:
// new users this month, today, and the daily average for the month so far.
import { CalendarCheck2, TrendingUp, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  stats: {
    newUsersThisMonth?: number;
    newUsersToday?: number;
  } | null;
  loading: boolean;
}

export function AdminSignupRateCard({ stats, loading }: Props) {
  const value = (v: number | undefined) => (loading ? "—" : (v ?? 0));

  const monthToDate = value(stats?.newUsersThisMonth);
  const today = value(stats?.newUsersToday);
  // Daily average across the elapsed days of the current month.
  const dayOfMonth = new Date().getDate();
  const dailyAverage =
    loading || typeof stats?.newUsersThisMonth !== "number"
      ? "—"
      : (stats.newUsersThisMonth / dayOfMonth).toFixed(1);

  return (
    <Card className="relative overflow-hidden shadow-md duration-200 hover:-translate-y-0.5 hover:shadow-md bg-gradient-to-br from-gray-400 via-white to-gray-200 border-sky-200/80 dark:bg-card dark:from-card dark:via-card dark:to-card dark:border-border">
      <div className="absolute inset-x-0 top-0 h-1 bg- from-sky-500/60 to-cyan-400/30 dark:from-primary dark:to-primary/20" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-sky-500/30 blur-2xl opacity-25 dark:bg-primary/40" />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-primary/10 dark:text-primary">
            <UserPlus className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sign-up Rate
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tabular-nums tracking-tight">
                  {monthToDate}
                </p>
                <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  this month
                </span>
              </div>
              <div className="hidden h-8 w-px bg-border/80 sm:block" aria-hidden />
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold tabular-nums tracking-tight">
                  {today}
                </p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  today
                </span>
              </div>
              <div className="hidden h-8 w-px bg-border/80 sm:block" aria-hidden />
              <div className="flex items-baseline gap-2">
                <p className="flex items-center gap-1.5 text-lg font-bold tabular-nums tracking-tight text-primary dark:text-primary">
                  <TrendingUp className="h-4 w-4" />
                  {dailyAverage}
                </p>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  / day avg
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
