import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, CalendarDays, Compass, Layers, Mail as MailIcon, Users } from "lucide-react";
import { useLanguage } from "@/components/languages/languageProvider";
import { tt } from "@/components/languages/hardcodedTranslate";
import { LANDING_NAV_ABOUT_SUBITEMS } from "../constants/landing";
import { getActiveSectionId, landingCopy, scrollToSectionId } from "../utils";
import type { MenuItem } from "../types";

export function usePublicNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const [activeNavKey, setActiveNavKey] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveNavKey(location.pathname);
      return;
    }
    const sectionIds = ["home", "features", "approach", "plans", "about", "choose-plan", "contact"];
    const available = sectionIds.filter((id) => document.getElementById(id));
    if (available.length === 0) return;
    const handler = () => setActiveNavKey(`#${getActiveSectionId(available)}`);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleMenuClick = useCallback(
    (href?: string) => {
      if (!href) return;
      setMobileMenuOpen(false);
      setExpandedMobileSection(null);
      if (href.startsWith("#")) {
        if (scrollToSectionId(href.slice(1))) return;
        navigate("/", { state: { scrollTo: href.slice(1) } });
        return;
      }
      navigate(href);
    },
    [navigate]
  );

  const aboutSubItems = LANDING_NAV_ABOUT_SUBITEMS.map((sub) => ({
    label: landingCopy(t, sub.labelKey, sub.fallback),
    href: sub.href,
  }));

  const menuItems: MenuItem[] = [
    {
      label: landingCopy(t, "navHome", tt("Home")),
      href: "#home",
      icon: BookOpen,
      description: landingCopy(t, "navHomeDesc", tt("Overview and study tools")),
      mobileColor: "#FFD68A",
    },
    {
      label: landingCopy(t, "navFeatures", tt("Features")),
      href: "#features",
      icon: Layers,
      description: landingCopy(t, "navFeaturesDesc", tt("Bible study tools in one place")),
      mobileColor: "#A7F3D0",
    },
    {
      label: landingCopy(t, "navStudyApproach", tt("Study Approach")),
      href: "#approach",
      icon: Compass,
      description: landingCopy(t, "navStudyApproachDesc", tt("Look, Listen, Learn, Abide, Apply")),
      mobileColor: "#FFB4B4",
    },
    {
      label: landingCopy(t, "navReadingPlans", tt("Reading Plans")),
      href: "#plans",
      icon: CalendarDays,
      description: landingCopy(t, "navReadingPlansDesc", tt("Focused reading journeys")),
      mobileColor: "#C7D2FE",
    },
    {
      label: landingCopy(t, "navAbout", tt("About Us")),
      icon: Users,
      description: landingCopy(t, "navAboutDesc", tt("Learn about our mission")),
      mobileColor: "#99F6E4",
      subItems: aboutSubItems,
    },
    {
      label: landingCopy(t, "navComparePlans", tt("Compare Plans")),
      href: "/plans",
      icon: Layers,
      description: landingCopy(t, "navComparePlansDesc", tt("Free Reader and paid plans")),
      mobileColor: "#FBCFE8",
    },
    {
      label: landingCopy(t, "navContact", tt("Contact Us")),
      href: "#contact",
      icon: MailIcon,
      description: landingCopy(t, "navContactDesc", tt("Get in touch")),
      mobileColor: "#FED7AA",
    },
  ];

  return {
    data: {
      menuItems,
      scrolled,
      mobileMenuOpen,
      menuPanelRef,
      expandedMobileSection,
      activeNavKey,
    },
    actions: {
      setMobileMenuOpen,
      setExpandedMobileSection,
      handleMenuClick,
    },
  };
}
