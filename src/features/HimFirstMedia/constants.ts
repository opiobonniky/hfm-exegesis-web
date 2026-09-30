/**
 * HimFirstMedia constants — data arrays for all pages.
 * Moved from pages to keep pages as pure compositors.
 */
import { ShieldCheck, Heart, Sparkles, BookOpen, Users, Globe, Trophy, Zap } from "lucide-react";
import { tt } from '@/components/languages/hardcodedTranslate';

export const WHO_WE_ARE_VALUES = [
  { icon: ShieldCheck, title: tt("Rooted in Truth"), description: tt("Every insight is grounded in sound biblical scholarship and prayer.") },
  { icon: Heart, title: tt("Faith-Filled"), description: tt("Everything we do is centered around faith, excellence, and Kingdom impact.") },
  { icon: Sparkles, title: tt("Spirit-Led Tech"), description: tt("We use modern technology to illuminate ancient wisdom.") },
];

export const FOUNDERS_DATA = [
  {
    name: "Apostle Charles Ubani",
    role: "Founder & President of Him First Media Group",
    bio: "Apostle Charles Ubani is a visionary leader, seasoned apostle, and the President of Him First Media Group. With a deep passion for the Gospel and decades of ministry experience, he founded the Exegesis Project.",
  },
  {
    name: "Apostle Judith Ubani",
    role: "Co-Founder & Vice President of Him First Media Group",
    bio: "Apostle Judith Ubani is a woman of God, prophetic voice, and Co-Founder of Him First Media Group. Her heart for discipleship and deep love for Scripture have shaped the spiritual foundation.",
  },
];

export const LEADERSHIP_DATA = [
  { name: "Apostle Charles Ubani", role: "General Overseer / President" },
  { name: "Apostle Judith Ubani", role: "General Overseer / Vice President" },
];

export const GOALS_DATA = [
  { icon: BookOpen, title: tt("Deepen Scriptural Engagement"), description: tt("Help users read, understand, and apply the Bible daily.") },
  { icon: Users, title: tt("Build a Global Prayer Community"), description: tt("Connect believers from every nation to pray for one another.") },
  { icon: Globe, title: tt("Expand Language Reach"), description: tt("Make the platform accessible in 23+ languages.") },
  { icon: Trophy, title: tt("Equip the Next Generation"), description: tt("Provide tools like journaling, reading challenges, and trivia.") },
];

export const MISSION_DATA = [
  { icon: BookOpen, title: tt("Teach the Word"), description: tt("Provide rich, verse-by-verse teaching that makes Scripture come alive.") },
  { icon: Heart, title: tt("Build Community"), description: tt("Create a space where believers can pray, testify, and grow together.") },
  { icon: Globe, title: tt("Reach the World"), description: tt("Make the Bible accessible in multiple languages and translations.") },
  { icon: Zap, title: tt("Equip the Saints"), description: tt("Give believers the tools they need to study and apply God's Word.") },
];
