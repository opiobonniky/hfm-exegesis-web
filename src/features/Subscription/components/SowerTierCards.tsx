import { Check, ChevronDown, CreditCard, Gem, Heart, Loader2, Lock, Sparkles, Star, X, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";

export type TierId = "free" | "legacy_sower" | "covenant_sower";
export interface TierConfig {
  id: TierId; name: string; subtitle: string; description: string;
  yearlyPrice: number; monthlyPrice: number; color: string; gradient: string;
  icon: typeof Sparkles; features: { text: string; included: boolean }[];
  highlight?: string; slotLimit?: number; badge?: string;
}
export const TIERS: TierConfig[] = [
  {
    id: "free", name: "Free Reader", subtitle: "Start your journey",
    description: "Everything you need to begin reading Scripture daily.",
    yearlyPrice: 0, monthlyPrice: 0, color: "#64748B",
    gradient: "from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800", icon: BookOpen,
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
    id: "legacy_sower", name: "Legacy Sower", subtitle: "First 1,000 supporters",
    description: "Unlock the full study toolkit and become part of the founding generation.",
    yearlyPrice: 3333, monthlyPrice: 333, color: "#7C3AED",
    gradient: "from-violet-500 to-purple-600", icon: Sparkles, badge: "Best Value",
    highlight: "Most Popular", slotLimit: 1000,
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
    id: "covenant_sower", name: "Covenant Sower", subtitle: "Unlimited access",
    description: "The complete experience with AI-powered tools and early access to everything new.",
    yearlyPrice: 7777, monthlyPrice: 778, color: "#D97706",
    gradient: "from-amber-500 to-orange-600", icon: Gem, badge: "Full Access",
      { text: "Everything in Legacy Sower", included: true },
      { text: "AI Prayer & Reflection generation", included: true },
      { text: "Advanced analytics & reading insights", included: true },
      { text: "Early access to new features", included: true },
      { text: "Supporter badge on profile", included: true },
      { text: "API access (coming soon)", included: true },
];
export const FAQ_ITEMS = [
  { q: "Is Bible reading ever locked behind a subscription?", a: "No. Bible reading across all translations, chapters, and verses is always free. Subscription only gates advanced study tools, the Exegesis Lab, Legacy Ledger journaling, and AI-powered features." },
  { q: "What is the Legacy Sower 1,000 slot limit?", a: "The Legacy Sower tier is limited to the first 1,000 subscribers as a founding supporter reward. Once all 1,000 slots are claimed, only the Covenant Sower tier will be available for new subscribers." },
  { q: "Can I switch between monthly and yearly billing?", a: "Yes! You can switch between monthly and yearly billing at any time through the Stripe Customer Portal. Yearly plans save you approximately 20% compared to monthly." },
  { q: "What happens if I cancel my subscription?", a: "You'll retain access to all paid features until the end of your current billing period. After that, your account will revert to the Free Reader tier with no loss of your saved data, notes, highlights, or journal entries." },
  { q: "Is there a free trial?", a: "Free Reader access is always free — no trial needed. When you're ready for advanced tools, you can subscribe to Legacy Sower or Covenant Sower at any time." },
  { q: "Can I export my journal entries?", a: "Yes! Legacy Sower and Covenant Sower subscribers can export their entire Legacy Ledger (journal entries, reflections, prayers) at any time. Free Readers can create basic notes." },
export const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
export const formatTierLabel = (tierId: string): string => {
  switch (tierId) {
    case "free": return "Free Reader";
    case "legacy_sower": return "Legacy Sower";
    case "covenant_sower": return "Covenant Sower";
    case "legacy_sower_monthly": return "Legacy Sower";
    case "covenant_sower_monthly": return "Covenant Sower";
    default: return tierId;
  }
};
interface TierCardProps {
  tier: TierConfig; billingInterval: "month" | "year";
  isCurrentTier: boolean; isPaying: boolean;
  onSubscribe: (id: TierId) => void; onManage: () => void;
  checkoutLoading: string | null; portalLoading: boolean;
  isLegacySower: boolean; isCovenantSower: boolean;
export function TierCard({ tier, billingInterval, isCurrentTier, isPaying, onSubscribe, onManage, checkoutLoading, portalLoading, isLegacySower, isCovenantSower }: TierCardProps) {
  const Icon = tier.icon;
  const isFree = tier.id === "free";
  const price = billingInterval === "year" ? tier.yearlyPrice : tier.monthlyPrice;
  const periodLabel = billingInterval === "year" ? "/year" : "/month";
  return (
    <div className={cn(
      "relative flex flex-col rounded-2xl border bg-card dark:bg-card shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5",
      isCurrentTier && "ring-2 ring-offset-2",
      tier.id === "legacy_sower" && "ring-violet-500",
      tier.id === "covenant_sower" && "ring-amber-500",
      tier.id === "free" && isCurrentTier && "ring-slate-400",
    )}>
      {tier.highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
            <Star className="w-3 h-3 fill-current" />{tier.highlight}
          </span>
        </div>
      )}
      {tier.badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5",
            tier.id === "legacy_sower" && "border-violet-500/30 bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
            tier.id === "covenant_sower" && "border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          )}>{tier.badge}</Badge>
      {isCurrentTier && (
        <div className="absolute top-4 left-4 z-10">
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
            isLegacySower && "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
            isCovenantSower && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
            !isPaying && "bg-muted text-muted-foreground dark:bg-card dark:text-card-foreground",
          )}><Check className="w-2.5 h-2.5" />Current Plan</span>
      <div className="p-4 sm:p-6 pb-0">
        <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4",
          tier.id === "free" && "bg-muted dark:bg-card",
          tier.id === "legacy_sower" && "bg-violet-100 dark:bg-violet-900",
          tier.id === "covenant_sower" && "bg-amber-100 dark:bg-amber-900",
        )}>
          <Icon className={cn("w-5 h-5",
            tier.id === "free" && "text-muted-foreground dark:text-card-foreground",
            tier.id === "legacy_sower" && "text-violet-600 dark:text-violet-300",
            tier.id === "covenant_sower" && "text-amber-600 dark:text-amber-300",
          )} />
        <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
        <p className="text-xs text-muted-foreground mb-4">{tier.subtitle}</p>
        <div className="mb-5">
          {isFree ? (
            <div className="text-3xl font-black text-foreground">Free</div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-foreground">{formatPrice(price)}</span>
              <span className="text-sm text-muted-foreground font-medium">{periodLabel}</span>
            </div>
          )}
          {!isFree && billingInterval === "year" && (
            <p className="text-[11px] text-muted-foreground mt-1">{formatPrice(tier.monthlyPrice)}/mo if billed monthly</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tier.description}</p>
      </div>
      <div className="px-4 sm:px-6 flex-1">
        <div className="space-y-2 sm:space-y-2.5">
          {tier.features.map((f, i) => (
            <div key={i} className={cn("flex items-start gap-2.5", !f.included && "opacity-40")}>
              {f.included ? (
                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  tier.id === "legacy_sower" && "bg-violet-100 dark:bg-violet-900",
                  tier.id === "covenant_sower" && "bg-amber-100 dark:bg-amber-900",
                  tier.id === "free" && "bg-muted dark:bg-card",
                )}>
                  <Check className={cn("w-2.5 h-2.5",
                    tier.id === "legacy_sower" && "text-violet-600",
                    tier.id === "covenant_sower" && "text-amber-600",
                    tier.id === "free" && "text-muted-foreground",
                  )} strokeWidth={3} />
                </div>
              ) : (
                <Lock className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 mt-0.5" />
              )}
              <span className={cn("text-sm leading-5", f.included ? "text-foreground" : "text-muted-foreground/50")}>{f.text}</span>
          ))}
      <div className="p-4 sm:p-6 pt-4 sm:pt-5 mt-auto">
        {isCurrentTier ? (
          isPaying ? (
            <Button variant="outline" className="w-full gap-2 h-12 text-sm font-bold" onClick={onManage} disabled={portalLoading}>
              {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Manage Subscription
            </Button>
            <Button disabled variant="outline" className="w-full gap-2 h-12 text-sm font-bold">
              <Check className="w-4 h-4" />Current Plan
          )
        ) : isFree ? null : (
          <Button onClick={() => onSubscribe(tier.id)} disabled={checkoutLoading === tier.id}
            className={cn("w-full gap-2 h-12 text-sm font-bold shadow-lg transition-all",
              tier.id === "legacy_sower" && "bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/30",
              tier.id === "covenant_sower" && "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/30",
            )}>
            {checkoutLoading === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {billingInterval === "year" ? "Subscribe Yearly" : "Subscribe Monthly"}
          </Button>
        )}
    </div>
  );
