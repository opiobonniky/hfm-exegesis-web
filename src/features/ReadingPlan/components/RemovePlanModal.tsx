import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  t: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function RemovePlanModal({ open, t, onConfirm, onCancel }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />{t.readingPlan?.removeTitle || "Remove Plan"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            {t.readingPlan?.removeDesc || "Are you sure you want to remove this plan? Your progress will be lost."}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>{t.readingPlan?.keepIt || "Keep It"}</Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>{t.readingPlan?.remove || "Remove"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
