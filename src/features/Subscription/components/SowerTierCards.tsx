import { Check, CreditCard, Gem, Loader2, Lock, Sparkles, Star, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { tt } from '@/components/languages/hardcodedTranslate';
import { useLanguage } from '@/components/languages/languageProvider';
import { displayNumber } from '@/services/numberLocale/format';

export type TierId = "free" | "legacy_sower" | "covenant_sower";
export interface TierConfig {
  id: TierId; name: string; subtitle: string; description: string;
  yearlyPrice: number; monthlyPrice: number; color: string; gradient: string;
  icon: typeof Sparkles; features: { text: string; included: boolean }[];
  highlight?: string; slotLimit?: number; badge?: string;
  currency?: string; available?: boolean;
}

const feature = (text: string, included = true) => ({ text, included });
export const TIERS: TierConfig[] = [
  { id: "free", name: "Free Reader", subtitle: tt("Start your journey"), description: tt("Everything you need to begin reading Scripture daily."), yearlyPrice: 0, monthlyPrice: 0, color: "#64748B", gradient: "from-slate-50 to-slate-100", icon: BookOpen, features: [feature("Bible reading"), feature("Basic search"), feature("Notes and bookmarks"), feature("Daily Verse"), feature("Advanced study tools", false)] },
  { id: "legacy_sower", name: "Legacy Sower", subtitle: tt("Support Bible study"), description: '', yearlyPrice: 0, monthlyPrice: 0, available: false, color: "#7C3AED", gradient: "from-violet-500 to-purple-600", icon: Sparkles, features: [] },
  { id: "covenant_sower", name: "Covenant Sower", subtitle: tt("Support Bible study"), description: '', yearlyPrice: 0, monthlyPrice: 0, available: false, color: "#D97706", gradient: "from-amber-500 to-orange-600", icon: Gem, features: [] },
];

export const FAQ_ITEMS = [
  { q: "Is Bible reading ever locked behind a subscription?", a: "No. Bible reading is always free." },
  { q: "Can I switch between monthly and yearly billing?", a: "Yes, you can switch billing intervals through the customer portal." },
  { q: "What happens if I cancel?", a: "You retain paid access until the end of your billing period." },
];
export const formatPrice = (cents: number, lang: string = 'en'): string => displayNumber(cents / 100, lang, { style: 'currency', currency: 'USD' });
export const formatTierLabel = (tierId: string): string => tierId === "free" ? "Free Reader" : tierId === "legacy_sower" ? "Legacy Sower" : "Covenant Sower";

interface TierCardProps {
  tier: TierConfig; billingInterval: "month" | "year"; isCurrentTier: boolean; isPaying: boolean;
  onSubscribe: (id: TierId) => void; onManage: () => void; checkoutLoading: string | null;
  portalLoading: boolean; isLegacySower: boolean; isCovenantSower: boolean;
}
export function TierCard({ tier, billingInterval, isCurrentTier, isPaying, onSubscribe, onManage, checkoutLoading, portalLoading }: TierCardProps) {
  const { lang } = useLanguage();
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
      <p className="text-3xl font-black mb-2">{isFree ? tt("Free") : tier.available === false ? tt('Unavailable') : displayNumber(price / 100, lang, { style: 'currency', currency: tier.currency || 'USD' })}</p>
      {!isFree && tier.available !== false && <p className="text-xs text-muted-foreground">/{billingInterval === 'year' ? tt('year') : tt('month')}</p>}
      <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
      <div className="space-y-2 flex-1">
        {tier.features.map((f) => <div key={f.text} className={cn("flex items-start gap-2 text-sm", !f.included && "opacity-40")}><span>{f.included ? <Check className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4" />}</span>{f.text}</div>)}
      </div>
      <div className="pt-5">
        {isCurrentTier ? (isPaying ? <Button variant="outline" className="w-full" onClick={onManage} disabled={portalLoading}><CreditCard className="w-4 h-4 mr-2" />{tt("Manage Subscription")}</Button> : <Button disabled variant="outline" className="w-full"><Check className="w-4 h-4 mr-2" />{tt("Current Plan")}</Button>) : !isFree && <Button onClick={() => onSubscribe(tier.id)} disabled={tier.available === false || checkoutLoading !== null} className="w-full">{checkoutLoading === tier.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}{tt("Subscribe")}</Button>}
      </div>
    </div>
  );
}
