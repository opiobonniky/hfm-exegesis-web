// AdminSubscriptions — thin page composing hooks + components
"use client";
import { CreditCard, Users, ShieldCheck, RefreshCw, Loader2, Plus, Trash2, Ban, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAdminSubscriptions } from "../hooks/useAdminSubscriptions";
import { SubscriptionTierCard, TierFormDialog } from "../components";

const AdminSubscriptions = () => {
  const { isRtl } = useLanguage();
  const h = useAdminSubscriptions();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
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
        {h.activeTab === "tiers" && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={h.handleSeed} disabled={h.seeding}>
              {h.seeding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />} Seed Defaults
            </Button>
            <Button size="sm" onClick={h.openCreateTier}><Plus className="w-4 h-4 mr-1.5" />New Tier</Button>
          </div>
        )}
      </div>

      <Tabs value={h.activeTab} onValueChange={h.setActiveTab}>
        <TabsList className="overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="tiers" className="whitespace-nowrap"><ShieldCheck className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Subscription Tiers</TabsTrigger>
          <TabsTrigger value="subscribers" className="whitespace-nowrap"><Users className="w-4 h-4 mr-1.5 hidden sm:inline text-foreground/60" />Subscribers</TabsTrigger>
        </TabsList>

        {/* Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader><CardTitle className="text-base">All Tiers ({h.tiers.length})</CardTitle></CardHeader>
            <CardContent className="p-0">
              {h.tiersLoading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}</div>
              ) : h.tiers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <CreditCard className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No tiers created yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Click "Seed Defaults" or create one manually</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {h.tiers.map(tier => (
                    <SubscriptionTierCard key={tier.id} id={tier.id} name={tier.name} price={tier.price}
                      interval={tier.interval} description={tier.description} features={tier.features}
                      isActive={tier.isActive} onEdit={() => h.openEditTier(tier)} onDelete={() => h.setDeleteTier(tier.id)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Subscribers ({h.subscribers.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={h.handleSyncStripe} disabled={h.syncing}>
                  {h.syncing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />} Sync Stripe
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {h.subsLoading ? (
                <div className="p-4 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
              ) : h.subscribers.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center px-4">
                  <Users className="w-10 h-10 mb-3 text-muted-foreground/40" />
                  <p className="font-medium">No subscribers yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>User</TableHead><TableHead>Tier</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead>Source</TableHead><TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {h.subscribers.map(sub => (
                        <TableRow key={sub.id} className={cn("border-border/40", sub.outOfSync && "bg-amber-50/30 dark:bg-amber-950/10")}>
                          <TableCell><div className="font-medium text-sm">{sub.firstName} {sub.lastName}</div><div className="text-xs text-muted-foreground">{sub.email}</div></TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] capitalize">{sub.subscriptionTier}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{sub.accessExpiresAt ? new Date(sub.accessExpiresAt).toLocaleDateString() : "—"}</TableCell>
                          <TableCell>
                            {sub.isSuspended ? (
                              <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40">Suspended</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell><Badge variant="outline" className={cn("text-[10px]", sub.source === "stripe_only" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-muted")}>{sub.source}</Badge></TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => h.setSuspendDialog(sub)}>
                              {sub.isSuspended ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
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

      {/* Dialogs */}
      <TierFormDialog open={h.tierDialog} onOpenChange={h.setTierDialog} form={h.tierForm}
        onFormChange={h.setTierForm} saving={h.tierSaving} onSave={h.saveTier} />

      <Dialog open={!!h.deleteTier} onOpenChange={o => !o && h.setDeleteTier(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Delete Tier</DialogTitle>
            <DialogDescription>This cannot be undone. Users on this tier may be affected.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => h.setDeleteTier(null)} className="w-full sm:w-auto">Cancel</Button>
            <Button variant="destructive" onClick={h.confirmDeleteTier} className="gap-2 w-full sm:w-auto"><Trash2 className="w-4 h-4" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!h.suspendDialog} onOpenChange={o => !o && h.setSuspendDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {h.suspendDialog?.isSuspended ? <RotateCcw className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
              {h.suspendDialog?.isSuspended ? "Unsuspend User" : "Suspend User"}
            </DialogTitle>
            <DialogDescription>{h.suspendDialog?.isSuspended ? "Restore access for this user." : "This will revoke access for the user immediately."}</DialogDescription>
          </DialogHeader>
          {h.suspendDialog && (
            <div className="py-2">
              <p className="font-medium">{h.suspendDialog.firstName} {h.suspendDialog.lastName}</p>
              <p className="text-xs text-muted-foreground">{h.suspendDialog.email} · {h.suspendDialog.subscriptionTier}</p>
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => h.setSuspendDialog(null)} disabled={h.suspendLoading} className="w-full sm:w-auto">Cancel</Button>
            <Button variant={h.suspendDialog?.isSuspended ? "default" : "destructive"} onClick={h.toggleSuspend} disabled={h.suspendLoading} className="gap-2 w-full sm:w-auto">
              {h.suspendLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <>{h.suspendDialog?.isSuspended ? <RotateCcw className="w-4 h-4" /> : <Ban className="w-4 h-4" />} {h.suspendDialog?.isSuspended ? "Unsuspend" : "Suspend"}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
