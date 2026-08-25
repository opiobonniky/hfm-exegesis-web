"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDailyDevotionsPage } from "../hooks/useDailyDevotionsPage";
import { DailyDevotionsHeader } from "../components/DailyDevotionsHeader";
import { DevotionFilterBar } from "../components/DevotionFilterBar";
import { DevotionListItem } from "../components/DevotionListItem";
import { DevotionEditDialog } from "../components/DevotionEditDialog";
import { DevotionDeleteDialog } from "../components/DevotionDeleteDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Lightbulb } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";

const AdminDailyDevotions = () => {
  const h = useDailyDevotionsPage();
  const { userInfo } = useAuth();
  const { t } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const presets = (preset: string) => {
    const now = new Date();
    const toYMD = (d: Date) => d.toISOString().split("T")[0];
    switch (preset) {
      case "last_7": return { from: toYMD(new Date(now.getTime() - 6 * 864e5)), to: toYMD(now) };
      case "last_30": return { from: toYMD(new Date(now.getTime() - 29 * 864e5)), to: toYMD(now) };
      case "this_week": {
        const s = new Date(now); s.setDate(now.getDate() - now.getDay());
        return { from: toYMD(s), to: toYMD(now) };
      }
      case "this_month": return { from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)), to: toYMD(now) };
      case "last_month": return { from: toYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: toYMD(new Date(now.getFullYear(), now.getMonth(), 0)) };
      default: return { from: "", to: "" };
    }
  };

  return (
    <div className="space-y-6">
      <DailyDevotionsHeader onAdd={() => h.openEdit()} />

      {isAdmin && (
        <DevotionFilterBar
          fromDate={h.fromDate} toDate={h.toDate} activePreset={h.activePreset}
          filterError={h.filterError} isFiltered={h.fromDate !== "" || h.toDate !== ""}
          onFromChange={h.setFromDate} onToChange={h.setToDate}
          onApply={() => { h.setFilterError(""); h.refresh(); }}
          onClear={() => { h.setFromDate(""); h.setToDate(""); h.setActivePreset(null); h.setFilterError(""); }}
          onPreset={(v) => {
            const r = presets(v);
            h.setFromDate(r.from); h.setToDate(r.to); h.setActivePreset(v);
          }}
        />
      )}

      {h.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : h.devotions.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Lightbulb className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{t.devotions?.noDevotions || "No devotions found"}</p>
            {isAdmin && (
              <Button onClick={() => h.openEdit()} className="mt-4 gap-2">
                {t.devotions?.addDevotion || "Add Devotion"}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {h.devotions.map((item, idx) => (
            <DevotionListItem
              key={item.id}
              item={item}
              isSelected={h.selectedIndex === idx}
              onSelect={() => h.setSelectedIndex(idx)}
              onEdit={() => h.openEdit(item)}
              onDelete={() => { h.setDeleteTarget(item); h.setDeleteOpen(true); }}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {h.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            {t.common?.page || "Page"} {h.page + 1} {t.common?.of || "of"} {h.totalPages} ({h.total} {t.common?.results || "results"})
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!h.hasPrevious} onClick={() => h.setPage(h.page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={!h.hasNext} onClick={() => h.setPage(h.page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <DevotionEditDialog
        open={h.editOpen} onOpenChange={h.setEditOpen}
        editState={h.editState} onChange={h.setEditState}
        onSave={h.handleSave} isSaving={h.isSaving}
      />
      <DevotionDeleteDialog
        open={h.deleteOpen} onOpenChange={h.setDeleteOpen}
        target={h.deleteTarget} isDeleting={h.isDeleting}
        onConfirm={h.handleDelete}
      />
    </div>
  );
};

export default AdminDailyDevotions;
