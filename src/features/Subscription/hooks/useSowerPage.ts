import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useSubscription } from "@/hooks/useSubscription";

export type BillingInterval = "month" | "year";
export interface Plan {
  id: string; name: string; description: string; price: number;
  currency: string; interval: string; features: string[];
}
export const FAQ_ITEMS = [
  { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your account settings." },
  { q: "Is there a free trial?", a: "You can try Exegesis for free with limited features before upgrading." },
  { q: "What payment methods are accepted?", a: "We accept all major credit cards through our secure payment partner Stripe." },
];
export function useSowerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPayingUser, tierLabel } = useSubscription();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("month");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await sendPostRequest("subscriptions", "get-plans", {});
        if (res.returnCode === 200 && Array.isArray(res.returnData)) setPlans(res.returnData);
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);
  const handleSubscribe = useCallback(async (planId: string) => {
    setCheckoutLoading(planId);
    try {
      const res = await sendPostRequest("subscriptions", "create-checkout", { planId, interval: billingInterval });
      if (res.returnCode === 200 && res.returnData?.url) {
        window.location.href = res.returnData.url;
      } else { toast({ title: "Error", description: res.returnMessage, variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setCheckoutLoading(null); }
  }, [billingInterval, toast]);
  const handleManageSubscription = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await sendPostRequest("subscriptions", "create-portal-session", {});
      if (res.returnCode === 200 && res.returnData?.url) window.open(res.returnData.url, "_blank");
      else { toast({ title: "Error", variant: "destructive" }); }
    } catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setPortalLoading(false); }
  }, [toast]);
  const filteredPlans = plans.filter((p) => {
    if (billingInterval === "month") return p.interval === "month";
    return p.interval === "year";
  });
  return {
    plans, loading, checkoutLoading, portalLoading, billingInterval, setBillingInterval,
    openFaq, setOpenFaq, isPayingUser, tierLabel, filteredPlans,
    handleSubscribe, handleManageSubscription, navigate,
  };
