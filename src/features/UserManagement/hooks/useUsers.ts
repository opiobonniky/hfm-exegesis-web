// useUsers — all state + API logic for UsersPage
import { useState, useCallback } from "react";
import { userManagementApi } from "../services/userManagementApi";
import type { User, RawUser, UsersResponse } from "../types";
import { mapUser } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);           // UI uses 0-based
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    try {
      // Backend uses 1-based pages
      const res = await userManagementApi.list(page + 1, 20, filters);
      // Backend formatApiResponse returns { returnCode, returnData: { users, totalCount, totalPages } }
      if (res.returnCode === 200 && res.returnData) {
        const data: UsersResponse = res.returnData;
        setUsers((data.users || []).map(mapUser));
        setTotalPages(data.totalPages || 0);
        setTotalCount(data.totalCount || 0);
      } else {
        console.error("Failed to load users:", res.returnMessage);
        setUsers([]);
      }
    } catch (e) {
      console.error("Failed to load users:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { users, loading, page, totalPages, totalCount, setPage, fetchUsers };
}
