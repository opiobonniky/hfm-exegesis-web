"use client";

import { Search, X, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import type { useStudyTools } from "../hooks/useStudyTools";
type StudyToolsState = ReturnType<typeof useStudyTools>;
interface StudiesTabProps {
  state: StudyToolsState;
}
export default function StudiesTab({ state }: StudiesTabProps) {
  const { studies, studiesLoading, studiesSearch, setStudiesSearch, loadStudies } = state;
  const { toast } = useToast();
  const handleDelete = async (id: number) => {
    try {
      const res = await sendPostRequest("admin", "delete-daily-exegesis", { id });
      if (res.returnCode === 200) {
        toast({ title: "Deleted", description: "Study deleted successfully" });
        loadStudies(0, studiesSearch);
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by Strong's ID, book, or note content..."
            value={studiesSearch}
            onChange={(e) => setStudiesSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStudies(0, studiesSearch)}
            className="pl-9 h-9 text-sm"
          />
        </div>
        {studiesSearch && (
          <Button variant="ghost" size="sm" onClick={() => { setStudiesSearch(""); loadStudies(0, ""); }} className="h-9 text-xs">
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
      {/* List */}
      {studiesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
      ) : studies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No studies found.</p>
      ) : (
          {studies.map((study: any) => (
            <div key={study.id} className="p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{study.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{study.passage}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {study.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleDelete(study.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </div>
      )}
    </div>
  );
