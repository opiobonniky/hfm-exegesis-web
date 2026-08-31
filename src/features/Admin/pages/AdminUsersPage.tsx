// AdminUsersPage — thin page composing hook + components (responsive)
import { useNavigate } from "react-router-dom";
import { Users, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid } from "../components";
import { UserRowCard } from "../components/UserRowCard";

export default function AdminUsersPage() {
  const h = useAdminUsers();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="User Management"
        subtitle={`${h.totalCount || h.users.length} users`}
        icon={<Users className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => navigate("/admin/users/create")}
        addLabel="Add User"
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={h.search}
              onChange={(e) => h.setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Users list */}
        {h.loading && h.users.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.users.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="w-12 h-12" />}
            title="No users found"
            description={h.search ? `No results for "${h.search}"` : undefined}
          />
        ) : (
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
                  {h.users.map((user) => (
                    <UserRowCard
                      key={user.id}
                      user={user}
                      actionLoading={h.actionLoading}
                      onToggleStatus={() => h.handleToggleStatus(user)}
                      onToggleVerification={() => h.handleToggleVerification(user)}
                      onView={() => navigate(`/admin/users/${user.id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {h.users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-xl p-3 bg-card hover:shadow-sm transition-shadow"
                  onClick={() => navigate(`/admin/users/${user.id}`)}
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
                        onClick={() => h.handleToggleStatus(user)}
                        disabled={h.actionLoading === user.id}
                        title={user.status ? "Deactivate" : "Activate"}
                      >
                        {h.actionLoading === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : user.status ? (
                          <span className="w-3.5 h-3.5 text-destructive">⬤</span>
                        ) : (
                          <span className="w-3.5 h-3.5 text-emerald-500">⬤</span>
                        )}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => h.handleToggleVerification(user)}
                        disabled={h.actionLoading === user.id}
                      >
                        {user.emailVerified ? "✓" : "○"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={h.sentinelRef} className="h-4" />

            {h.loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!h.hasMore && h.users.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">
                All users loaded
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
