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
  const { data, actions } = useAdminUserDetail();

  if (data.loading) return <Skeleton className="h-96" />;
  if (!data.user) return null;

  const role = USER_ROLE_MAP[data.user.userRole] || USER_ROLE_MAP[2];
  const tierColor = SUBSCRIPTION_TIER_COLORS[data.user.subscriptionTier || "free"] || SUBSCRIPTION_TIER_COLORS.free;

  return (
    <div className="min-h-screen bg-background">
      <UserDetailHeader
        username={data.user.username}
        status={data.user.status}
        emailVerified={data.user.emailVerified}
        actionLoading={data.actionLoading}
        onBack={() => actions.navigate("/admin/users")}
        onToggleStatus={actions.handleToggleStatus}
        onToggleVerification={actions.handleToggleVerification}
        onDelete={actions.handleDelete}
      />

      <AdminPageContent className="max-w-4xl space-y-4 sm:space-y-6">
        <UserProfileCard
          firstName={data.user.firstName}
          lastName={data.user.lastName}
          username={data.user.username}
          profilePhotoUrl={data.user.profilePhotoUrl}
          status={data.user.status}
          emailVerified={data.user.emailVerified}
          userRole={data.user.userRole}
          subscriptionTier={data.user.subscriptionTier}
          role={role}
          tierColor={tierColor}
        />

        <UserDetailInfoSection user={data.user} />

        <UserSessionsCard sessions={data.sessions} loading={data.sessionsLoading} />

        <DetailBackButton label="Back to Users" onClick={() => actions.navigate("/admin/users")} />
      </AdminPageContent>
    </div>
  );
}
