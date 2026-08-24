"use client";

import { useAdminDashboardPage } from "../hooks/useAdminDashboardPage";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BookText,
  Sparkles,
  CalendarDays,
  CreditCard,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  BookOpen,
  BookMarked,
  Sun,
  ArrowRight,
  BarChart3,
} from "lucide-react";
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
interface DashboardStats {
  totalUsers?: number;
  activeUsers?: number;
  verifiedUsers?: number;
  adminCount?: number;
  newUsersToday?: number;
}
interface ToolCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
  stat?: string | number;
const AdminDashboard = () => {
  const h = useAdminDashboardPage();
    {
      title: "Trivia Management",
      description: "Create and manage Bible trivia questions and stats",
      icon: Sparkles,
      path: "/admin/trivia",
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15",
    },
      title: "Daily Content",
      description: "Manage daily verses, devotions, and exegesis",
      icon: CalendarDays,
      path: "/admin/daily-content",
      color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15",
      title: "Subscriptions",
      description: "Manage subscription tiers and subscribers",
      icon: CreditCard,
      path: "/admin/subscriptions",
      color: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15",
      title: "Activity Log",
      description: "View all user login activity across the platform",
      icon: Activity,
      path: "/admin/activity-log",
      color: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15",
  ];
  const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">
              {loading ? <Skeleton className="h-7 w-10 rounded inline-block" /> : value ?? "—"}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">
            Admin Console
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {userInfo?.firstName || "Admin"} — manage your platform from one place
          </p>
      </div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="bg-primary/10 text-primary" />
        <StatCard label="Active Users" value={stats?.activeUsers} icon={ShieldCheck} color="bg-emerald-500/10 text-emerald-600" />
        <StatCard label="Verified" value={stats?.verifiedUsers} icon={BarChart3} color="bg-sky-500/10 text-sky-600" />
        <StatCard label="Admins" value={stats?.adminCount} icon={Users} color="bg-violet-500/10 text-violet-600" />
      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.path}
              onClick={() => navigate(tool.path)}
              className="group text-left w-full"
            >
              <Card className="border-border/50 h-full hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110", tool.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm sm:text-base">{tool.title}</h3>
                        {tool.stat !== undefined && (
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {tool.stat}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      {/* Quick Links Section */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common admin tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              onClick={() => navigate("/add-daily-verse")}
              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all text-left"
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium">Add Daily Verse</p>
                <p className="text-xs text-muted-foreground">Schedule a new verse</p>
              </div>
              onClick={() => navigate("/add-daily-devotion")}
              <BookOpen className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-sm font-medium">Add Devotion</p>
                <p className="text-xs text-muted-foreground">Create a new devotion</p>
              onClick={() => navigate("/add-reading-plan")}
              <BookText className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-sm font-medium">Create Reading Plan</p>
                <p className="text-xs text-muted-foreground">Build a new plan</p>
              onClick={() => navigate("/add-explanation")}
              <BookMarked className="w-5 h-5 text-violet-500 shrink-0" />
                <p className="text-sm font-medium">Add Explanation</p>
                <p className="text-xs text-muted-foreground">Write verse explanation</p>
        </CardContent>
      </Card>
    </div>
};
export default AdminDashboard;
