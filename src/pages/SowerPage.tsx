import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Gem,
  Heart,
  Loader2,
  Lock,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// ── Types ──────────────────────────────────────────────────────────────────

type BillingInterval = "month" | "year";
type TierId = "free" | "legacy_sower" | "covenant_sower";

// ── Tier Configuration ─────────────────────────────────────────────────────

interface TierConfig {
  id: TierId;
  name: string;
  subtitle: string;
  description: string;
  yearlyPrice: number;
  monthlyPrice: number;
  color: string;
  gradient: string;
  icon: typeof Sparkles;
  features: { text: string; included: boolean }[];
  highlight?: string;
  slotLimit?: number;
  badge?: string;
}

const TIERS: TierConfig[] = [
  {
    id: "free",
    name: "Free Reader",
    subtitle: "Start your journey",
    description: "Everything you need to begin reading Scripture daily.",
    yearlyPrice: 0,
    monthlyPrice: 0,
    color: "#64748B",
    gradient: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
    icon: BookOpen,
    features: [
      { text: "Bible reading — all 28+ translations", included: true },
      { text: "Basic search (keyword)", included: true },
      { text: "Notes, highlights, bookmarks", included: true },
      { text: "Daily Verse & Devotional", included: true },
      { text: "Bible Trivia", included: true },
      { text: "Dark mode / theme", included: true },
      { text: "Advanced search (Strong's, Topics, Lemma)", included: false },
      { text: "Exegesis Lab (full 4 stages)", included: false },
      { text: "Reading Plans with progress", included: false },
      { text: "Legacy Ledger (full journal)", included: false },
    ],
  },
  {
    id: "legacy_sower",
    name: "Legacy Sower",
    subtitle: "First 1,000 supporters",
    description:
      "Unlock the full study toolkit and become part of the founding generation.",
    yearlyPrice: 3333, // $33.33 in cents
    monthlyPrice: 333, // $3.33 in cents
    color: "#7C3AED",
    gradient: "from-violet-500 to-purple-600",
    icon: Sparkles,
    badge: "Best Value",
    highlight: "Most Popular",
    slotLimit: 1000,
    features: [
      { text: "Everything in Free Reader", included: true },
      { text: "Explain Bible & Study Notes", included: true },
      { text: "Advanced Search (Strong's, Topics, Lemma)", included: true },
      { text: "Cross-Translation Search", included: true },
      { text: "Reading Plans with progress tracking", included: true },
      { text: "Exegesis Lab — all 4 stages", included: true },
      { text: "Legacy Ledger (full journal + export)", included: true },
      { text: "Priority support", included: true },
      { text: "Prayer & Reflection generation", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Early access to new features", included: false },
    ],
  },
  {
    id: "covenant_sower",
    name: "Covenant Sower",
    subtitle: "Unlimited access",
    description:
      "The complete experience with AI-powered tools and early access to everything new.",
    yearlyPrice: 7777, // $77.77 in cents
    monthlyPrice: 778, // $7.78 in cents
    color: "#D97706",
    gradient: "from-amber-500 to-orange-600",
    icon: Gem,
    badge: "Full Access",
    features: [
      { text: "Everything in Legacy Sower", included: true },
      { text: "AI Prayer & Reflection generation", included: true },
      { text: "Advanced analytics & reading insights", included: true },
      { text: "Early access to new features", included: true },
      { text: "Supporter badge on profile", included: true },
      { text: "API access (coming soon)", included: true },
    ],
  },
];

// ── FAQ Data ───────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "Is Bible reading ever locked behind a subscription?",
    a: "No. Bible reading across all translations, chapters, and verses is always free. Subscription only gates advanced study tools, the Exegesis Lab, Legacy Ledger journaling, and AI-powered features.",
  },
  {
    q: "What is the Legacy Sower 1,000 slot limit?",
    a: "The Legacy Sower tier is limited to the first 1,000 subscribers as a founding supporter reward. Once all 1,000 slots are claimed, only the Covenant Sower tier will be available for new subscribers.",
  },
  {
    q: "Can I switch between monthly and yearly billing?",
    a: "Yes! You can switch between monthly and yearly billing at any time through the Stripe Customer Portal. Yearly plans save you approximately 20% compared to monthly.",
  },
  {
    q: "What happens if I cancel my subscription?",
    a: "You'll retain access to all paid features until the end of your current billing period. After that, your account will revert to the Free Reader tier with no loss of your saved data, notes, highlights, or journal entries.",
  },
  {
    q: "Is there a free trial?",
    a: "Free Reader access is always free — no trial needed. When you're ready for advanced tools, you can subscribe to Legacy Sower or Covenant Sower at any time.",
  },
  {
    q: "Can I export my journal entries?",
    a: "Yes! Legacy Sower and Covenant Sower subscribers can export their entire Legacy Ledger (journal entries, reflections, prayers) at any time. Free Readers can create basic notes.",
  },
];

// ── Format helpers ─────────────────────────────────────────────────────────

const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

const formatTierLabel = (tierId: string): string => {
  switch (tierId) {
    case "free": return "Free Reader";
    case "legacy_sower": return "Legacy Sower";
    case "covenant_sower": return "Covenant Sower";
    case "legacy_sower_monthly": return "Legacy Sower";
    case "covenant_sower_monthly": return "Covenant Sower";
    default: return tierId;
  }
};

// ── Main Component ─────────────────────────────────────────────────────────

export default function SowerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const { subscriptionTier, accessExpiresAt, fetchSubscriptionStatus } = useAuth();
  const [searchParams] = useSearchParams();

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("month");
  const [openFaq, setOpenFaq] = useState<number | null>(null);


  // ── Handle checkout URL params ──
  useEffect(() => {
    const subscription = searchParams.get("subscription");
    const checkoutType = searchParams.get("type");
    if (subscription === "success" || checkoutType === "upgraded") {
      toast({
        title: "Subscription successful!",
        description: "Your payment has been processed successfully.",
      });
      // Refresh status via AuthContext
      fetchSubscriptionStatus();
    } else if (subscription === "cancelled") {
      toast({
        title: "Checkout cancelled",
        description: "No charges were made. You can try again anytime.",
      });
    }
  }, [searchParams, toast, fetchSubscriptionStatus]);

  // ── Checkout handler ──
  const handleSubscribe = useCallback(
    async (tier: "legacy_sower" | "covenant_sower") => {
      setCheckoutLoading(tier);
      try {
        const res = await sendPostRequest("subscriptions", "create-checkout-session", {
          tier,
          interval: billingInterval,
        });
        if (res.returnCode === 200 && res.returnData?.url) {
          window.open(res.returnData.url, "_blank");
        } else {
          toast({
            title: "Checkout failed",
            description:
              res.returnMessage || "Could not create checkout session.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setCheckoutLoading(null);
      }
    },
    [billingInterval, toast],
  );

  // ── Portal handler ──
  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await sendPostRequest(
        "subscriptions",
        "create-portal-session",
        {},
      );
      if (res.returnCode === 200 && res.returnData?.url) {
        window.open(res.returnData.url, "_blank");
      } else {
        toast({
          title: "Portal error",
          description: res.returnMessage || "Could not open billing portal.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  }, [toast]);

  // ── Determine user's current tier (from AuthContext) ──
  const currentTierRaw = subscriptionTier || "free";
  const isLegacySower = currentTierRaw.startsWith("legacy_sower");
  const isCovenantSower = currentTierRaw.startsWith("covenant_sower");
  const isPaying = isLegacySower || isCovenantSower;
  const currentTierLabel = formatTierLabel(currentTierRaw);
  const expiresAt = accessExpiresAt
    ? new Date(accessExpiresAt).toLocaleDateString()
    : null;

  return (
    <div className="min-h-full bg-background overflow-x-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-950 via-violet-900 to-violet-800">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-card/[0.02] blur-2xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-12 sm:py-24">
          {/* Top bar: back + badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-300 hover:text-white transition-colors self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {isPaying && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/10 border border-white/20 backdrop-blur-sm self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  You are a {currentTierLabel}
                </span>
                {expiresAt && (
                  <span className="text-[10px] text-violet-300 whitespace-nowrap">
                    · Renews {expiresAt}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-card/10 backdrop-blur-sm flex items-center justify-center mb-5 sm:mb-6 border border-white/20">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-amber-300" />
            </div>

            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 px-2"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Sow into the Word
            </h1>
            <p className="text-base sm:text-xl text-violet-200 max-w-2xl mb-2 font-medium px-4">
              The Word remains free. Your support makes the mission possible.
            </p>
            <p className="text-xs sm:text-sm text-violet-300/70 max-w-xl italic mb-8 px-4">
              "Whoever sows sparingly will also reap sparingly, and whoever sows
              bountifully will also reap bountifully."
              <br />
              <span className="text-xs text-violet-300/50">
                — 2 Corinthians 9:6
              </span>
            </p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setBillingInterval("month")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all",
                billingInterval === "month"
                  ? "bg-card text-violet-900 shadow-lg"
                  : "bg-card/10 text-violet-200 hover:bg-card/20",
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all",
                billingInterval === "year"
                  ? "bg-card text-violet-900 shadow-lg"
                  : "bg-card/10 text-violet-200 hover:bg-card/20",
              )}
            >
              Yearly
              <span className="ml-1.5 text-[10px] font-semibold opacity-70">
                ~20% off
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════ TIER CARDS ══════════════════ */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 -mt-8 sm:-mt-10 pb-10 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isFree = tier.id === "free";
            const isCurrentTier =
              (tier.id === "free" && !isPaying) ||
              (tier.id === "legacy_sower" && isLegacySower) ||
              (tier.id === "covenant_sower" && isCovenantSower);

            const price =
              billingInterval === "year" ? tier.yearlyPrice : tier.monthlyPrice;
            const periodLabel = billingInterval === "year" ? "/year" : "/month";

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card dark:bg-card shadow-sm transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-0.5",
                  isCurrentTier && "ring-2 ring-offset-2",
                  tier.id === "legacy_sower" && "ring-violet-500",
                  tier.id === "covenant_sower" && "ring-amber-500",
                  tier.id === "free" && isCurrentTier && "ring-slate-400",
                )}
              >
                {/* Highlight badge */}
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
                      <Star className="w-3 h-3 fill-current" />
                      {tier.highlight}
                    </span>
                  </div>
                )}

                {/* Badge */}
                {tier.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5",
                        tier.id === "legacy_sower" &&
                          "border-violet-500/30 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
                        tier.id === "covenant_sower" &&
                          "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
                      )}
                    >
                      {tier.badge}
                    </Badge>
                  </div>
                )}

                {/* Current plan indicator */}
                {isCurrentTier && (
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isLegacySower &&
                          "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
                        isCovenantSower &&
                          "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
                        !isPaying &&
                          "bg-muted text-muted-foreground dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      <Check className="w-2.5 h-2.5" />
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Card header */}
                <div className="p-4 sm:p-6 pb-0">
                  <div
                    className={cn(
                      "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4",
                      tier.id === "free" && "bg-muted dark:bg-slate-800",
                      tier.id === "legacy_sower" &&
                        "bg-violet-100 dark:bg-violet-900",
                      tier.id === "covenant_sower" &&
                        "bg-amber-100 dark:bg-amber-900",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        tier.id === "free" &&
                          "text-muted-foreground dark:text-slate-300",
                        tier.id === "legacy_sower" &&
                          "text-violet-600 dark:text-violet-300",
                        tier.id === "covenant_sower" &&
                          "text-amber-600 dark:text-amber-300",
                      )}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {tier.subtitle}
                  </p>

                  {/* Price */}
                  <div className="mb-5">
                    {isFree ? (
                      <div className="text-3xl font-black text-foreground">
                        Free
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-foreground">
                          {formatPrice(price)}
                        </span>
                        <span className="text-sm text-muted-foreground font-medium">
                          {periodLabel}
                        </span>
                      </div>
                    )}
                    {!isFree && billingInterval === "year" && (
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {formatPrice(tier.monthlyPrice)}/mo if billed monthly
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {tier.description}
                  </p>
                </div>

                {/* Features */}
                <div className="px-4 sm:px-6 flex-1">
                  <div className="space-y-2 sm:space-y-2.5">
                    {tier.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "flex items-start gap-2.5",
                          !feature.included && "opacity-40",
                        )}
                      >
                        {feature.included ? (
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                              tier.id === "legacy_sower" &&
                                "bg-violet-100 dark:bg-violet-900",
                              tier.id === "covenant_sower" &&
                                "bg-amber-100 dark:bg-amber-900",
                              tier.id === "free" &&
                                "bg-muted dark:bg-slate-800",
                            )}
                          >
                            <Check
                              className={cn(
                                "w-2.5 h-2.5",
                                tier.id === "legacy_sower" && "text-violet-600",
                                tier.id === "covenant_sower" &&
                                  "text-amber-600",
                                tier.id === "free" && "text-muted-foreground",
                              )}
                              strokeWidth={3}
                            />
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            "text-sm leading-5",
                            feature.included
                              ? "text-foreground"
                              : "text-muted-foreground/50",
                          )}
                        >
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="p-4 sm:p-6 pt-4 sm:pt-5 mt-auto">
                  {isCurrentTier ? (
                    <>
                      {isPaying ? (
                        <Button
                          variant="outline"
                          className="w-full gap-2 h-12 text-sm font-bold"
                          onClick={handleManageSubscription}
                          disabled={portalLoading}
                        >
                          {portalLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                          Manage Subscription
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="outline"
                          className="w-full gap-2 h-12 text-sm font-bold"
                        >
                          <Check className="w-4 h-4" />
                          Current Plan
                        </Button>
                      )}
                    </>
                  ) : isFree ? null : (
                    <Button
                      onClick={() =>
                        handleSubscribe(
                          tier.id as "legacy_sower" | "covenant_sower",
                        )
                      }
                      disabled={checkoutLoading === tier.id}
                      className={cn(
                        "w-full gap-2 h-12 text-sm font-bold shadow-lg transition-all",
                        tier.id === "legacy_sower" &&
                          "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/30 hover:shadow-violet-500/40",
                        tier.id === "covenant_sower" &&
                          "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/30 hover:shadow-amber-500/40",
                      )}
                    >
                      {checkoutLoading === tier.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {billingInterval === "year"
                        ? `Subscribe Yearly`
                        : "Subscribe Monthly"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════ FEATURE COMPARISON ══════════════════ */}
      <section className="bg-card border-t border-border/50 py-14">
        <div className="max-w-4xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              Compare Plans
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Everything you need to grow in Scripture — free and paid.
            </p>
          </div>

          <div className="-mx-4 sm:mx-0 overflow-x-auto">
             <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 pr-4 text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Feature
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      key={tier.id}
                      className="py-3 px-2 sm:px-4 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider"
                    >
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    category: "Reading",
                    items: [
                      {
                        label: "Bible Reader (all translations)",
                        free: true,
                        legacy: true,
                        covenant: true,
                      },
                    ],
                  },
                  {
                    category: "Study Tools",
                    items: [
                      {
                        label: "Basic Search",
                        free: true,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Strong's / Topics / Lemma Search",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Cross-Translation Search",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Exegesis Lab (full 4 stages)",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Reading Plans with progress",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                    ],
                  },
                  {
                    category: "Journaling",
                    items: [
                      {
                        label: "Basic Notes",
                        free: true,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Legacy Ledger (full journal)",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Journal Export",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                    ],
                  },
                  {
                    category: "AI & Analytics",
                    items: [
                      {
                        label: "Explain Bible & Study Notes",
                        free: false,
                        legacy: true,
                        covenant: true,
                      },
                      {
                        label: "Prayers & Reflection",
                        free: false,
                        legacy: false,
                        covenant: true,
                      },
                      {
                        label: "Advanced Analytics",
                        free: false,
                        legacy: false,
                        covenant: true,
                      },
                      {
                        label: "Early Access Features",
                        free: false,
                        legacy: false,
                        covenant: true,
                      },
                    ],
                  },
                ].map((section) => (
                  <tbody key={section.category}>
                    <tr className="border-t border-border/30">
                      <td
                        colSpan={4}
                        className="py-2.5 text-[10px] font-black text-primary uppercase tracking-wider"
                      >
                        {section.category}
                      </td>
                    </tr>
                    {section.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-2.5 pr-2 sm:pr-4 text-xs sm:text-sm text-foreground">
                          {item.label}
                        </td>
                        {[item.free, item.legacy, item.covenant].map(
                          (included, tIdx) => (
                            <td key={tIdx} className="py-2.5 px-2 sm:px-4 text-center">
                              {included ? (
                                <Check className="w-4 h-4 mx-auto text-emerald-500" />
                              ) : (
                                <X className="w-3.5 h-3.5 mx-auto text-muted-foreground/30" />
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════ PRINCIPLE BANNER ══════════════════ */}
      <section className="bg-gradient-to-r from-violet-600 to-purple-700 py-10">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-card/15 mb-4">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            Bible Reading Is Always Free
          </h2>
          <p className="text-violet-200 text-sm max-w-xl mx-auto leading-relaxed px-2">
            Subscription only gates advanced study tools, not Scripture itself.
            Every translation, every chapter, every verse remains freely
            accessible to everyone — always.
          </p>
        </div>
      </section>

      {/* ══════════════════ FAQ ══════════════════ */}
      <section className="py-14 bg-background">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-muted-foreground">
              Everything you need to know about sowing.
            </p>
          </div>

          <div className="space-y-2">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-border/50 bg-card overflow-hidden"
                >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-semibold text-foreground flex-1 leading-relaxed">
                        {faq.q}
                      </span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════ FOOTER ══════════════════ */}
      <footer className="border-t border-border/50 py-8 bg-card">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              EXEGESIS
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            The Word remains free. Scripture is never locked behind a
            subscription.
          </p>
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()} Exegesis Project
          </p>
        </div>
      </footer>
    </div>
  );
}
