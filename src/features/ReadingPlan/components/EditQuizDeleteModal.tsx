import { Button } from "@/components/ui/button";

interface Props {
  visible: boolean;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function EditQuizDeleteModal({ visible, deleting, onConfirm, onCancel }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-lg font-bold">Delete Quiz Question?</h3>
        <p className="text-sm text-muted-foreground">This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
