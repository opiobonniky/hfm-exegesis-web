"use client";

import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Search,
  Library,
  Shield,
  Heart,
  Users,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { routes } from "@/components/Routes/routes";
const FEATURES = [
  {
    icon: BookOpen,
    title: "Daily Bible Verses",
    description: "Fresh scripture delivered to you every morning",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
    icon: Library,
    title: "Multiple Translations",
    description: "Compare across KJV, NIV, ESV, and more",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: Search,
    title: "Word Study",
    description: "Explore Hebrew and Greek definitions",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    icon: Heart,
    title: "Reading Plans",
    description: "Guided plans to grow in your faith",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    icon: Shield,
    title: "Bible Trivia",
    description: "Test your knowledge with fun quizzes",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    icon: Users,
    title: "Journaling",
    description: "Record your insights and reflections",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
];
export default function GuestEntryPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {/* Logo & Hero */}
        <div className="text-center mb-12 max-w-lg">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Exegesis
          </h1>
          <p className="text-lg text-muted-foreground">
            A modern Bible study companion. Read, learn, and grow in God&apos;s Word.
          </p>
        </div>
        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl w-full mb-12">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.bg}`}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
              </CardContent>
            </Card>
          ))}
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate(routes.register.path)}
          >
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
            variant="outline"
            onClick={() => navigate(routes.login.path)}
            Sign In
        <p className="text-xs text-muted-foreground mt-8 text-center max-w-md">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
    </div>
  );
}
