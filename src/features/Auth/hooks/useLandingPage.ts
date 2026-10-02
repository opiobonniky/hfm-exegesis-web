import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { scrollToSectionId } from "../utils";
import { usePublicNav } from "./usePublicNav";

export function useLandingPage() {
  const navigate = useNavigate();
  const { userInfo, loading: authLoading } = useAuth();
  const nav = usePublicNav();

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
