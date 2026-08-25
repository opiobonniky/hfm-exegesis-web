"use client";

import { BadgeCheck, BadgeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { User } from "../types";

interface UsersTableProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export default function UsersTable({ users, onUserClick }: UsersTableProps) {
  if (users.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No users found</p>;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => onUserClick(user)}
          className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary">
              {user.name?.charAt(0) || "?"}
            </span>
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          {/* Role */}
          <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] shrink-0">
            {user.role === "superadmin" ? "super admin" : user.role}
          </Badge>
          {/* Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            {user.isVerified ? (
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <BadgeX className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                user.isActive ? "bg-emerald-500" : "bg-stone-300",
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
