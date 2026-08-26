// useAdminDailyContent — list + delete logic for AdminDailyContent page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import type { DailyItem } from "../types";
import type { ContentType } from "../constants";

export function useAdminDailyContent() {
  const { t, isRtl } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("verses");
  const [content, setContent] = useState<DailyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DailyItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const getAction = useCallback((type: ContentType, action: string) => {
    if (type === "verse" && action === "get-all") return "get-all-daily-verses";
    const prefix = type === "verse" ? "daily-verse" : type === "devotion" ? "daily-devotion" : "daily-exegesis";
    return `${action}-${prefix}`;
  }, []);

  const loadContent = useCallback(async (type: ContentType, p: number) => {
    setLoading(true);
    try {
      const res = await sendPostRequest("admin", getAction(type, "get-all"), {
        page: p, size: 12,
        ...(searchDate ? { startDate: searchDate, endDate: searchDate } : { smartDefault: false }),
      });
      if (res?.returnCode === 200 && res?.returnData) {
        setContent(res.returnData.content || []);
        setTotal(res.returnData.totalElements || 0);
      }
    } catch { toast({ title: "Failed to load content", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [searchDate, getAction, toast]);

  useEffect(() => {
    const typeMap: Record<string, ContentType> = { verses: "verse", devotions: "devotion", exegesis: "exegesis" };
    loadContent(typeMap[activeTab] || "verse", page);
  }, [activeTab, page, loadContent]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const type: ContentType = activeTab === "verses" ? "verse" : activeTab === "devotions" ? "devotion" : "exegesis";
      const action = getAction(type, "delete");
      const idKey = type === "verse" ? "verseId" : type === "devotion" ? "devotionId" : "exegesisId";
      const res = await sendPostRequest("admin", action, { [idKey]: deleteTarget.id });
      if (res?.returnCode === 200) { toast({ title: "Deleted" }); setDeleteTarget(null); loadContent(type, page); }
      else { toast({ title: "Delete failed", variant: "destructive" }); }
    } catch { toast({ title: "Error deleting", variant: "destructive" }); }
    finally { setDeleting(false); }
  }, [deleteTarget, activeTab, getAction, toast, loadContent, page]);

  const typeLabel = activeTab === "verses" ? "Verse" : activeTab === "devotions" ? "Devotion" : "Exegesis";

  return {
    t, isRtl, activeTab, setActiveTab, content, total, page, setPage, loading, searchDate, setSearchDate,
    typeLabel, deleteTarget, setDeleteTarget, deleting, confirmDelete,
  };
}
