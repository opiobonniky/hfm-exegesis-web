// AdminDashboard — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAdminDashboardPage } from "../hooks/useAdminDashboardPage";
import { AdminDashboardHeader } from "../components/AdminDashboardHeader";
import { AdminDashboardStats } from "../components/AdminDashboardStats";
import { AdminDashboardTools } from "../components/AdminDashboardTools";
import { AdminDashboardQuickActions } from "../components/AdminDashboardQuickActions";

const AdminDashboard = () => {
  const { data, actions } = useAdminDashboardPage();
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  return (
    <div
      className="min-h-full bg-gradient-to-br from-slate-50/80 via-background to-primary/[0.03] p-4 sm:p-6 lg:p-8 space-y-7 dark:from-background dark:via-background dark:to-primary/[0.04]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <AdminDashboardHeader />
      <AdminDashboardStats stats={data.stats} loading={data.loading} />
      <AdminDashboardTools onNavigate={navigate} />
      <AdminDashboardQuickActions onNavigate={navigate} />
    </div>
  );
};

export default AdminDashboard;
