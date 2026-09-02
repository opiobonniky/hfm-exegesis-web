"use client";

import { useGuestEntryPage } from "../hooks/useGuestEntryPage";
import { GuestEntryLayout } from "../components/GuestEntryLayout";
import { HeroSection } from "../components/HeroSection";
import { FeatureGrid } from "../components/FeatureGrid";
import { ActionButtons } from "../components/ActionButtons";

export default function GuestEntryPage() {
  const { navigate } = useGuestEntryPage();

  return (
    <GuestEntryLayout>
      <HeroSection />
      <FeatureGrid />
      <ActionButtons navigate={navigate} />
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </GuestEntryLayout>
  );
}
