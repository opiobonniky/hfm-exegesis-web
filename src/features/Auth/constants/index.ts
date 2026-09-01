// ─── Auth Constants ──────────────────────────────────────────────────────────

import { BookOpen, BookText, Microscope, Heart } from "lucide-react";

// ── Onboarding ──
export const ONBOARDING_KEY = "onboarding_completed";

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}
export function completeOnboarding(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}
export function resetOnboarding(): void {
  localStorage.removeItem(ONBOARDING_KEY);
}

export interface Slide {
  icon: typeof BookOpen;
  title: string;
  subtitle: string;
  description: string;
  bgGradient: string;
  iconBg: string;
  iconColor: string;
}

export const SLIDES: Slide[] = [
  {
    icon: BookOpen,
    title: "The Word",
    subtitle: "Read deeply. Study clearly.",
    description: "Read the Bible in a clean, distraction-free space. Every translation, every chapter, every verse — always accessible.",
    bgGradient: "from-indigo-600 to-indigo-800",
    iconBg: "bg-card/15",
    iconColor: "text-white",
  },
  {
    icon: BookText,
    title: "The Tools",
    subtitle: "Discover the original languages",
    description: "Tap verses and words to discover context, Strong's definitions, cross-references, and study helps. The Bible comes alive when you understand the original meaning.",
    bgGradient: "from-violet-600 to-violet-800",
    iconBg: "bg-card/15",
    iconColor: "text-white",
  },
  {
    icon: Microscope,
    title: "The Lab",
    subtitle: "A guided study journey",
    description: "Learn to study Scripture through the 4-step Exegesis Lab: Look, Listen, Learn, and Abide. Each step draws you deeper into the Word.",
    bgGradient: "from-emerald-600 to-emerald-800",
    iconBg: "bg-card/15",
    iconColor: "text-white",
  },
  {
    icon: Heart,
    title: "The Legacy Ledger",
    subtitle: "Your private journal",
    description: "Save your reflections, prayers, and studies into your private journal. Build a lifelong archive of what God is teaching you through His Word.",
    bgGradient: "from-amber-500 to-amber-700",
    iconBg: "bg-card/15",
    iconColor: "text-white",
  },
];
