import { useState, useCallback, useEffect } from "react";
import { useUsers } from "./useUsers";
import type { User } from "../types";

export function useUsersPage() {
  const { t } = { t: {} as any }; // placeholder
  const { users, loading, page, totalPages, setPage, fetchUsers } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  useEffect(() => {
    fetchUsers({ search, role: roleFilter === "all" ? undefined : roleFilter });
  }, [page, roleFilter]);
  const handleSearch = useCallback(() => {
    setPage(0);
  }, [search, roleFilter, setPage, fetchUsers]);
  const handleRefresh = useCallback(() => {
  }, [search, roleFilter, fetchUsers]);
  return { users, loading, page, totalPages, setPage, search, setSearch, roleFilter, setRoleFilter, selectedUser, setSelectedUser, detailOpen, setDetailOpen, handleSearch, handleRefresh };
}
