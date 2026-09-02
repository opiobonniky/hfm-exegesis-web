// UserDashboard — thin compositor, no logic in page
"use client";

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
import { routes } from "@/components/Routes/routes";

function DashboardMainContent({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  return (
    <div className="space-y-8">
      <ExploreGrid />
      {d.currentSession && (
        <StudySessionCard
          session={d.currentSession}
          onPress={() => d.navigate(`${routes.labFlow.path}?sessionId=${d.currentSession.id}`)}
        />
      )}
      <ReadingPlansSection
        plans={d.readingPlans}
        onSeeAll={() => d.navigate(routes.userPlans.path)}
        onPressPlan={() => d.navigate(routes.userPlans.path)}
      />
      <ChallengeCard onPress={() => d.navigate(routes.trivia.path)} />
    </div>
  );
}

function ContinueReadingCard({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  if (!d.lastRead) return null;
  return (
    <ContentCard
      title="Continue Reading"
      onClick={() => d.navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(d.lastRead!.bookName)}&chapter=${d.lastRead!.chapter}`)}
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          📖
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">{d.lastRead.bookName}</div>
          <div className="text-xs text-muted-foreground/60">Chapter {d.lastRead.chapter}</div>
        </div>
      </div>
    </ContentCard>
  );
}

function DailyExegesisCard({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  if (!d.dailyExegesis) return null;
  return (
    <ContentCard title="Daily Exegesis" cta="Study" onClick={() => d.navigate(routes.dailyExegesis.path)} onCta={() => d.navigate(routes.dailyExegesis.path)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {d.dailyExegesis.title || "Daily Exegesis"}
      </div>
      {d.dailyExegesis.passageRef && (
        <div className="text-xs text-muted-foreground/60 mt-1 font-mono">
          {d.dailyExegesis.passageRef}
        </div>
      )}
    </ContentCard>
  );
}

function DailyDevotionCard({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  if (!d.dailyDevotion) return null;
  return (
    <ContentCard title="Daily Devotion" cta="Read" onClick={() => d.navigate(routes.userDevotions.path)} onCta={() => d.navigate(routes.userDevotions.path)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {d.dailyDevotion.title || "Daily Devotion"}
      </div>
      {d.dailyDevotion.content && (
        <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-2">
          {d.dailyDevotion.content}
        </div>
      )}
    </ContentCard>
  );
}

function LatestJournalCard({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  if (!d.latestEntry) return null;
  return (
    <ContentCard title="Latest Journal" cta="Open" onClick={() => d.navigate(`/journal/view/${d.latestEntry.id}`)} onCta={() => d.navigate(`/journal/view/${d.latestEntry.id}`)}>
      <div className="font-semibold text-sm text-foreground line-clamp-1">
        {d.latestEntry.title || "Journal Entry"}
      </div>
      {(d.latestEntry.passageRef || d.latestEntry.reflection) && (
        <div className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">
          {d.latestEntry.passageRef || d.latestEntry.reflection}
        </div>
      )}
    </ContentCard>
  );
}

function DashboardSidebar({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  return (
    <div className="space-y-6">
      <ContinueReadingCard d={d} />
      <QuickAccessIcons navigate={d.navigate} />
      <RecentActivityList
        activities={d.recentActivity}
        navigate={d.navigate}
        onSeeAll={() => d.navigate(routes.highlights.path)}
      />
      <DailyExegesisCard d={d} />
      <DailyDevotionCard d={d} />
      <LatestJournalCard d={d} />
    </div>
  );
}

function DashboardBody({ d }: { d: ReturnType<typeof useUserDashboard> }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <StatCards
        chaptersRead={d.stats.chaptersRead}
        highlights={d.stats.highlights}
        notes={d.stats.notes}
        journalEntries={d.stats.journalEntries}
        favorites={d.stats.favorites}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <DashboardMainContent d={d} />
        <DashboardSidebar d={d} />
      </div>
      <div className="h-6" />
    </div>
  );
}

export default function UserDashboard() {
  const d = useUserDashboard();

  if (d.loading) return <DashboardSkeleton />;

  return (
    <div dir={d.isRtl ? "rtl" : "ltr"} className="min-h-full bg-background">
      <HeroSection userName={d.name} initial={d.initial} verse={d.dailyVerse} />
      <DashboardBody d={d} />
    </div>
  );
}
