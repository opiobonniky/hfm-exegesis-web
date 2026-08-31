// SuspendUserDialog — confirm suspend/unsuspend for a subscriber
import { Ban, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { SubscribedUser } from "../types";

interface Props {
  user: SubscribedUser | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SuspendUserDialog({
  user,
  loading,
  onOpenChange,
  onConfirm,
}: Props) {
  if (!user) return null;

  const isSuspended = user.isSuspended;

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuspended ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              <Ban className="w-5 h-5" />
            )}
            {isSuspended ? "Unsuspend User" : "Suspend User"}
          </DialogTitle>
          <DialogDescription>
            {isSuspended
              ? "Restore access for this user."
              : "This will revoke access for the user immediately."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <p className="font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            {user.email} · {user.subscriptionTier}
          </p>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant={isSuspended ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              <>
                {isSuspended ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <Ban className="w-4 h-4" />
                )}{" "}
                {isSuspended ? "Unsuspend" : "Suspend"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
