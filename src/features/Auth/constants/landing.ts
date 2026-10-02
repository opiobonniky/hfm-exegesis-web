import {
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  Ear,
  Eye,
  Flame,
  Heart,
  Microscope,
  NotebookPen,
  Sparkles,
  Trophy,
} from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { LandingFeatureItem, LandingPlanColumn, LandingPlanItem, LandingStepItem } from "../types";

export const LANDING_HERO = {
  eyebrow: tt("THE EXEGESIS PROJECT"),
  title: tt("A Bible Study App to Read, Understand, and Apply Scripture"),
  body: tt("Build a meaningful habit of studying God\u2019s Word. Explore Bible reading, verse explanations, Greek and Hebrew word studies, reading plans, devotionals, and journaling with the Exegesis Project."),
  support: tt("Free Bible reading and basic tools, with additional features available through paid plans."),
  primaryLabel: tt("Start Reading Free"),
  primaryHref: "/register",
  secondaryLabel: tt("Explore the Features"),
  previewVerse: tt("For God so loved the world that he gave his only Son, so that whoever believes in him shall not perish but have eternal life."),
  previewReference: tt("John 3:16"),
  previewTranslation: tt("John 3:16 \u00b7 WEB"),
} as const;

export const LANDING_SECTIONS = {
  features: {
    eyebrow: tt("TOOLS FOR DEEPER STUDY"),
    title: tt("Explore Scripture With Bible Study Tools in One Place"),
    lead: tt("Move from reading a passage to exploring its meaning, reflecting on its message, and recording what you learn."),
    ctaLabel: tt("Explore Study Tools"),
    ctaTarget: "#approach",
    note: tt("Feature access varies by plan."),
  },
  approach: {
    eyebrow: tt("FROM READING TO RESPONSE"),
    title: tt("Look, Listen, Learn, Abide, and Apply"),
    lead: tt("The Exegesis approach encourages you to take time with Scripture: notice what the passage says, listen thoughtfully, deepen your understanding, reflect on its message, and consider how to respond."),
    ctaLabel: tt("Begin Your Study"),
    ctaHref: "/register",
  },
  plans: {
    eyebrow: tt("BUILD A DAILY HABIT"),
    title: tt("Find a Bible Reading Plan for Your Next Step"),
    body: tt("Follow a focused path through Scripture with plans that explore biblical books, people, and themes. Choose a shorter study or a longer reading journey that fits the time you have available."),
    ctaLabel: tt("Explore Reading Plans"),
    ctaHref: "/register",
  },
  purpose: {
    eyebrow: tt("OUR PURPOSE"),
    title: tt("Helping You Engage With God\u2019s Word More Intentionally"),
    paragraphs: [
      tt("The Exegesis Project brings Bible reading and study resources together to support regular, thoughtful engagement with Scripture."),
      tt("Whether you are beginning a new study habit or exploring a familiar passage more closely, our purpose is to help you read with attention, reflect with care, and put what you learn into practice."),
    ],
    ctaLabel: tt("About the Exegesis Project"),
    ctaHref: "/who-we-are",
  },
  choosePlan: {
    eyebrow: tt("CHOOSE YOUR NEXT STEP"),
    title: tt("Start Reading Free. Explore Additional Study Tools."),
    body: tt("The Free Reader plan includes Bible reading, a daily verse, and basic tools. Paid plans provide access to additional features, including the Legacy Ledger and study tools."),
    bodySecondary: tt("Compare the available plans to find the access that fits your study needs."),
    primaryLabel: tt("Start Reading Free"),
    primaryHref: "/register",
    secondaryLabel: tt("Compare Plans"),
    secondaryHref: "/plans",
  },
  cta: {
    title: tt("Make Time for God\u2019s Word Today"),
    body: tt("Begin with a passage, follow a reading plan, or record a reflection. Take your next step toward a consistent Bible study habit with the Exegesis Project."),
    primaryLabel: tt("Create Your Free Account"),
    primaryHref: "/register",
    secondaryLabel: tt("Sign In"),
    secondaryHref: "/login",
  },
};

export const LANDING_FEATURES: LandingFeatureItem[] = [
  {
    icon: BookOpen,
    title: tt("Bible Reading"),
    description: tt("Read Scripture and make time in God\u2019s Word part of your everyday routine."),
  },
  {
    icon: Microscope,
    title: tt("Verse Explanations and Word Studies"),
    description: tt("Explore explanations for selected verses and use Strong\u2019s word-study resources to investigate Greek and Hebrew terms."),
  },
  {
    icon: CalendarDays,
    title: tt("Bible Reading Plans"),
    description: tt("Choose a reading plan focused on a biblical book, person, or theme, with daily passages that help you follow a consistent schedule."),
  },
  {
    icon: Heart,
    title: tt("Daily Verses and Devotionals"),
    description: tt("Pause to reflect on Scripture through daily verses and devotional content that encourages thoughtful application."),
  },
  {
    icon: NotebookPen,
    title: tt("Journaling and Reflection"),
    description: tt("Record study notes, prayers, questions, and personal reflections as you engage with the Bible."),
  },
  {
    icon: Trophy,
    title: tt("Bible Trivia"),
    description: tt("Review your biblical knowledge with questions covering people, events, books, and themes across Scripture."),
  },
];

export const LANDING_STUDY_STEPS: LandingStepItem[] = [
  {
    icon: Eye,
    title: tt("Look"),
    description: tt("Begin with the passage and pay attention to its words, people, and setting."),
  },
  {
    icon: Ear,
    title: tt("Listen"),
    description: tt("Slow down and give thoughtful attention to what you are reading."),
  },
  {
    icon: BookOpenCheck,
    title: tt("Learn"),
    description: tt("Use available explanations and study resources to explore meaning and context."),
  },
  {
    icon: Flame,
    title: tt("Abide"),
    description: tt("Spend time reflecting on Scripture and bringing your response before God in prayer."),
  },
  {
    icon: Sparkles,
    title: tt("Apply"),
    description: tt("Consider how the passage can shape your choices, relationships, and daily life."),
  },
];

export const LANDING_FEATURED_PLANS: LandingPlanItem[] = [
  {
    title: tt("Romans: Righteousness by Faith"),
    meta: tt("New Testament \u00b7 Romans"),
    description: tt("Follow Paul\u2019s argument through one of the most studied letters in Scripture."),
  },
  {
    title: tt("The Life of David: A Heart After God"),
    meta: tt("Old Testament \u00b7 David"),
    description: tt("Trace the life of David and the heart he pursued in seasons of waiting and triumph."),
  },
  {
    title: tt("The Gospel of John: Knowing Jesus"),
    meta: tt("New Testament \u00b7 John"),
    description: tt("Walk through John\u2019s account and grow in knowing who Jesus is."),
  },
];

export const LANDING_PLAN_COLUMNS: LandingPlanColumn[] = [
  {
    title: tt("Free Reader"),
    description: tt("Bible reading, a daily verse, and basic tools."),
    items: [
      tt("Bible reading across translations"),
      tt("Daily verse"),
      tt("Basic search"),
      tt("Notes and bookmarks"),
    ],
    featured: false,
  },
  {
    title: tt("Paid Plans"),
    description: tt("Additional features, including the Legacy Ledger and study tools."),
    items: [
      tt("Everything in Free Reader"),
      tt("Reading plans with progress"),
      tt("Verse explanations and word studies"),
      tt("Legacy Ledger journaling"),
      tt("Exegesis Lab study tools"),
    ],
    featured: true,
  },
];

export const LANDING_NAV_ABOUT_SUBITEMS = [
  { labelKey: "aboutSubWhoWeAre", href: "/who-we-are", fallback: "Who We Are" },
  { labelKey: "aboutSubVision", href: "/our-vision", fallback: "Our Vision" },
  { labelKey: "aboutSubMission", href: "/our-mission", fallback: "Our Mission" },
  { labelKey: "aboutSubGoals", href: "/our-goals", fallback: "Our Goals" },
  { labelKey: "aboutSubLeadership", href: "/leadership", fallback: "Leadership" },
  { labelKey: "aboutSubFounders", href: "/founders", fallback: "Founders" },
] as const;

export type SocialIconId = "lordsbook" | "facebook" | "tiktok" | "whatsapp";

export const SOCIAL_LINKS: { id: SocialIconId; url: string }[] = [
  { id: "lordsbook", url: "https://lordsbook.com" },
  { id: "facebook", url: "https://facebook.com" },
  { id: "tiktok", url: "https://tiktok.com/@exegesis" },
  { id: "whatsapp", url: "https://wa.me/1234567890" },
];

export const SOCIAL_LABELS: Record<SocialIconId, string> = {
  lordsbook: tt("LordsBook"),
  facebook: tt("Facebook"),
  tiktok: tt("TikTok"),
  whatsapp: tt("WhatsApp"),
};

export const SOCIAL_LABEL_KEYS: Record<SocialIconId, string> = {
  lordsbook: "socialLordsBook",
  facebook: "socialFacebook",
  tiktok: "socialTikTok",
  whatsapp: "socialWhatsApp",
};
