// SubscriptionExpiredHandler — global listener for expired-subscription responses.
// Shows a prompt and, after a timeout, routes the user to the subscription page
// so they can re-subscribe.
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const SOWER_PATH = "/sower";
const NAV_DELAY_MS = 6000; // time (ms) before auto-navigating

interface ExpiredDetail {
  returnMessage?: string;
  currentTier?: string;
}

export function SubscriptionExpiredHandler() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onExpired = (e: Event) => {
      const detail = (e as CustomEvent<ExpiredDetail>).detail || {};
      toast("Your subscription has expired", {
        description:
          detail.returnMessage ||
          "Renew your subscription to keep accessing premium study tools.",
        action: {
          label: "Subscribe Now",
          onClick: () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            navigate(SOWER_PATH);
          },
        },
        duration: 8000,
      });

      // Avoid double-redirect if already on the subscription page.
      if (pathname === SOWER_PATH) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        navigate(SOWER_PATH);
      }, NAV_DELAY_MS);
    };

    window.addEventListener("subscription-expired", onExpired);
    return () => {
      window.removeEventListener("subscription-expired", onExpired);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, pathname]);

  return null;
}
