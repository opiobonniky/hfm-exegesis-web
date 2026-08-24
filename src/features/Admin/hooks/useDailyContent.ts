// Admin useDailyContent — useDailyContent state and API logic
import { useState, useCallback } from "react";
import { sendPostRequest } from "@/services/api";

export interface DailyContent {
  id: string;
  title: string;
  reference?: string;
  verseText?: string;
  content?: string;
  exegesis?: string;
  description?: string;
  status: string;
  date: string;
  createdAt: string;
}
const contentEndpoints: Record<string, { list: string; add: string; delete: string }> = {
  verse: { list: "get-all-daily-verses", add: "add-daily-verse", delete: "delete-daily-verse" },
  devotion: { list: "get-all-daily-devotions", add: "add-daily-devotion", delete: "delete-daily-devotion" },
  exegesis: { list: "get-all-daily-exegesis", add: "add-daily-exegesis", delete: "delete-daily-exegesis" },
};
export function useDailyContent(type: "verse" | "devotion" | "exegesis") {
  const [items, setItems] = useState<DailyContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const endpoints = contentEndpoints[type];
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = { page, size: 20 };
      if (searchQuery) filters.search = searchQuery;
      if (selectedStatus !== "all") filters.status = selectedStatus;
      const res = await sendPostRequest("admin", endpoints.list, filters);
      if (res.returnCode === 200) {
        setItems(res.returnData?.content || []);
      }
    } catch (e) {
      console.error("Failed to fetch daily content", e);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedStatus, endpoints.list]);
  const createItem = useCallback(async (data: Partial<DailyContent>) => {
      await sendPostRequest("admin", endpoints.add, data);
      await fetchItems();
      console.error("Failed to create content", e);
  }, [endpoints.add, fetchItems]);
  const updateItem = useCallback(async (id: string, data: Partial<DailyContent>) => {
      await sendPostRequest("admin", endpoints.add, { ...data, id });
      setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
      console.error("Failed to update content", e);
  }, [endpoints.add]);
  const deleteItem = useCallback(async (id: string) => {
      await sendPostRequest("admin", endpoints.delete, { id });
      setItems(prev => prev.filter(item => item.id !== id));
      console.error("Failed to delete content", e);
  }, [endpoints.delete]);
  return {
    items,
    loading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    createItem,
    updateItem,
    deleteItem,
    refresh: fetchItems,
  };
