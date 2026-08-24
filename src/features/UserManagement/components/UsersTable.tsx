"use client";

import { BadgeCheck, BadgeX, Shield, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User as UserType } from "../types";
interface UsersTableProps {
  users: UserType[];
  loading: boolean;
  onSelectUser: (user: UserType) => void;
  onToggleActive: (userId: string) => void;
}
export default function UsersTable({ users, loading, onSelectUser, onToggleActive }: UsersTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }
  if (users.length === 0) {
      <div className="text-center py-12 text-muted-foreground">
        <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No users found</p>
  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => onSelectUser(user)}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            {user.profileImage ? (
              <img src={user.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-primary">{(user.name || user.username || "?").charAt(0).toUpperCase()}</span>
            )}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name || user.username}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          {/* Role */}
          <Badge
            variant={user.role === "admin" || user.role === "superadmin" ? "default" : "secondary"}
            className="text-[10px] shrink-0"
          >
            {user.role === "superadmin" ? "super admin" : user.role}
          </Badge>
          {/* Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user.isVerified ? (
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
              <BadgeX className="w-3.5 h-3.5 text-amber-400" />
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                user.isActive ? "bg-emerald-500" : "bg-stone-300",
              )}
            />
          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(user.id);
            }}
            <MoreVertical className="w-3.5 h-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
