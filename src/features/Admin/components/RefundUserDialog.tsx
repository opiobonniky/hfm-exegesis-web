// RefundUserDialog — confirm a Stripe refund + cancellation for a subscriber
import { useState } from "react";
import { Loader2, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { SubscribedUser } from "../types";

interface Props {
  user: SubscribedUser | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
}

export function RefundUserDialog({ user, loading, onOpenChange, onConfirm }: Props) {
  const [reason, setReason] = useState("requested_by_customer");

  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <RotateCcw className="w-5 h-5" /> Refund &amp; Cancel
          </DialogTitle>
          <DialogDescription>
            Refund the last Stripe charge and cancel this subscription for{" "}
            <span className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              This will issue a refund via Stripe, cancel the active subscription, and reset the user to the Free tier.
              This action cannot be undone.
            </span>
          </div>
          <div className="space-y-1.5">
            <Label>Refund Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                <SelectItem value="duplicate">Duplicate charge</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><RotateCcw className="w-4 h-4" /> Refund &amp; Cancel</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
