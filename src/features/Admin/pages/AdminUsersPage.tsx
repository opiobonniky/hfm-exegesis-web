// AdminUsersPage — thin page composing hook + components
"use client";

import { useState } from "react";
import { Users, UserPlus, RefreshCw, ShieldCheck, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "../hooks/useAdminUsers";
import type { AdminUser } from "../types";
import {
  AdminPageHeader,
  AdminEmptyState,
  AdminLoadingGrid,
  AdminSearchBar,
  AdminPageContent,
} from "../components";
import { UsersTable } from "../components/UsersTable";
import { AdminDeleteDialog } from "../components/AdminDeleteDialog";

export default function AdminUsersPage() {
  const { data, actions } = useAdminUsers();
  const [refreshing, setRefreshing] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  const adminCount = data.users.filter((u) => u.userRole === 1).length;
  const activeCount = data.users.filter((u) => u.status).length;

  const handleRefresh = async () => {
    setRefreshing(true);
    actions.refresh();
    setTimeout(() => setRefreshing(false), 600);
  };

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
        {/* Stat chips */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <StatChip
            icon={<CircleDot className="w-3.5 h-3.5 text-emerald-500" />}
            label="Active"
            value={activeCount}
          />
          <StatChip
            icon={<ShieldCheck className="w-3.5 h-3.5 text-purple-500" />}
            label="Admins"
            value={adminCount}
          />
        </div>

        {/* Toolbar: search + refresh */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1">
            <AdminSearchBar
              value={data.search}
              onChange={actions.setSearch}
              placeholder="Search by name, email or username..."
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh list"
            className="h-9 w-9 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

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
            onRoleChange={actions.handleUpdateRole}
            onView={actions.viewUser}
            onDelete={setUserToDelete}
          />
        )}
      </AdminPageContent>

      {/* Permanent delete confirmation — removes the user and ALL their data */}
      <AdminDeleteDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Delete User Permanently"
        deleting={!!userToDelete && data.actionLoading === userToDelete.id}
        onConfirm={() => {
          if (userToDelete) actions.handleDeleteUser(userToDelete);
          setUserToDelete(null);
        }}
        description={`This will permanently delete ${userToDelete?.firstName || userToDelete?.username || "this user"} and ALL their data — journal entries, highlights, notes, favorites, reading history, quiz answers, plan progress, sessions, and messages. This cannot be undone.`}
      />
    </div>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs shadow-sm">
      {icon}
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
