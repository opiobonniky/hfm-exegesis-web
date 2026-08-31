// AdminUserDetail — full detail view for a single user
"use client";

import {
  ArrowLeft,
  Loader2,
  Shield,
  ShieldOff,
  CheckCircle,
  XCircle,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/Avatar";
import { useAdminUserDetail } from "../hooks/useAdminUserDetail";
import { USER_ROLE_MAP, SUBSCRIPTION_TIER_COLORS } from "../constants";

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminUserDetail() {
  const h = useAdminUserDetail();

  if (h.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!h.user) return null;

  const u = h.user;
  const role = USER_ROLE_MAP[u.userRole] || USER_ROLE_MAP[2];
  const tierColor =
    SUBSCRIPTION_TIER_COLORS[u.subscriptionTier || "free"] || SUBSCRIPTION_TIER_COLORS.free;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-auto min-h-[4rem] py-2 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={() => h.navigate("/admin/users")} className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate">User Detail</h1>
                <p className="text-xs text-muted-foreground truncate">@{u.username}</p>
              </div>
            </div>

            {/* Actions — wrap on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={h.handleToggleStatus}
                disabled={h.actionLoading}
                className="gap-1.5 text-xs"
              >
                {u.status ? (
                  <ShieldOff className="w-3.5 h-3.5 text-destructive" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {u.status ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={h.handleToggleVerification}
                disabled={h.actionLoading}
                className="gap-1.5"
              >
                {u.emailVerified ? (
                  <XCircle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {u.emailVerified ? "Unverify" : "Verify"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={h.handleDelete}
                disabled={h.actionLoading}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar
                firstName={u.firstName}
                lastName={u.lastName}
                username={u.username}
                src={u.profilePhotoUrl || undefined}
                size="lg"
                className="w-16 h-16 text-xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold">
                    {u.firstName || u.lastName
                      ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                      : u.username}
                  </h2>
                  <Badge variant="outline" className={`text-[10px] font-semibold ${role.color}`}>
                    {role.label}
                  </Badge>
                  <Badge variant={u.status ? "default" : "destructive"} className="text-[10px]">
                    {u.status ? "Active" : "Inactive"}
                  </Badge>
                  {u.emailVerified && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Verified
                    </Badge>
                  )}
                  {u.subscriptionTier && u.subscriptionTier !== "free" && (
                    <Badge variant="outline" className={`text-[10px] ${tierColor}`}>
                      {u.subscriptionTier}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">@{u.username}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={u.email} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={u.phoneNumber || "—"} />
              <InfoRow
                icon={<User className="w-4 h-4" />}
                label="Gender"
                value={u.gender || "Not specified"}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4" />}
                label="Date of Birth"
                value={formatDate(u.dateOfBirth)}
              />
              <InfoRow
                icon={<MapPin className="w-4 h-4" />}
                label="Marital Status"
                value={u.maritalStatus || "—"}
              />
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Account Status" value={u.accountStatus || "active"} />
              <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Subscription" value={u.subscriptionTier || "free"} />
              <InfoRow icon={<Clock className="w-4 h-4" />} label="Last Login" value={formatDateTime(u.lastLogin)} />
              <InfoRow icon={<Smartphone className="w-4 h-4" />} label="Login Count" value={String(u.loginCount ?? 0)} />
              <InfoRow icon={<Calendar className="w-4 h-4" />} label="Joined" value={formatDateTime(u.createdOn)} />
            </CardContent>
          </Card>
        </div>

        {/* Ministry / Emergency */}
        {(u.ministryGroup || u.servicePosition || u.spiritualGifts || u.emergencyContactName) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {u.ministryGroup && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Ministry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Ministry Group" value={u.ministryGroup} />
                  <InfoRow label="Service Position" value={u.servicePosition || "—"} />
                  <InfoRow label="Spiritual Gifts" value={u.spiritualGifts || "—"} />
                </CardContent>
              </Card>
            )}
            {u.emergencyContactName && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow label="Name" value={u.emergencyContactName} />
                  <InfoRow label="Phone" value={u.emergencyContactPhone || "—"} />
                  <InfoRow label="Relationship" value={u.emergencyContactRelationship || "—"} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Login sessions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Login Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {h.sessionsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : h.sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sessions recorded</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {h.sessions.slice(0, 20).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        s.success ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs">{s.deviceType || "Unknown"}</span>
                        {s.browser && (
                          <span className="text-xs text-muted-foreground">{s.browser}</span>
                        )}
                        {s.os && <span className="text-xs text-muted-foreground">({s.os})</span>}
                      </div>
                      {s.ipAddress && (
                        <span className="text-[10px] text-muted-foreground">{s.ipAddress}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-muted-foreground">
                        {formatDateTime(s.loggedInAt)}
                      </div>
                      {s.loggedOutAt && (
                        <div className="text-[10px] text-muted-foreground/60">
                          → {formatDateTime(s.loggedOutAt)}
                        </div>
                      )}
                    </div>
                    {!s.success && s.failureReason && (
                      <Badge variant="destructive" className="text-[10px] shrink-0">
                        {s.failureReason}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom actions */}
        <div className="flex gap-2 pb-8">
          <Button variant="outline" onClick={() => h.navigate("/admin/users")} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}
