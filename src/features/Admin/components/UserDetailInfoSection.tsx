// UserDetailInfoSection — renders user info grids (contact, account, ministry, emergency)
"use client";

import {
  Mail, Phone, User, Calendar, MapPin, Clock, CreditCard, Smartphone,
} from "lucide-react";
import { UserInfoCard } from "./UserInfoCard";
import { tt } from '@/components/languages/hardcodedTranslate';

interface UserDetail {
  email: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  accountStatus?: string;
  subscriptionTier?: string;
  lastLogin?: string;
  loginCount?: number;
  createdOn?: string;
  ministryGroup?: string;
  servicePosition?: string;
  spiritualGifts?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString();
}
function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString();
}

export function UserDetailInfoSection({ user }: { user: UserDetail }) {
  const u = user;
  const hasExtra =
    u.ministryGroup || u.servicePosition || u.spiritualGifts || u.emergencyContactName;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserInfoCard
          title={tt("Contact Information")}
          rows={[
            { icon: <Mail className="w-4 h-4" />, label: tt("Email"), value: u.email },
            { icon: <Phone className="w-4 h-4" />, label: tt("Phone"), value: u.phoneNumber || "\u2014" },
            { icon: <User className="w-4 h-4" />, label: tt("Gender"), value: u.gender || "Not specified" },
            { icon: <Calendar className="w-4 h-4" />, label: tt("Date of Birth"), value: formatDate(u.dateOfBirth) },
            { icon: <MapPin className="w-4 h-4" />, label: tt("Marital Status"), value: u.maritalStatus || "\u2014" },
          ]}
        />
        <UserInfoCard
          title={tt("Account Details")}
          rows={[
            { icon: <CreditCard className="w-4 h-4" />, label: tt("Account Status"), value: u.accountStatus || "active" },
            { icon: <CreditCard className="w-4 h-4" />, label: tt("Subscription"), value: u.subscriptionTier || "free" },
            { icon: <Clock className="w-4 h-4" />, label: tt("Last Login"), value: formatDateTime(u.lastLogin) },
            { icon: <Smartphone className="w-4 h-4" />, label: tt("Login Count"), value: String(u.loginCount ?? 0) },
            { icon: <Calendar className="w-4 h-4" />, label: tt("Joined"), value: formatDateTime(u.createdOn) },
          ]}
        />
      </div>

      {hasExtra && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {u.ministryGroup && (
            <UserInfoCard
              title={tt("Ministry")}
              rows={[
                { label: tt("Ministry Group"), value: u.ministryGroup },
                { label: tt("Service Position"), value: u.servicePosition || "\u2014" },
                { label: tt("Spiritual Gifts"), value: u.spiritualGifts || "\u2014" },
              ]}
            />
          )}
          {u.emergencyContactName && (
            <UserInfoCard
              title={tt("Emergency Contact")}
              rows={[
                { label: tt("Name"), value: u.emergencyContactName },
                { label: tt("Phone"), value: u.emergencyContactPhone || "\u2014" },
                { label: tt("Relationship"), value: u.emergencyContactRelationship || "\u2014" },
              ]}
            />
          )}
        </div>
      )}
    </>
  );
}
