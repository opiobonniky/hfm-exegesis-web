import { BookOpen, Search, Library, Shield, Heart, Users } from "lucide-react";
import { tt } from '@/components/languages/hardcodedTranslate';

export const FEATURES = [
  { icon: BookOpen, title: tt("Daily Bible Verses"), description: tt("Fresh scripture delivered to you every morning"), color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Library, title: tt("Multiple Translations"), description: tt("Compare across KJV, NIV, ESV, and more"), color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Search, title: tt("Word Study"), description: tt("Explore Hebrew and Greek definitions"), color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Heart, title: tt("Reading Plans"), description: tt("Guided plans to grow in your faith"), color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Shield, title: tt("Bible Trivia"), description: tt("Test your knowledge with fun quizzes"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Users, title: tt("Journaling"), description: tt("Record your insights and reflections"), color: "text-indigo-500", bg: "bg-indigo-500/10" },
] as const;
