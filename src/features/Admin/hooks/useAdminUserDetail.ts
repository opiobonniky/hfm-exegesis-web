// useAdminUserDetail — fetch single user detail + toggle actions
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import type { AdminUser, UserActivitySession } from "../types";

export function useAdminUserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [sessions, setSessions] = useState<UserActivitySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUser = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-users-by-admin", {
        userId,
      });
      const data = res?.returnData;
      const found = data?.users?.[0] || data;
      if (found && found.id) {
        setUser(found as AdminUser);
      } else {
        toast({ title: "User not found", variant: "destructive" });
        navigate("/admin/users");
      }
    } catch {
      toast({ title: "Failed to load user", variant: "destructive" });
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  }, [userId, toast, navigate]);

  const loadSessions = useCallback(async () => {
    if (!userId) return;
    setSessionsLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-user-activity", { userId });
      const data = res?.returnData;
      setSessions(data?.sessions || data?.content || data || []);
    } catch {
      // silent — sessions are optional
    } finally {
      setSessionsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
    loadSessions();
  }, [loadUser, loadSessions]);

  const handleToggleStatus = useCallback(async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const newStatus = !user.status;
      const res = await sendPostRequest("admin", "toggle-user-status", {
        username: user.username,
        status: newStatus,
      });
      if (res.returnCode === 200) {
        setUser((prev) => (prev ? { ...prev, status: newStatus } : prev));
        toast({ title: newStatus ? "User activated" : "User deactivated" });
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [user, toast]);

  const handleToggleVerification = useCallback(async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const newVerified = !user.emailVerified;
      const res = await sendPostRequest("admin", "toggle-user-verification", {
        username: user.username,
        isVerified: newVerified,
      });
      if (res.returnCode === 200) {
        setUser((prev) => (prev ? { ...prev, emailVerified: newVerified } : prev));
        toast({ title: newVerified ? "User verified" : "Verification removed" });
      }
    } catch {
      toast({ title: "Failed to update verification", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [user, toast]);

  const handleDelete = useCallback(async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const res = await sendPostRequest("admin", "delete-user", {
        username: user.username,
      });
      if (res.returnCode === 200) {
        toast({ title: "User deleted" });
        navigate("/admin/users");
      }
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  }, [user, toast, navigate]);

  return {
    user,
    sessions,
    loading,
    sessionsLoading,
    actionLoading,
    handleToggleStatus,
    handleToggleVerification,
    handleDelete,
    navigate,
  };
}
