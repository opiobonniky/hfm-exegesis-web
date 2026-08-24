"use client";

import { Search, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/languages/languageProvider";
import { useUsersPage } from "../hooks/useUsersPage";
import UsersTable from "../components/UsersTable";
import UserDetailSheet from "../components/UserDetailSheet";
export default function UsersPage() {
  const { t } = useLanguage();
  const h = useUsersPage();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t.userManagement?.title || "System Users"}</h1>
            <p className="text-sm text-muted-foreground">{t.userManagement?.subtitle || "Manage user accounts and roles"}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={h.search} onChange={(e) => h.setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && h.handleSearch()} className="pl-9 h-9 text-sm" />
          <Select value={h.roleFilter} onValueChange={h.setRoleFilter}>
            <SelectTrigger className="w-full sm:w-36 h-9">
              <Filter className="w-3.5 h-3.5 mr-2" /><SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">User</SelectItem>
              <SelectItem value="3">Super Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={h.handleRefresh} className="h-9 gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        <UsersTable users={h.users} loading={h.loading}
          onSelectUser={(user) => { h.setSelectedUser(user); h.setDetailOpen(true); }}
          onToggleActive={() => h.handleRefresh()} />
        {h.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={h.page === 0} onClick={() => h.setPage(h.page - 1)}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {h.page + 1} of {h.totalPages}</span>
            <Button variant="outline" size="sm" disabled={h.page >= h.totalPages - 1} onClick={() => h.setPage(h.page + 1)}>Next</Button>
        )}
        <UserDetailSheet user={h.selectedUser} open={h.detailOpen} onOpenChange={h.setDetailOpen}
      </div>
    </div>
  );
}
