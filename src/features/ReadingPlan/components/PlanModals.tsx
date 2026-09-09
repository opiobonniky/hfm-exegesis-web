import { Trash2 } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import type { ReadingPlan } from "../types";
import type { ReadingPlanListItem } from "../types";

interface StartModalProps {
  visible: boolean;
  plan: ReadingPlan | null;
  onStart: (p: ReadingPlan) => void;
  onClose: () => void;
}

export function StartPlanModal({ visible, plan, onStart, onClose }: StartModalProps) {
  const { t } = useLanguage();
  if (!visible || !plan) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold text-foreground mb-2">{t.readingPlan?.startReadingPlan || "Start Reading Plan"}</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {(t.readingPlan?.startPlanConfirm || 'Do you want to start "{title}"? This will set your daily reading schedule and track your progress.').replace("{title}", plan.title)}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors">
            {t.common?.cancel || "Cancel"}
          </button>
          <button onClick={() => onStart(plan)} className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors">
            {t.readingPlan?.actionStart || "Start Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface RemoveModalProps {
  visible: boolean;
  plan: ReadingPlan | null;
  onRemove: (p: ReadingPlan) => void;
  onClose: () => void;
}

export function RemovePlanModal({ visible, plan, onRemove, onClose }: RemoveModalProps) {
  const { t } = useLanguage();
  if (!visible || !plan) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5" />{t.readingPlan?.removeTitle || "Remove Plan"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {(t.readingPlan?.removeConfirmDesc || 'Are you sure you want to remove "{title}"? Your progress will be lost.').replace("{title}", plan.title)}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground font-semibold hover:bg-muted transition-colors">
            {t.readingPlan?.keepIt || "Keep It"}
          </button>
          <button onClick={() => onRemove(plan)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
            {t.readingPlan?.remove || "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeletePlanModalProps {
  visible: boolean;
  plan: ReadingPlanListItem | null;
  confirmationText: string;
  deleting: boolean;
  onConfirmationTextChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeletePlanModal({
  visible,
  plan,
  confirmationText,
  deleting,
  onConfirmationTextChange,
  onConfirm,
  onClose,
}: DeletePlanModalProps) {
  const { t } = useLanguage();
  if (!visible || !plan) return null;
  const canDelete = confirmationText === "DELETE" && !deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-reading-plan-title"
        className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"
      >
        <h3 id="delete-reading-plan-title" className="mb-2 flex items-center gap-2 text-lg font-bold text-red-600">
          <Trash2 className="h-5 w-5" />
          Delete reading plan
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          This permanently deletes <strong className="text-foreground">{plan.title}</strong>, its assignments, and quiz questions.
          This action cannot be undone.
        </p>
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">
          Type <strong className="text-red-600">DELETE</strong> to confirm
        </label>
        <input
          value={confirmationText}
          onChange={(event) => onConfirmationTextChange(event.target.value)}
          placeholder="DELETE"
          autoFocus
          className="mb-5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-500/30"
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 font-semibold text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            {t.common?.cancel || "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete plan"}
          </button>
        </div>
      </div>
    </div>
  );
}
