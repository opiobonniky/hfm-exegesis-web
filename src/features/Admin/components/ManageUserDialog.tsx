// ManageUserDialog — edit a subscriber's tier and/or access expiry
import { useState, useEffect } from "react";
import { CalendarClock, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatReadableDate } from "../utils";
import type { SubscriptionTier, SubscribedUser } from "../types";

interface Props {
  user: SubscribedUser | null;
  tiers: SubscriptionTier[];
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { subscriptionTier: string; accessExpiresAt?: string | null }) => void;
}

const TIER_OPTIONS = [
  "free",
  "legacy_sower",
  "legacy_sower_monthly",
  "covenant_sower",
  "covenant_sower_monthly",
];

export function ManageUserDialog({ user, tiers, loading, onOpenChange, onSave }: Props) {
  const [tier, setTier] = useState<string>("free");
  const [expiry, setExpiry] = useState<string>("");

  useEffect(() => {
    if (user) {
      setTier(user.subscriptionTier || "free");
      setExpiry(user.accessExpiresAt ? String(user.accessExpiresAt).slice(0, 10) : "");
    }
  }, [user]);

  if (!user) return null;

  const tierNames = new Map(tiers.map((t) => [t.id, t.name]));

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" /> Manage Subscription
          </DialogTitle>
          <DialogDescription>
            Change the tier or access expiry for{" "}
            <span className="font-medium text-foreground">
              {user.firstName} {user.lastName}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Subscription Tier</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIER_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {tierNames.get(t) || t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Access Expires On</Label>
            <Input
              type="date"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {user.accessExpiresAt
                ? `Current: ${formatReadableDate(user.accessExpiresAt)}`
                : "No expiry set."}
            </p>
            <p className="text-xs text-muted-foreground">
              Leave empty for no expiry / free access.
            </p>
          </div>
        </div>
        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">Cancel</Button>
          <Button
            onClick={() => onSave({ subscriptionTier: tier, accessExpiresAt: expiry ? new Date(expiry + "T00:00:00").toISOString() : null })}
            disabled={loading}
            className="gap-2 w-full sm:w-auto"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
