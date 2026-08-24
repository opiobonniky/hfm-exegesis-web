"use client";

import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRTL } from "@/providers/RTLProvider";
import { routes } from "@/components/Routes/routes";
import { useUserDashboard } from "../hooks/useUserDashboard";
import {
  DashboardSkeleton,
  HeroSection,
  StatCards,
  ExploreGrid,
  StudySessionCard,
  ReadingPlansSection,
  ChallengeCard,
  QuickAccessIcons,
  RecentActivityList,
  ContentCard,
} from "../components";
export default function UserDashboard() {
  const { userInfo } = useAuth();
  const { isRtl } = useRTL();
  const navigate = useNavigate();
  const data = useUserDashboard();
  const name = userInfo?.firstName || userInfo?.lastName || userInfo?.username || "Friend";
  const initial = name.charAt(0).toUpperCase();
  if (data.loading) return <DashboardSkeleton />;
  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-full bg-background">
      {/* Hero section with greeting + verse */}
      <HeroSection userName={name} initial={initial} verse={data.dailyVerse} />
      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Stats row */}
        <StatCards
          chaptersRead={data.stats.chaptersRead}
          highlights={data.stats.highlights}
          notes={data.stats.notes}
          journalEntries={data.stats.journalEntries}
          favorites={data.stats.favorites}
        />
        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
          {/* Left column */}
          <div className="space-y-8">
            <ExploreGrid />
            {data.currentSession && (
              <StudySessionCard
                session={data.currentSession}
                onPress={() => navigate(`${routes.labFlow.path}?sessionId=${data.currentSession.id}`)}
              />
            )}
            <ReadingPlansSection
              plans={data.readingPlans}
              onSeeAll={() => navigate(routes.userPlans.path)}
              onPressPlan={(p) => navigate(routes.userPlans.path)}
            />
            <ChallengeCard onPress={() => navigate(routes.trivia.path)} />
          </div>
          {/* Right column */}
          <div className="space-y-6">
            {/* Continue reading */}
            {data.lastRead && (
              <ContentCard
                title="Continue Reading"
                onClick={() => navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(data.lastRead!.bookName)}&chapter=${data.lastRead!.chapter}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary">📖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{data.lastRead.bookName}</p>
                    <p className="text-xs text-muted-foreground/60">Chapter {data.lastRead.chapter}</p>
                </div>
              </ContentCard>
            {/* Quick access icons */}
            <QuickAccessIcons navigate={navigate} />
            {/* Recent activity */}
            <RecentActivityList
              activities={data.recentActivity}
              navigate={navigate}
              onSeeAll={() => navigate(routes.myActivity.path)}
            {/* Daily exegesis */}
            {data.dailyExegesis && (
                title="Daily Exegesis"
                cta="Study"
                onClick={() => navigate(routes.dailyExegesis.path)}
                onCta={() => navigate(routes.dailyExegesis.path)}
                <p className="font-semibold text-sm text-foreground line-clamp-1">{data.dailyExegesis.title || "Daily Exegesis"}</p>
                {data.dailyExegesis.passageRef && <p className="text-xs text-muted-foreground/60 mt-1 font-mono">{data.dailyExegesis.passageRef}</p>}
            {/* Daily devotion */}
            {data.dailyDevotion && (
                title="Daily Devotion"
                cta="Read"
                onClick={() => navigate(routes.userDevotions.path)}
                onCta={() => navigate(routes.userDevotions.path)}
                <p className="font-semibold text-sm text-foreground line-clamp-1">{data.dailyDevotion.title || "Daily Devotion"}</p>
                {data.dailyDevotion.content && <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">{data.dailyDevotion.content}</p>}
            {/* Latest journal */}
            {data.latestEntry && (
                title="Latest Journal"
                cta="Open"
                onClick={() => navigate(`/journal/view/${data.latestEntry.id}`)}
                onCta={() => navigate(`/journal/view/${data.latestEntry.id}`)}
                <p className="font-semibold text-sm text-foreground line-clamp-1">{data.latestEntry.title || "Journal Entry"}</p>
                {(data.latestEntry.passageRef || data.latestEntry.reflection) && (
                  <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{data.latestEntry.passageRef || data.latestEntry.reflection}</p>
                )}
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}
