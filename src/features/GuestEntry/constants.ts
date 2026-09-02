import { BookOpen, Search, Library, Shield, Heart, Users } from "lucide-react";

export const FEATURES = [
  { icon: BookOpen, title: "Daily Bible Verses", description: "Fresh scripture delivered to you every morning", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: Library, title: "Multiple Translations", description: "Compare across KJV, NIV, ESV, and more", color: "text-blue-500", bg: "bg-blue-500/10" },
  { icon: Search, title: "Word Study", description: "Explore Hebrew and Greek definitions", color: "text-purple-500", bg: "bg-purple-500/10" },
  { icon: Heart, title: "Reading Plans", description: "Guided plans to grow in your faith", color: "text-rose-500", bg: "bg-rose-500/10" },
  { icon: Shield, title: "Bible Trivia", description: "Test your knowledge with fun quizzes", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { icon: Users, title: "Journaling", description: "Record your insights and reflections", color: "text-indigo-500", bg: "bg-indigo-500/10" },
] as const;
