"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Search, Loader2, Shield, ShieldOff, CheckCircle, XCircle, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid } from "../components";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  userRole: number;
  isVerified: boolean;
  isActive: boolean;
  createdOn: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async (pageNum: number, q: string, append = false) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-users-by-admin", {
        page: pageNum, size: 20, search: q || undefined,
      });
      const data = res?.returnData;
      const items = data?.users || data?.content || data || [];
      setUsers(prev => append ? [...prev, ...items] : items);
      setHasMore(items.length === 20);
    } catch {
      toast({ title: "Failed to load users", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadUsers(0, search); }, []);

  const handleSearch = () => { setPage(0); loadUsers(0, search); };

  const handleToggleStatus = async (user: User) => {
    setActionLoading(user.id);
    try {
      const res = await sendPostRequest("admin", "toggle-user-status", { userId: user.id });
      if (res.returnCode === 200) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        toast({ title: user.isActive ? "User deactivated" : "User activated" });
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerification = async (user: User) => {
    setActionLoading(user.id);
    try {
      const res = await sendPostRequest("admin", "toggle-user-verification", { userId: user.id });
      if (res.returnCode === 200) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isVerified: !u.isVerified } : u));
        toast({ title: user.isVerified ? "Verification removed" : "User verified" });
      }
    } catch {
      toast({ title: "Failed to update verification", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader
        title="User Management"
        subtitle={`${users.length} users`}
        icon={<Users className="w-5 h-5 text-primary" />}
        onBack={() => window.history.back()}
        onAdd={() => {}}
        addLabel=""
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button size="sm" onClick={handleSearch} className="h-9 gap-1 text-xs">
            Search
          </Button>
        </div>

        {/* Users list */}
        {loading && users.length === 0 ? (
          <AdminLoadingGrid />
        ) : users.length === 0 ? (
          <AdminEmptyState icon={<Users className="w-12 h-12" />} title="No users found" />
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 text-sm font-medium">User</th>
                    <th className="text-left p-3 text-sm font-medium hidden md:table-cell">Email</th>
                    <th className="text-left p-3 text-sm font-medium">Role</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium hidden lg:table-cell">Joined</th>
                    <th className="text-right p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-3">
                        <div className="font-medium text-sm">
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : user.username}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                      </td>
                      <td className="p-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={user.userRole === 1 ? "default" : "secondary"}>
                          {user.userRole === 1 ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {user.isVerified && (
                            <Badge variant="outline" className="text-emerald-600">
                              <CheckCircle className="w-3 h-3 mr-1" /> Verified
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {user.createdOn ? new Date(user.createdOn).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleToggleStatus(user)}
                            disabled={actionLoading === user.id}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : user.isActive ? (
                              <ShieldOff className="w-3.5 h-3.5 text-destructive" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleToggleVerification(user)}
                            disabled={actionLoading === user.id}
                            title={user.isVerified ? "Unverify" : "Verify"}
                          >
                            {user.isVerified ? (
                              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={() => { const np = page + 1; setPage(np); loadUsers(np, search, true); }} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
