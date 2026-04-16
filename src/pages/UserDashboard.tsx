import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Sun, 
  BookMarked, 
  Calendar, 
  Star, 
  History, 
  Heart,
  Clock,
  ChevronRight,
  Loader2,
  CalendarDays,
  Globe,
  Brain,
  Mic2,
  HandHeart,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

interface DailyVerse {
  id: string;
  verseReference: string;
  verseText: string;
  createdAt: string;
}

interface ReadingPlan {
  id: string;
  planName: string;
  description: string;
  totalDays: number;
  startDate: string;
  endDate: string;
  completedDays: number;
}

interface Stats {
  chaptersRead: number;
  highlights: number;
  notes: number;
  favorites: number;
}

interface RecentActivity {
  bookName: string;
  chapter: number;
  updatedOn: string;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 17) return 'Good Afternoon,';
  return 'Good Evening,';
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

export default function UserDashboard() {
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  const [dailyVerse, setDailyVerse] = useState<DailyVerse | null>(null);
  const [readingPlans, setReadingPlans] = useState<ReadingPlan[]>([]);
  const [stats, setStats] = useState<Stats>({ chaptersRead: 0, highlights: 0, notes: 0, favorites: 0 });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const contentButtons = useMemo(() => [
    { id: '1', label: 'Exegesis Bible', icon: CalendarDays, color: '#1565C0', onPress: () => navigate(routes.bibleReader.path) },
    { id: '2', label: 'Prayer Wall', icon: HandHeart, color: '#2E7D32', onPress: () => {} },
    { id: '3', label: 'Testify', icon: Mic2, color: '#E65100', onPress: () => {} },
    { id: '4', label: 'Bible Trivia', icon: Brain, color: '#F9A825', onPress: () => {} },
    { id: '5', label: 'Reading Plans', icon: Globe, color: '#00695C', onPress: () => navigate(routes.readingPlans.path) },
  ], [navigate]);

  const quickLinks = useMemo(() => [
    { id: '1', title: 'Notes', icon: Star, color: '#F59E0B', route: '/notes' },
    { id: '2', title: 'History', icon: History, color: '#10B981', route: '/read-history' },
    { id: '3', title: 'Highlights', icon: Star, color: '#F59E0B', route: '/highlights' },
    { id: '4', title: 'Favorites', icon: Heart, color: '#8B5CF6', route: '/favorites' },
  ], []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [verseRes, statsRes, plansRes] = await Promise.all([
          sendPostRequest("bible", "get-daily-verse", {}),
          sendPostRequest("bible", "get-home-stats", {}),
          sendPostRequest("readingPlan", "get-user-plans", {})
        ]);

        if (verseRes.returnCode === 200 && verseRes.returnData) {
          setDailyVerse(verseRes.returnData);
        }

        if (statsRes.returnCode === 200 && statsRes.returnData) {
          const d = statsRes.returnData;
          setStats({
            chaptersRead: d.chaptersRead ?? 0,
            highlights: d.highlights ?? 0,
            notes: d.notes ?? 0,
            favorites: d.favorites ?? 0,
          });
          setRecentActivity(d.recentActivity ?? []);
        }

        if (plansRes.returnCode === 200 && plansRes.returnData) {
          setReadingPlans(plansRes.returnData.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <div className="bg-gradient-to-br from-primary via-primary/95 to-primary/80 text-white p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">{getGreeting()} {userInfo?.lastName || userInfo?.firstName || 'Friend'}!</h1>
            <p className="text-white/80 mt-1">Your Practical Application Bible for Daily Guidance</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {userInfo?.firstName?.charAt(0) || userInfo?.username?.charAt(0) || "U"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-8 -mt-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Content</h2>
          {contentButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={btn.onPress}
                className="w-full flex items-center gap-4 p-4 rounded-xl text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: btn.color }}
              >
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                  <Icon size={22} color="rgba(255,255,255,0.9)" strokeWidth={1.8} />
                </div>
                <span className="flex-1 text-left font-semibold text-[15px]">{btn.label}</span>
                <ChevronRight size={18} className="text-white/60" />
              </button>
            );
          })}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => {}}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: link.color + '20' }}>
                    <Icon size={20} color={link.color} />
                  </div>
                  <span className="text-xs font-medium text-center">{link.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {dailyVerse && (
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <CardTitle className="text-lg">Daily Verse</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-serif italic mb-2">"{dailyVerse.verseText}"</p>
              <p className="text-sm text-muted-foreground">— {dailyVerse.verseReference}</p>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Chapters Read</p>
                <p className="text-3xl font-bold text-primary">{stats.chaptersRead}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Highlights</p>
                <p className="text-3xl font-bold text-amber-500">{stats.highlights}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="text-3xl font-bold text-green-500">{stats.notes}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-3xl font-bold text-purple-500">{stats.favorites}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {recentActivity.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-0">
                {recentActivity.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`${routes.bibleReader.path}?book=${encodeURIComponent(act.bookName)}&chapter=${act.chapter}`)}
                    className="w-full flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{act.bookName} {act.chapter}</p>
                      <p className="text-sm text-muted-foreground">{formatTime(act.updatedOn)}</p>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {readingPlans.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">My Reading Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {readingPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{plan.planName}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round((plan.completedDays / plan.totalDays) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(plan.completedDays / plan.totalDays) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {plan.completedDays} of {plan.totalDays} days
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}