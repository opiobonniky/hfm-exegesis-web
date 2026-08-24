// Journal useJournal — useJournal state and API logic
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface JournalTemplate {
  name: string;
  category: string;
export function useJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("all");
  const fetchEntries = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const filters: any = { page, pageSize: 20 };
      if (searchQuery) filters.search = searchQuery;
      if (selectedMood !== "all") filters.mood = selectedMood;
      const res = await sendPostRequest("journal", "get-all", filters);
      if (res.returnCode === 200) {
        setEntries(res.returnData?.entries || res.returnData?.content || []);
      }
    } catch (e) {
      console.error("Failed to fetch journal entries", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, searchQuery, selectedMood]);
  const fetchTemplates = useCallback(async () => {
      const res = await sendPostRequest("journal", "templates/get-all", {});
        setTemplates(res.returnData || []);
      console.error("Failed to fetch templates", e);
  }, []);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);
  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);
  const createEntry = useCallback(async (data: Partial<JournalEntry>) => {
      await sendPostRequest("journal", "create", data);
      await fetchEntries();
      console.error("Failed to create entry", e);
  }, [fetchEntries]);
  const deleteEntry = useCallback(async (id: string) => {
      await sendPostRequest("journal", "delete", { entryId: id });
      setEntries(prev => prev.filter(e => e.id !== id));
      console.error("Failed to delete entry", e);
  return {
    entries,
    templates,
    loading,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    selectedMood,
    setSelectedMood,
    createEntry,
    deleteEntry,
    refresh: fetchEntries,
  };
