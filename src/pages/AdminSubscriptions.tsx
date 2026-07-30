"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Users,
  ShieldCheck,
  RefreshCw,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Ban,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useLanguage } from "@/components/languages/languageProvider";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
  maxSlots: number | null;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

interface SubscribedUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  legacySowerSlot: number | null;
  isSuspended: boolean;
  createdOn: string | null;
  stripeCustomerId: string | null;
  stripeStatus: string | null;
  source: string;
  syncIssue: string | null;
  outOfSync: boolean;
}

const INTERVALS = ["month", "year", "none"];

const AdminSubscriptions = () => {
  const { t, isRtl } = useLanguage();
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
      if (res?.returnCode === 200 && res?.returnData?.tiers) {
        setTiers(res.returnData.tiers);
      }
    } catch {
      toast({ title: "Failed to load tiers", variant: "destructive" });
    } finally {
      setTiersLoading(false);
    }
  }, [toast]);

  const loadSubscribers = useCallback(async () => {
    setSubsLoading(true);
    try {
      const res = await sendPostRequest("admin", "get-subscriptions-users", {});
      if (res?.returnCode === 200 && res?.returnData?.subscribedUsers) {
        setSubscribers(res.returnData.subscribedUsers);
      }
    } catch {
      toast({ title: "Failed to load subscribers", variant: "destructive" });
    } finally {
      setSubsLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadTiers(); }, [loadTiers]);
  useEffect(() => { if (activeTab === "subscribers") loadSubscribers(); }, [activeTab, loadSubscribers]);

  const openCreateTier = () => {
    setTierForm({ name: "", description: "", price: 0, currency: "usd", interval: "month", features: "", isActive: true, sortOrder: 0 });
    setTierDialog(true);
  };

  const openEditTier = (tier: SubscriptionTier) => {
    setTierForm({ ...tier, features: Array.isArray(tier.features) ? tier.features.join("\n") : "" });
    setTierDialog(true);
  };

  const saveTier = async () => {
    if (!tierForm.name?.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    setTierSaving(true);
    try {
      const payload = {
        ...tierForm,
        features: tierForm.features ? tierForm.features.split("\n").map((f: string) => f.trim()).filter(Boolean) : [],
      };
      const res = tierForm.id
        ? await sendPostRequest("admin", "subscription-tiers/update", payload)
        : await sendPostRequest("admin", "subscription-tiers/create", payload);
      if (res?.returnCode === 200) {
        toast({ title: tierForm.id ? "Tier updated" : "Tier created" });
        setTierDialog(false);
        loadTiers();
      } else {
        toast({ title: "Failed", description: res?.returnMessage, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error saving tier", variant: "destructive" });
    } finally {
      setTierSaving(false);
    }
  };

  const confirmDeleteTier = async () => {
    if (!deleteTier) return;
    try {
      const res = await sendPostRequest("admin", "subscription-tiers/delete", { id: deleteTier });
      if (res?.returnCode === 200) {
        toast({ title: "Tier deleted" });
        setDeleteTier(null);
        loadTiers();
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await sendPostRequest("admin", "subscription-tiers/seed", {});
      if (res?.returnCode === 200) {
        toast({ title: "Default tiers seeded" });
        loadTiers();
      }
    } catch {
      toast({ title: "Seed failed", variant: "destructive" });
    } finally {
      setSeeding(false);
    }
  };

  const handleSyncStripe = async () => {
    setSyncing(true);
    try {
      const res = await sendPostRequest("admin", "sync-stripe-users", {});
      if (res?.returnCode === 200) {
        toast({ title: "Stripe sync completed", description: res.returnMessage });
        loadSubscribers();
      }
    } catch {
      toast({ title: "Sync failed", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const toggleSuspend = async () => {
    if (!suspendDialog) return;
    setSuspendLoading(true);
    try {
      const res = await sendPostRequest("admin", "subscriptions/suspend", {
        userId: suspendDialog.id,
        suspend: !suspendDialog.isSuspended,
      });
      if (res?.returnCode === 200) {
        toast({ title: suspendDialog.isSuspended ? "User unsuspended" : "User suspended" });
        setSuspendDialog(null);
        loadSubscribers();
      }
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    } finally {
      setSuspendLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)]">Subscription Manager</h1>
            <p className="text-sm text-muted-foreground">Manage subscription tiers and subscribers</p>
          </div>
        </div>
        {activeTab === "tiers" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
              Seed Defaults
            </Button>
            <Button size="sm" onClick={openCreateTier}><Plus className="w-4 h-4 mr-1.5" />New Tier</Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="tiers" className="whitespace-nowrap"><ShieldCheck className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Subscription Tiers</TabsTrigger>
          <TabsTrigger value="subscribers" className="whitespace-nowrap"><Users className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Subscribers</TabsTrigger>
        </TabsList>

        {/* ── Tiers Tab ── */}
        <TabsContent value="tiers" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">All Tiers ({tiers.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {tiersLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                </div>
              ) : tiers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <CreditCard className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No tiers created yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Seed Defaults" or create one manually</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {tiers.map((tier) => (
                    <div key={tier.id} className="p-4 hover:bg-muted/20 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-sm">{tier.name}</p>
                            <Badge variant="outline" className="text-[10px] font-mono">{tier.id}</Badge>
                            {tier.isActive ? (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-sm font-bold text-primary">${tier.price}/{tier.interval === "none" ? "free" : tier.interval}</p>
                          {tier.description && <p className="text-xs text-muted-foreground mt-0.5">{tier.description}</p>}
                          {tier.features?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {tier.features.map((f, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{f}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditTier(tier)}><Edit2 className="w-4 h-4 text-foreground/60" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTier(tier.id)}><Trash2 className="w-4 h-4 text-foreground/60" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Subscribers Tab ── */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Subscribers ({subscribers.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSyncStripe} disabled={syncing}>
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
                  Sync Stripe
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {subsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                </div>
              ) : subscribers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <Users className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No subscribers yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id} className={cn("border-border/40", sub.outOfSync && "bg-amber-50/30 dark:bg-amber-950/10")}>
                        <TableCell>
                          <div className="font-medium text-sm">{sub.firstName} {sub.lastName}</div>
                          <div className="text-xs text-muted-foreground">{sub.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">{sub.subscriptionTier}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sub.accessExpiresAt ? new Date(sub.accessExpiresAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell>
                          {sub.isSuspended ? (
                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40">Suspended</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <Badge variant="outline" className={cn("text-[10px]", sub.source === "stripe_only" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800/40" : "bg-muted")}>
                            {sub.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setSuspendDialog(sub)}>
                              {sub.isSuspended ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tier Dialog */}
      <Dialog open={tierDialog} onOpenChange={o => !o && setTierDialog(false)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>{tierForm.id ? "Edit Tier" : "New Tier"}</DialogTitle>
            <DialogDescription>{tierForm.id ? "Update subscription tier details" : "Create a new subscription tier"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={tierForm.name || ""} onChange={e => setTierForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="e.g. Covenant Sower" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={tierForm.description || ""} onChange={e => setTierForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" value={tierForm.price ?? 0} onChange={e => setTierForm((f: any) => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Interval</Label>
                <Select value={tierForm.interval || "month"} onValueChange={v => setTierForm((f: any) => ({ ...f, interval: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input type="number" value={tierForm.sortOrder ?? 0} onChange={e => setTierForm((f: any) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Features (one per line)</Label>
              <Textarea value={tierForm.features || ""} onChange={e => setTierForm((f: any) => ({ ...f, features: e.target.value }))} rows={4} placeholder="Bible reading&#10;Daily verse&#10;Full study tools" />
            </div>
            <div className="space-y-1.5">
              <Label>Max Slots (leave empty for unlimited)</Label>
              <Input type="number" value={tierForm.maxSlots ?? ""} onChange={e => setTierForm((f: any) => ({ ...f, maxSlots: e.target.value ? parseInt(e.target.value) : null }))} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Tier available for subscription</p></div>
              <Switch checked={tierForm.isActive ?? true} onCheckedChange={v => setTierForm((f: any) => ({ ...f, isActive: v }))} />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setTierDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={saveTier} disabled={tierSaving} className="gap-2 w-full sm:w-auto">
              {tierSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tier Dialog */}
      <Dialog open={!!deleteTier} onOpenChange={o => !o && setDeleteTier(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Delete Tier</DialogTitle>
            <DialogDescription>This cannot be undone. Users on this tier may be affected.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteTier(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteTier} className="gap-2 w-full sm:w-auto"><Trash2 className="w-4 h-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={!!suspendDialog} onOpenChange={o => !o && setSuspendDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{suspendDialog?.isSuspended ? <RotateCcw className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              {suspendDialog?.isSuspended ? "Unsuspend User" : "Suspend User"}
            </DialogTitle>
            <DialogDescription>
              {suspendDialog?.isSuspended
                ? "Restore access for this user."
                : "This will revoke access for the user immediately."}
            </DialogDescription>
          </DialogHeader>
          {suspendDialog && (
            <div className="py-2">
              <p className="font-medium">{suspendDialog.firstName} {suspendDialog.lastName}</p>
              <p className="text-xs text-muted-foreground">{suspendDialog.email} · {suspendDialog.subscriptionTier}</p>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setSuspendDialog(null)} disabled={suspendLoading} className="w-full sm:w-auto">Cancel</Button>
            <Button variant={suspendDialog?.isSuspended ? "default" : "destructive"} onClick={toggleSuspend} disabled={suspendLoading} className="gap-2 w-full sm:w-auto">
              {suspendLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>{suspendDialog?.isSuspended ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />} {suspendDialog?.isSuspended ? "Unsuspend" : "Suspend"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
