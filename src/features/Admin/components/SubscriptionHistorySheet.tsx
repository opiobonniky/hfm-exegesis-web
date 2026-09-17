// SubscriptionHistorySheet — renewal/event timeline for one subscriber.
// Fetches admin/subscriptions/history on open and renders a vertical
// timeline: icon chip per event type, tier change arrows, and metadata
// details (previous tier, period end, actor, Stripe ids).
import { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  CalendarClock,
  CalendarPlus,
  CreditCard,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { adminApi } from "../services/adminApi";
import { formatReadableDate } from "../utils";
import { cn } from "@/lib/utils";
import type { SubscribedUser } from "../types";

interface SubscriptionEvent {
  id: string;
  eventType: string; // created | renewed | cancelled | expired | upgraded | downgraded
  tier: string;
  stripeEventId: string | null;
  metadata: Record<string, unknown> | null;
  createdOn: string;
}

interface HistoryUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  subscriptionTier: string;
  accessExpiresAt: string | null;
  createdOn: string | null;
}

interface Props {
  user: SubscribedUser | null;
  onOpenChange: (open: boolean) => void;
}

const EVENT_STYLE: Record<
  string,
  { icon: typeof Sparkles; chip: string; label: string }
> = {
  created: {
    icon: Sparkles,
    chip: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    label: "Subscribed",
  },
  renewed: {
    icon: RefreshCw,
    chip: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
    label: "Renewed",
  },
  upgraded: {
    icon: ArrowUpRight,
    chip: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    label: "Upgraded",
  },
  downgraded: {
    icon: ArrowDownRight,
    chip: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    label: "Downgraded",
  },
  cancelled: {
    icon: CalendarClock,
    chip: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    label: "Cancelled",
  },
  expired: {
    icon: History,
    chip: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
    label: "Expired",
  },
};

function eventStyle(type: string) {
  return (
    EVENT_STYLE[type] ?? {
      icon: CreditCard,
      chip: "bg-muted text-muted-foreground",
      label: type,
    }
  );
}

/** short human summary for metadata payloads written by sync/webhook/admin flows */
function metaSummary(meta: Record<string, unknown> | null): string[] {
  if (!meta || typeof meta !== "object") return [];
  const out: string[] = [];
  const prev = meta.previousTier;
  if (typeof prev === "string" && prev) out.push(`from ${prev}`);
  if (meta.previousExpiry)
    out.push(`was until ${formatReadableDate(String(meta.previousExpiry))}`);
  if (meta.periodEnd)
    out.push(`until ${formatReadableDate(String(meta.periodEnd))}`);
  if (meta.newExpiry)
    out.push(`now until ${formatReadableDate(String(meta.newExpiry))}`);
  if (typeof meta.reason === "string" && meta.reason)
    out.push(`reason: ${meta.reason}`);
  if (typeof meta.action === "string" && meta.action === "suspended")
    out.push("suspended by admin");
  if (typeof meta.action === "string" && meta.action === "unsuspended")
    out.push("reactivated by admin");
  if (typeof meta.action === "string" && meta.action === "expiry_repair")
    out.push("manual repair");
  if (meta.syncedBy || meta.updatedBy)
    out.push(`by admin ${String(meta.syncedBy ?? meta.updatedBy).slice(0, 8)}`);
  return out;
}

export function SubscriptionHistorySheet({ user, onOpenChange }: Props) {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [profile, setProfile] = useState<HistoryUser | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const res = await adminApi.request("admin", "subscriptions/history", { userId, limit: 100 });
      if (res?.returnCode === 200) {
        setEvents(res.returnData?.events ?? []);
        setProfile(res.returnData?.user ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setEvents([]);
      setProfile(null);
      load(String(user.id));
    }
  }, [user, load]);

  const name = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email
    : "";

  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="border-b p-5 pb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4 text-primary" />
            Subscription history
          </SheetTitle>
          <SheetDescription className="text-xs">
            {name ? `${name} · ${user?.email}` : "Loading…"}
          </SheetDescription>
          {profile && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="outline" className="text-[10px] capitalize">
                {profile.subscriptionTier}
              </Badge>
              {profile.accessExpiresAt && (
                <Badge variant="outline" className="text-[10px]">
                  renews {formatReadableDate(profile.accessExpiresAt)}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CalendarPlus className="w-10 h-10 mb-3 text-muted-foreground/40" />
              <p className="text-sm font-medium">No events recorded</p>
              <p className="text-xs text-muted-foreground mt-1">
                Subscription changes (renewals, upgrades, cancellations) will
                appear here as they happen.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-5 before:absolute before:inset-y-1 before:left-[15px] before:w-px before:bg-border">
              {events.map((e) => {
                const { icon: Icon, chip, label } = eventStyle(e.eventType);
                const meta = metaSummary(e.metadata);
                return (
                  <li key={e.id} className="relative flex gap-3">
                    <span
                      className={cn(
                        "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        chip,
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <p className="text-sm font-semibold leading-tight">
                          {label}
                        </p>
                        <Badge
                          variant="outline"
                          className="px-1.5 py-0 text-[10px] capitalize"
                        >
                          {e.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatReadableDate(e.createdOn)}
                      </p>
                      {meta.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5">
                          {meta.map((m, i) => (
                            <li
                              key={i}
                              className="text-[11px] text-muted-foreground/80 flex items-start gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5 mt-1 shrink-0 opacity-40" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      )}
                      {e.stripeEventId && (
                        <p className="mt-1 font-mono text-[10px] text-muted-foreground/50 truncate">
                          {e.stripeEventId}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
