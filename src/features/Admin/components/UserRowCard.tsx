// UserRowCard — single user row for the admin users table
import { Shield, ShieldOff, CheckCircle, XCircle, Eye, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdminUser } from "../types";
import { SUBSCRIPTION_TIER_COLORS } from "../constants";
import { RoleSelector } from "./RoleSelector";

interface Props {
  user: AdminUser;
  actionLoading: string | null;
  onToggleStatus: () => void;
  onToggleVerification: () => void;
  onRoleChange: (role: number) => void;
  onView: () => void;
  onDelete: () => void;
}

export function UserRowCard({
  user,
  actionLoading,
  onToggleStatus,
  onToggleVerification,
  onRoleChange,
  onView,
  onDelete,
}: Props) {
  const isLoading = actionLoading === user.id;
  const tierColor =
    SUBSCRIPTION_TIER_COLORS[user.subscriptionTier || "free"] ||
    SUBSCRIPTION_TIER_COLORS.free;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
      {/* User name + avatar */}
      <td className="p-3">
        <div className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <Avatar
              firstName={user.firstName}
              lastName={user.lastName}
              username={user.username}
              src={user.profilePhotoUrl || undefined}
              size="md"
            />
            {/* Online / status dot */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                user.status ? "bg-emerald-500" : "bg-zinc-400"
              }`}
              title={user.status ? "Active" : "Inactive"}
            />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-sm truncate max-w-[180px]">
              {user.firstName || user.lastName
                ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                : user.username}
            </div>
            <div className="text-xs text-muted-foreground md:hidden truncate max-w-[180px] flex items-center gap-1">
              <Mail className="w-3 h-3 shrink-0" />
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

      {/* Role — inline selector */}
      <td className="p-3">
        <RoleSelector userRole={user.userRole} busy={isLoading} onRoleChange={onRoleChange} />
      </td>

      {/* Status + Verification + Tier */}
      <td className="p-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] gap-1 ${
              user.status
                ? "text-emerald-600 border-emerald-200 dark:border-emerald-900"
                : "text-zinc-500 border-zinc-300 dark:border-zinc-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${user.status ? "bg-emerald-500" : "bg-zinc-400"}`} />
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
            {user.loginCount ?? 0} login{(user.loginCount ?? 0) !== 1 ? "s" : ""} · joined{" "}
            {new Date(user.createdOn).toLocaleDateString()}
          </div>
        </div>
      </td>

      {/* Actions */}
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onView}>
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleStatus}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : user.status ? (
                  <ShieldOff className="w-3.5 h-3.5 text-destructive" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{user.status ? "Deactivate" : "Activate"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onToggleVerification}
                disabled={isLoading}
              >
                {user.emailVerified ? (
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{user.emailVerified ? "Unverify" : "Verify"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={onDelete}
                disabled={isLoading}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete user permanently</TooltipContent>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
}
