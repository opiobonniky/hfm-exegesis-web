// ── SplashScreen ────────────────────────────────────────────────────────────
// First visual impression of the app. Matches Spec Screen 1.
// Shows the Exegesis logo, app name, and loading text while checking auth state.
// After auth resolves, it simply dismisses; ProtectedRoute guards the route.

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

// ── Props ──────────────────────────────────────────────────────────────────

interface SplashScreenProps {
  children: React.ReactNode;
  /** How long (ms) to show the splash at minimum (for branding impression) */
  minDisplayMs?: number;
}

// ── Splash overlay presentational component ────────────────────────────────

function SplashOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade in after mount
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${
        visible
          ? "opacity-85 animate-spin"
          : "bg-transparent animate-spin"
      }`}
    >
      {/* Background decorative elements */}
    </div>
  );
}

// ── SplashScreen wrapper ───────────────────────────────────────────────────
// Shows branded splash while auth resolves, then gates + routes to correct destination.

export default function SplashScreen({
  children,
  minDisplayMs = 2000,
}: SplashScreenProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  const handleComplete = useCallback(() => {
    setDismissed(true);
    // Authenticated users: just dismiss the splash.
    // ProtectedRoute already guards the route underneath; no redirect needed.
    // This prevents every page navigation from being hijacked to /user-dashboard.
  }, []);

  useEffect(() => {
    if (authLoading) return; // keep showing splash while auth loads

    // Auth resolved — wait minimum display time, then complete
    const timer = setTimeout(handleComplete, minDisplayMs);
    return () => clearTimeout(timer);
  }, [authLoading, minDisplayMs, handleComplete]);

  if (dismissed) return <>{children}</>;

  return <SplashOverlay />;
}
