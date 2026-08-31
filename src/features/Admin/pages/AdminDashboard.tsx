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
  const h = useAdminDashboardPage();
  const navigate = useNavigate();
  const { isRtl } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <AdminDashboardHeader />
      <AdminDashboardStats stats={h.stats} loading={h.loading} />
      <AdminDashboardTools onNavigate={navigate} />
      <AdminDashboardQuickActions onNavigate={navigate} />
    </div>
  );
};

export default AdminDashboard;
