// AdminUserDetail — thin page composing hook + components (no inline HTML)
"use client";

import { useAdminUserDetail } from "../hooks/useAdminUserDetail";
import { USER_ROLE_MAP, SUBSCRIPTION_TIER_COLORS } from "../constants";
import { UserDetailHeader } from "../components/UserDetailHeader";
import { UserProfileCard } from "../components/UserProfileCard";
import { UserInfoCard } from "../components/UserInfoCard";
import { UserSessionsCard } from "../components/UserSessionsCard";
import { UserDetailInfoSection } from "../components/UserDetailInfoSection";
import { DetailBackButton } from "../components/DetailPageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminPageContent } from "../components/AdminPageContent";

export default function AdminUserDetail() {
  const h = useAdminUserDetail();

  if (h.loading) return <Skeleton className="h-96" />;
  if (!h.user) return null;

  const u = h.user;
  const role = USER_ROLE_MAP[u.userRole] || USER_ROLE_MAP[2];
  const tierColor = SUBSCRIPTION_TIER_COLORS[u.subscriptionTier || "free"] || SUBSCRIPTION_TIER_COLORS.free;

  return (
    <div className="min-h-screen bg-background">
      <UserDetailHeader
        username={u.username}
        status={u.status}
        emailVerified={u.emailVerified}
        actionLoading={h.actionLoading}
        onBack={() => h.navigate("/admin/users")}
        onToggleStatus={h.handleToggleStatus}
        onToggleVerification={h.handleToggleVerification}
        onDelete={h.handleDelete}
      />

      <AdminPageContent className="max-w-4xl space-y-4 sm:space-y-6">
        <UserProfileCard
          firstName={u.firstName}
          lastName={u.lastName}
          username={u.username}
          profilePhotoUrl={u.profilePhotoUrl}
          status={u.status}
          emailVerified={u.emailVerified}
          userRole={u.userRole}
          subscriptionTier={u.subscriptionTier}
          role={role}
          tierColor={tierColor}
        />

        <UserDetailInfoSection user={u} />

        <UserSessionsCard sessions={h.sessions} loading={h.sessionsLoading} />

        <DetailBackButton label="Back to Users" onClick={() => h.navigate("/admin/users")} />
      </AdminPageContent>
    </div>
  );
}
