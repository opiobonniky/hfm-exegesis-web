// DailyDevotions — devotions list page (thin compositor)
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDailyDevotionsPage } from "../hooks/useDailyDevotionsPage";
import { DailyDevotionsHeader } from "../components/DailyDevotionsHeader";
import { DevotionFilterBar } from "../components/DevotionFilterBar";
import { DevotionList } from "../components/DevotionList";
import { DevotionEditDialog } from "../components/DevotionEditDialog";
import { DevotionDeleteDialog } from "../components/DevotionDeleteDialog";
import { DailyDevotionsPagination } from "../components/DailyDevotionsPagination";
import { DailyDevotionsEmpty } from "../components/DailyDevotionsEmpty";
import { Loader2 } from "lucide-react";
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
      case "last_7":
        return {
          from: toYMD(new Date(now.getTime() - 6 * 864e5)),
          to: toYMD(now),
        };
      case "last_30":
        return {
          from: toYMD(new Date(now.getTime() - 29 * 864e5)),
          to: toYMD(now),
        };
      case "this_week": {
        const s = new Date(now);
        s.setDate(now.getDate() - now.getDay());
        return { from: toYMD(s), to: toYMD(now) };
      }
      case "this_month":
        return {
          from: toYMD(new Date(now.getFullYear(), now.getMonth(), 1)),
          to: toYMD(now),
        };
      case "last_month":
        return {
          from: toYMD(
            new Date(now.getFullYear(), now.getMonth() - 1, 1),
          ),
          to: toYMD(
            new Date(now.getFullYear(), now.getMonth(), 0),
          ),
        };
      default:
        return { from: "", to: "" };
    }
  };

  return (
    <div className="space-y-6">
      <DailyDevotionsHeader onAdd={() => h.openEdit()} />

      {isAdmin && (
        <DevotionFilterBar
          fromDate={h.fromDate}
          toDate={h.toDate}
          activePreset={h.activePreset}
          filterError={h.filterError}
          isFiltered={h.fromDate !== "" || h.toDate !== ""}
          onFromChange={h.setFromDate}
          onToChange={h.setToDate}
          onApply={() => {
            h.setFilterError("");
            h.refresh();
          }}
          onClear={() => {
            h.setFromDate("");
            h.setToDate("");
            h.setActivePreset(null);
            h.setFilterError("");
          }}
          onPreset={(v) => {
            const r = presets(v);
            h.setFromDate(r.from);
            h.setToDate(r.to);
            h.setActivePreset(v);
          }}
        />
      )}

      {h.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : h.devotions.length === 0 ? (
        <DailyDevotionsEmpty
          message={t.devotions?.noDevotions || "No devotions found"}
          isAdmin={isAdmin}
          addLabel={t.devotions?.addDevotion || "Add Devotion"}
          onAdd={() => h.openEdit()}
        />
      ) : (
        <DevotionList
          devotions={h.devotions}
          selectedIndex={h.selectedIndex}
          isAdmin={isAdmin}
          onSelect={h.setSelectedIndex}
          onEdit={(item) => h.openEdit(item)}
          onDelete={(item) => {
            h.setDeleteTarget(item);
            h.setDeleteOpen(true);
          }}
        />
      )}

      {h.totalPages > 1 && (
        <DailyDevotionsPagination
          page={h.page}
          totalPages={h.totalPages}
          total={h.total}
          hasNext={h.hasNext}
          hasPrevious={h.hasPrevious}
          onPageChange={h.setPage}
          labels={{
            page: t.common?.page || "Page",
            of: t.common?.of || "of",
            results: t.common?.results || "results",
          }}
        />
      )}

      <DevotionEditDialog
        open={h.editOpen}
        onOpenChange={h.setEditOpen}
        editState={h.editState}
        onChange={h.setEditState}
        onSave={h.handleSave}
        isSaving={h.isSaving}
      />
      <DevotionDeleteDialog
        open={h.deleteOpen}
        onOpenChange={h.setDeleteOpen}
        target={h.deleteTarget}
        isDeleting={h.isDeleting}
        onConfirm={h.handleDelete}
      />
    </div>
  );
};

export default AdminDailyDevotions;
