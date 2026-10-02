import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchLandingData } from "@/features/Auth/services/landingService";
import { LANDING_FEATURED_PLANS } from "../constants/landing";
import { mapLandingPlans, scrollToSectionId } from "../utils";
import { usePublicNav } from "./usePublicNav";
import type { LandingPlanItem } from "../types";

export function useLandingPage() {
  const navigate = useNavigate();
  const { userInfo, loading: authLoading } = useAuth();
  const nav = usePublicNav();
  // The curated cards render immediately and are replaced once the backend
  // responds, so a slow or failing request never empties the section.
  const [plans, setPlans] = useState<LandingPlanItem[]>(LANDING_FEATURED_PLANS);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const payload = await fetchLandingData(3);
      if (cancelled) return;
      const mapped = mapLandingPlans(payload?.readingPlans);
      if (mapped) setPlans(mapped);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authLoading && userInfo) navigate("/dashboard", { replace: true });
  }, [userInfo, authLoading, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pending = (window.history.state as { scrollTo?: string } | null)?.scrollTo;
    if (pending) scrollToSectionId(pending);
  }, []);

  const handleExploreFeatures = useCallback(() => {
    scrollToSectionId("features");
  }, []);

  const handleExploreStudyTools = useCallback(() => {
    scrollToSectionId("approach");
  }, []);

  return {
    data: {
      menuItems: nav.data.menuItems,
      scrolled: nav.data.scrolled,
      mobileMenuOpen: nav.data.mobileMenuOpen,
      menuPanelRef: nav.data.menuPanelRef,
      expandedMobileSection: nav.data.expandedMobileSection,
      activeNavKey: nav.data.activeNavKey,
      plans,
    },
    actions: {
      setMobileMenuOpen: nav.actions.setMobileMenuOpen,
      setExpandedMobileSection: nav.actions.setExpandedMobileSection,
      handleMenuClick: nav.actions.handleMenuClick,
      handleExploreFeatures,
      handleExploreStudyTools,
    },
  };
}
