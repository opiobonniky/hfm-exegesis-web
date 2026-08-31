// UserRowCard — single user row for the admin users table
import { Shield, ShieldOff, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminUser } from "../types";
import { USER_ROLE_MAP, SUBSCRIPTION_TIER_COLORS } from "../constants";

interface Props {
  user: AdminUser;
  actionLoading: string | null;
  onToggleStatus: () => void;
  onToggleVerification: () => void;
  onView: () => void;
}

export function UserRowCard({
  user,
  actionLoading,
  onToggleStatus,
  onToggleVerification,
  onView,
}: Props) {
  const isLoading = actionLoading === user.id;
  const role = USER_ROLE_MAP[user.userRole] || USER_ROLE_MAP[2];
  const tierColor =
    SUBSCRIPTION_TIER_COLORS[user.subscriptionTier || "free"] ||
    SUBSCRIPTION_TIER_COLORS.free;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      {/* User name + avatar */}
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            username={user.username}
            src={user.profilePhotoUrl || undefined}
            size="md"
          />
          <div>
            <div className="font-medium text-sm">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.username}
            </div>
            <div className="text-xs text-muted-foreground md:hidden truncate max-w-[180px]">
              {user.email}
            </div>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="p-3 hidden md:table-cell">
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {user.email}
        </span>
      </td>

      {/* Role */}
      <td className="p-3">
        <Badge variant="outline" className={`text-[10px] font-semibold ${role.color}`}>
          {role.label}
        </Badge>
      </td>

      {/* Status + Verification + Tier */}
      <td className="p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant={user.status ? "default" : "destructive"} className="text-[10px]">
            {user.status ? "Active" : "Inactive"}
          </Badge>
          {user.emailVerified && (
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Verified
            </Badge>
          )}
          {user.subscriptionTier && user.subscriptionTier !== "free" && (
            <Badge variant="outline" className={`text-[10px] ${tierColor}`}>
              {user.subscriptionTier}
            </Badge>
          )}
        </div>
      </td>

      {/* Last login / Joined */}
      <td className="p-3 hidden lg:table-cell">
        <div className="text-xs text-muted-foreground">
          <div>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</div>
          <div className="text-[10px] opacity-60">
            {user.loginCount ?? 0} login{(user.loginCount ?? 0) !== 1 ? "s" : ""}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-0.5">
          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onView}
            title="View details"
          >
            <Eye className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>

          {/* Toggle status */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleStatus}
            disabled={isLoading}
            title={user.status ? "Deactivate" : "Activate"}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : user.status ? (
              <ShieldOff className="w-3.5 h-3.5 text-destructive" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </Button>

          {/* Toggle verification */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggleVerification}
            disabled={isLoading}
            title={user.emailVerified ? "Unverify" : "Verify"}
          >
            {user.emailVerified ? (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
}
