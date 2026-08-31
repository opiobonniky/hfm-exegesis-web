// SubscribersTable — subscribers list tab content for admin subscriptions
import { Users, RefreshCw, Ban, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { SubscribedUser } from "../types";

interface Props {
  subscribers: SubscribedUser[];
  loading: boolean;
  syncing: boolean;
  onSyncStripe: () => void;
  onSuspend: (sub: SubscribedUser) => void;
}

export function SubscribersTable({
  subscribers,
  loading,
  syncing,
  onSyncStripe,
  onSuspend,
}: Props) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Subscribers ({subscribers.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onSyncStripe}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-1" />
            )}
            Sync Stripe
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
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
                  <TableRow
                    key={sub.id}
                    className={cn(
                      "border-border/40",
                      sub.outOfSync && "bg-amber-50/30 dark:bg-amber-950/10",
                    )}
                  >
                    <TableCell>
                      <div className="font-medium text-sm">
                        {sub.firstName} {sub.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {sub.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {sub.subscriptionTier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {sub.accessExpiresAt
                        ? new Date(sub.accessExpiresAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {sub.isSuspended ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/40"
                        >
                          Suspended
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          sub.source === "stripe_only"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-muted",
                        )}
                      >
                        {sub.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onSuspend(sub)}
                      >
                        {sub.isSuspended ? (
                          <RotateCcw className="w-4 h-4" />
                        ) : (
                          <Ban className="w-4 h-4" />
                        )}
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
  );
}
