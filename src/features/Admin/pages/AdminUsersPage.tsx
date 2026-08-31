// AdminUsersPage — thin page composing hook + components (no inline HTML)
"use client";

import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid, AdminSearchBar } from "../components";
import { UsersTable } from "../components/UsersTable";

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
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
          onSearch={() => {}}
          placeholder="Search users..."
        />

        {h.loading && h.users.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.users.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="w-12 h-12" />}
            title="No users found"
            description={h.search ? `No results for "${h.search}"` : undefined}
          />
        ) : (
          <UsersTable
            users={h.users}
            actionLoading={h.actionLoading}
            loadingMore={h.loadingMore}
            hasMore={h.hasMore}
            sentinelRef={h.sentinelRef}
            onToggleStatus={(user) => h.handleToggleStatus(user)}
            onToggleVerification={(user) => h.handleToggleVerification(user)}
            onView={(user) => navigate(`/admin/users/${user.id}`)}
          />
        )}
      </div>
    </div>
  );
}
