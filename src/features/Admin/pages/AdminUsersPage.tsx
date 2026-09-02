// AdminUsersPage — thin page composing hook + components
"use client";

import { Users } from "lucide-react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid, AdminSearchBar, AdminPageContent } from "../components";
import { UsersTable } from "../components/UsersTable";

export default function AdminUsersPage() {
  const h = useAdminUsers();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="User Management"
        subtitle={`${h.totalCount || h.users.length} users`}
        icon={<Users className="w-5 h-5 text-primary" />}
        onBack={h.goBack}
        onAdd={h.openCreateUser}
        addLabel="Add User"
      />

      <AdminPageContent>
        <AdminSearchBar
          value={h.search}
          onChange={h.setSearch}
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
            onToggleStatus={h.handleToggleStatus}
            onToggleVerification={h.handleToggleVerification}
            onView={h.viewUser}
          />
        )}
      </AdminPageContent>
    </div>
  );
}
