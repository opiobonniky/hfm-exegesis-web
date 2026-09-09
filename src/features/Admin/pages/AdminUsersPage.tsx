// AdminUsersPage — thin page composing hook + components
"use client";

import { Users } from "lucide-react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid, AdminSearchBar, AdminPageContent } from "../components";
import { UsersTable } from "../components/UsersTable";

export default function AdminUsersPage() {
  const { data, actions } = useAdminUsers();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="User Management"
        subtitle={`${data.totalCount || data.users.length} users`}
        icon={<Users className="w-5 h-5 text-primary" />}
        onBack={actions.goBack}
        onAdd={actions.openCreateUser}
        addLabel="Add User"
      />

      <AdminPageContent>
        <AdminSearchBar
          value={data.search}
          onChange={actions.setSearch}
          placeholder="Search users..."
        />

        {data.loading && data.users.length === 0 ? (
          <AdminLoadingGrid />
        ) : data.users.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="w-12 h-12" />}
            title="No users found"
            description={data.search ? `No results for "${data.search}"` : undefined}
          />
        ) : (
          <UsersTable
            users={data.users}
            actionLoading={data.actionLoading}
            loadingMore={data.loadingMore}
            hasMore={data.hasMore}
            sentinelRef={data.sentinelRef}
            onToggleStatus={actions.handleToggleStatus}
            onToggleVerification={actions.handleToggleVerification}
            onView={actions.viewUser}
          />
        )}
      </AdminPageContent>
    </div>
  );
}
