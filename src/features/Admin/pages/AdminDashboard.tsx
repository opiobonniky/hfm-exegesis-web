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
      className="relative min-h-full overflow-hidden bg-[#f6f8fb] p-4 sm:p-6 lg:p-8 dark:bg-background"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,91,117,0.12),transparent_34%),radial-gradient(circle_at_15%_35%,rgba(58,91,117,0.06),transparent_28%)] dark:bg-none" />
      <div className="relative mx-auto max-w-[1600px] space-y-8">
        {/* <AdminDashboardHeader /> */}
        <AdminDashboardStats stats={data.stats} loading={data.loading} />
        <AdminDashboardTools onNavigate={navigate} />
        <AdminDashboardQuickActions onNavigate={navigate} />
      </div>
    </div>
  );
};

export default AdminDashboard;
