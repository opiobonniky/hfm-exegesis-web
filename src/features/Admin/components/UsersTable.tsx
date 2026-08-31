// UsersTable — responsive table (desktop) / card list (mobile) with infinite scroll
import { RefObject } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRowCard } from "./UserRowCard";

interface UserItem {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email: string;
  userRole: number;
  status: boolean;
  emailVerified: boolean;
  profilePhotoUrl?: string | null;
  lastLogin?: string | null;
}

interface UsersTableProps {
  users: UserItem[];
  actionLoading: string | null;
  loadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onToggleStatus: (user: UserItem) => void;
  onToggleVerification: (user: UserItem) => void;
  onView: (user: UserItem) => void;
}

export function UsersTable({
  users,
  actionLoading,
  loadingMore,
  hasMore,
  sentinelRef,
  onToggleStatus,
  onToggleVerification,
  onView,
}: UsersTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">User</th>
              <th className="text-left p-3 text-sm font-medium">Email</th>
              <th className="text-left p-3 text-sm font-medium">Role</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Last Login</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserRowCard
                key={user.id}
                user={user}
                actionLoading={actionLoading}
                onToggleStatus={() => onToggleStatus(user)}
                onToggleVerification={() => onToggleVerification(user)}
                onView={() => onView(user)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="border rounded-xl p-3 bg-card hover:shadow-sm transition-shadow"
            onClick={() => onView(user)}
          >
            <div className="flex items-center gap-3">
              {user.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                  {(user.firstName?.[0] || user.username?.[0] || "?").toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {user.firstName || user.lastName
                      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                      : user.username}
                  </p>
                  <Badge variant={user.userRole === 1 ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {user.userRole === 1 ? "Admin" : "User"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Badge variant={user.status ? "default" : "destructive"} className="text-[10px]">
                  {user.status ? "Active" : "Inactive"}
                </Badge>
                {user.emailVerified && (
                  <Badge variant="outline" className="text-[10px] text-emerald-600">Verified</Badge>
                )}
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => onToggleStatus(user)}
                  disabled={actionLoading === user.id}
                  title={user.status ? "Deactivate" : "Activate"}
                >
                  {actionLoading === user.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : user.status ? (
                    <span className="w-3.5 h-3.5 text-destructive">{"\u25CF"}</span>
                  ) : (
                    <span className="w-3.5 h-3.5 text-emerald-500">{"\u25CF"}</span>
                  )}
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-7 w-7"
                  onClick={() => onToggleVerification(user)}
                  disabled={actionLoading === user.id}
                >
                  {user.emailVerified ? "\u2713" : "\u25CB"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}
      {!hasMore && users.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-4">
          All users loaded
        </p>
      )}
    </>
  );
}
