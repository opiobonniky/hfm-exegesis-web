// AdminUserDetail — thin page composing hook + components (no inline HTML)
"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAdminUserDetail } from "../hooks/useAdminUserDetail";
import { USER_ROLE_MAP, SUBSCRIPTION_TIER_COLORS } from "../constants";
import { UserDetailHeader } from "../components/UserDetailHeader";
import { UserProfileCard } from "../components/UserProfileCard";
import { UserInfoCard } from "../components/UserInfoCard";
import { UserSessionsCard } from "../components/UserSessionsCard";
import {
  Mail, Phone, User, Calendar, MapPin, Clock, CreditCard, Smartphone,
} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton.tsx";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString();
}
function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString();
}

export default function AdminUserDetail() {
  const h = useAdminUserDetail();

  if (h.loading) {
    return (
     <Skeleton />
    );
  }
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

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserInfoCard
            title="Contact Information"
            rows={[
              { icon: <Mail className="w-4 h-4" />, label: "Email", value: u.email },
              { icon: <Phone className="w-4 h-4" />, label: "Phone", value: u.phoneNumber || "\u2014" },
              { icon: <User className="w-4 h-4" />, label: "Gender", value: u.gender || "Not specified" },
              { icon: <Calendar className="w-4 h-4" />, label: "Date of Birth", value: formatDate(u.dateOfBirth) },
              { icon: <MapPin className="w-4 h-4" />, label: "Marital Status", value: u.maritalStatus || "\u2014" },
            ]}
          />
          <UserInfoCard
            title="Account Details"
            rows={[
              { icon: <CreditCard className="w-4 h-4" />, label: "Account Status", value: u.accountStatus || "active" },
              { icon: <CreditCard className="w-4 h-4" />, label: "Subscription", value: u.subscriptionTier || "free" },
              { icon: <Clock className="w-4 h-4" />, label: "Last Login", value: formatDateTime(u.lastLogin) },
              { icon: <Smartphone className="w-4 h-4" />, label: "Login Count", value: String(u.loginCount ?? 0) },
              { icon: <Calendar className="w-4 h-4" />, label: "Joined", value: formatDateTime(u.createdOn) },
            ]}
          />
        </div>

        {(u.ministryGroup || u.servicePosition || u.spiritualGifts || u.emergencyContactName) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {u.ministryGroup && (
              <UserInfoCard
                title="Ministry"
                rows={[
                  { label: "Ministry Group", value: u.ministryGroup },
                  { label: "Service Position", value: u.servicePosition || "\u2014" },
                  { label: "Spiritual Gifts", value: u.spiritualGifts || "\u2014" },
                ]}
              />
            )}
            {u.emergencyContactName && (
              <UserInfoCard
                title="Emergency Contact"
                rows={[
                  { label: "Name", value: u.emergencyContactName },
                  { label: "Phone", value: u.emergencyContactPhone || "\u2014" },
                  { label: "Relationship", value: u.emergencyContactRelationship || "\u2014" },
                ]}
              />
            )}
          </div>
        )}

        <UserSessionsCard sessions={h.sessions} loading={h.sessionsLoading} />

        <div className="flex gap-2 pb-8">
          <Button variant="outline" onClick={() => h.navigate("/admin/users")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Button>
        </div>
      </div>
    </div>
  );
}
