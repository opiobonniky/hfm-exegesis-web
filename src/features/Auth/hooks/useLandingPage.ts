import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendPostRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export function useLandingPage() {
  const navigate = useNavigate();
  const { userInfo, loading: authLoading } = useAuth();
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [verseLoading, setVerseLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);

  // Track scroll position
  useEffect(() => {
    const el = document.getElementById("landing-scroll");
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 50);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Load daily verse
  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendPostRequest("bible", "get-todays-verse", {});
        if (res?.returnCode === 200 && res.returnData) setDailyVerse(res.returnData);
      } catch {} finally { setVerseLoading(false); }
    };
    load();
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuPanelRef.current && !menuPanelRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && userInfo) navigate("/dashboard", { replace: true });
  }, [userInfo, authLoading, navigate]);

  return {
    navigate, dailyVerse, verseLoading, mobileMenuOpen, setMobileMenuOpen,
    menuPanelRef, scrolled, expandedMobileSection, setExpandedMobileSection,
    authLoading, userInfo,
  };
}
