import { Check, CreditCard, Gem, Loader2, Lock, Sparkles, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type TierId = "free" | "legacy_sower" | "covenant_sower";
export interface TierConfig {
  id: TierId; name: string; subtitle: string; description: string;
  yearlyPrice: number; monthlyPrice: number; color: string; gradient: string;
  icon: typeof Sparkles; features: { text: string; included: boolean }[];
  highlight?: string; slotLimit?: number; badge?: string;
}

const feature = (text: string, included = true) => ({ text, included });
export const TIERS: TierConfig[] = [
  { id: "free", name: "Free Reader", subtitle: "Start your journey", description: "Everything you need to begin reading Scripture daily.", yearlyPrice: 0, monthlyPrice: 0, color: "#64748B", gradient: "from-slate-50 to-slate-100", icon: BookOpen, features: [feature("Bible reading"), feature("Basic search"), feature("Notes and bookmarks"), feature("Daily Verse"), feature("Advanced study tools", false)] },
  { id: "legacy_sower", name: "Legacy Sower", subtitle: "First 1,000 supporters", description: "Unlock the full study toolkit.", yearlyPrice: 3333, monthlyPrice: 333, color: "#7C3AED", gradient: "from-violet-500 to-purple-600", icon: Sparkles, badge: "Best Value", highlight: "Most Popular", slotLimit: 1000, features: [feature("Everything in Free Reader"), feature("Advanced Search"), feature("Exegesis Lab"), feature("Legacy Ledger"), feature("AI-powered tools", false)] },
  { id: "covenant_sower", name: "Covenant Sower", subtitle: "Unlimited access", description: "The complete experience with AI-powered tools.", yearlyPrice: 7777, monthlyPrice: 778, color: "#D97706", gradient: "from-amber-500 to-orange-600", icon: Gem, badge: "Full Access", features: [feature("Everything in Legacy Sower"), feature("AI Prayer and Reflection"), feature("Advanced analytics"), feature("Early access to new features")] },
];

export const FAQ_ITEMS = [
  { q: "Is Bible reading ever locked behind a subscription?", a: "No. Bible reading is always free." },
  { q: "Can I switch between monthly and yearly billing?", a: "Yes, you can switch billing intervals through the customer portal." },
  { q: "What happens if I cancel?", a: "You retain paid access until the end of your billing period." },
];
export const formatPrice = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
export const formatTierLabel = (tierId: string): string => tierId === "free" ? "Free Reader" : tierId === "legacy_sower" ? "Legacy Sower" : "Covenant Sower";

interface TierCardProps {
  tier: TierConfig; billingInterval: "month" | "year"; isCurrentTier: boolean; isPaying: boolean;
  onSubscribe: (id: TierId) => void; onManage: () => void; checkoutLoading: string | null;
  portalLoading: boolean; isLegacySower: boolean; isCovenantSower: boolean;
}
export function TierCard({ tier, billingInterval, isCurrentTier, isPaying, onSubscribe, onManage, checkoutLoading, portalLoading }: TierCardProps) {
  const Icon = tier.icon;
  const isFree = tier.id === "free";
  const price = billingInterval === "year" ? tier.yearlyPrice : tier.monthlyPrice;
  return (
    <div className="relative flex flex-col rounded-2xl border bg-card shadow-sm p-5">
      {tier.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold text-white"><Star className="inline w-3 h-3" /> {tier.highlight}</span>}
      {tier.badge && <Badge variant="outline" className="absolute top-4 right-4 text-[10px]">{tier.badge}</Badge>}
      <Icon className="w-8 h-8 mb-3" style={{ color: tier.color }} />
      <h3 className="text-lg font-bold">{tier.name}</h3>
      <p className="text-xs text-muted-foreground mb-4">{tier.subtitle}</p>
      <p className="text-3xl font-black mb-2">{isFree ? "Free" : formatPrice(price)}</p>
      <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
      <div className="space-y-2 flex-1">
        {tier.features.map((f) => <div key={f.text} className={cn("flex items-start gap-2 text-sm", !f.included && "opacity-40")}><span>{f.included ? <Check className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4" />}</span>{f.text}</div>)}
      </div>
      <div className="pt-5">
        {isCurrentTier ? (isPaying ? <Button variant="outline" className="w-full" onClick={onManage} disabled={portalLoading}><CreditCard className="w-4 h-4 mr-2" />Manage Subscription</Button> : <Button disabled variant="outline" className="w-full"><Check className="w-4 h-4 mr-2" />Current Plan</Button>) : !isFree && <Button onClick={() => onSubscribe(tier.id)} disabled={checkoutLoading === tier.id} className="w-full">{checkoutLoading === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}Subscribe</Button>}
      </div>
    </div>
  );
}
