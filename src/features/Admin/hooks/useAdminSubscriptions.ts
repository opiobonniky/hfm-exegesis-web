// useAdminSubscriptions — all state, effects, and logic for AdminSubscriptions page
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import type { SubscriptionTier, SubscribedUser } from "../types";

export function useAdminSubscriptions() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("tiers");
  // Tiers
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [tiersLoading, setTiersLoading] = useState(true);
  const [tierDialog, setTierDialog] = useState(false);
  const [tierForm, setTierForm] = useState<any>({});
  const [tierSaving, setTierSaving] = useState(false);
  const [deleteTier, setDeleteTier] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  // Subscribers
  const [subscribers, setSubscribers] = useState<SubscribedUser[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState<SubscribedUser | null>(null);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const loadTiers = useCallback(async () => {
    setTiersLoading(true);
    try {
      const res = await sendPostRequest("admin", "subscription-tiers/list", {});
      if (res?.returnCode === 200 && res?.returnData?.tiers) setTiers(res.returnData.tiers);
    } catch { toast({ title: "Failed to load tiers", variant: "destructive" }); }
    finally { setTiersLoading(false); }
  }, [toast]);
  const loadSubscribers = useCallback(async () => {
    setSubsLoading(true);
      const res = await sendPostRequest("admin", "get-subscriptions-users", {});
      if (res?.returnCode === 200 && res?.returnData?.subscribedUsers) setSubscribers(res.returnData.subscribedUsers);
    } catch { toast({ title: "Failed to load subscribers", variant: "destructive" }); }
    finally { setSubsLoading(false); }
  useEffect(() => { loadTiers(); }, [loadTiers]);
  useEffect(() => { if (activeTab === "subscribers") loadSubscribers(); }, [activeTab, loadSubscribers]);
  const openCreateTier = useCallback(() => {
    setTierForm({ name: "", description: "", price: 0, currency: "usd", interval: "month", features: "", isActive: true, sortOrder: 0 });
    setTierDialog(true);
  }, []);
  const openEditTier = useCallback((tier: SubscriptionTier) => {
    setTierForm({ ...tier, features: Array.isArray(tier.features) ? tier.features.join("\n") : "" });
  const saveTier = useCallback(async () => {
    if (!tierForm.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setTierSaving(true);
      const payload = { ...tierForm, features: tierForm.features ? tierForm.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : [] };
      const res = tierForm.id
        ? await sendPostRequest("admin", "subscription-tiers/update", payload)
        : await sendPostRequest("admin", "subscription-tiers/create", payload);
      if (res?.returnCode === 200) { toast({ title: tierForm.id ? "Tier updated" : "Tier created" }); setTierDialog(false); loadTiers(); }
      else { toast({ title: "Failed", description: res?.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error saving tier", variant: "destructive" }); }
    finally { setTierSaving(false); }
  }, [tierForm, toast, loadTiers]);
  const confirmDeleteTier = useCallback(async () => {
    if (!deleteTier) return;
      const res = await sendPostRequest("admin", "subscription-tiers/delete", { id: deleteTier });
      if (res?.returnCode === 200) { toast({ title: "Tier deleted" }); setDeleteTier(null); loadTiers(); }
    } catch { toast({ title: "Delete failed", variant: "destructive" }); }
  }, [deleteTier, toast, loadTiers]);
  const handleSeed = useCallback(async () => {
    setSeeding(true);
      const res = await sendPostRequest("admin", "subscription-tiers/seed", {});
      if (res?.returnCode === 200) { toast({ title: "Default tiers seeded" }); loadTiers(); }
    } catch { toast({ title: "Seed failed", variant: "destructive" }); }
    finally { setSeeding(false); }
  }, [toast, loadTiers]);
  const handleSyncStripe = useCallback(async () => {
    setSyncing(true);
      const res = await sendPostRequest("admin", "sync-stripe-users", {});
      if (res?.returnCode === 200) { toast({ title: "Stripe sync completed", description: res.returnMessage }); loadSubscribers(); }
    } catch { toast({ title: "Sync failed", variant: "destructive" }); }
    finally { setSyncing(false); }
  }, [toast, loadSubscribers]);
  const toggleSuspend = useCallback(async () => {
    if (!suspendDialog) return;
    setSuspendLoading(true);
      const res = await sendPostRequest("admin", "subscriptions/suspend", { userId: suspendDialog.id, suspend: !suspendDialog.isSuspended });
      if (res?.returnCode === 200) { toast({ title: suspendDialog.isSuspended ? "User unsuspended" : "User suspended" }); setSuspendDialog(null); loadSubscribers(); }
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
    finally { setSuspendLoading(false); }
  }, [suspendDialog, toast, loadSubscribers]);
  return {
    activeTab, setActiveTab, tiers, tiersLoading, tierDialog, setTierDialog, tierForm, setTierForm,
    tierSaving, deleteTier, setDeleteTier, seeding, subscribers, subsLoading, syncing,
    suspendDialog, setSuspendDialog, suspendLoading,
    openCreateTier, openEditTier, saveTier, confirmDeleteTier, handleSeed, handleSyncStripe, toggleSuspend,
    data: { tiers, subscribers },
    actions: { loadTiers, loadSubscribers, openCreateTier, openEditTier, saveTier, confirmDeleteTier, handleSeed, handleSyncStripe, toggleSuspend },  
  };
}
