import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { routes } from "./Routes/routes";

const adminOnlyRoutes = [
  { path: routes.addDailyVerse.path, pattern: /^\/add-daily-verse/ },
  { path: routes.addDailyDevotion.path, pattern: /^\/add-daily-devotion/ },
  { path: routes.addExplanation.path, pattern: /^\/add-explanation/ },
  { path: routes.addReadingPlan.path, pattern: /^\/add-reading-plan/ },
  { path: routes.editReadingPlan.path, pattern: /^\/edit-reading-plan/ },
  { path: routes.readingPlanDetail.path, pattern: /^\/reading-plan-detail/ },
  { path: routes.editVerseExplanation.path, pattern: /^\/add-verse-explanation/ },
  { path: routes.dailyVerse.path, pattern: /^\/daily-verse$/ },
  { path: routes.dailyDevotions.path, pattern: /^\/daily-devotions$/ },
  { path: routes.dashboard.path, pattern: /^\/dashboard$/ },
  { path: routes.adminDashboard.path, pattern: /^\/admin/ },
];

const userReadOnlyRoutes = [
  routes.verseExplanations.path,
  routes.readingPlans.path,
  routes.dailyVerse.path,
  routes.dailyDevotions.path,
  routes.bibleReader.path,
];

export function ProtectedRoute() {
  const { isAuthenticated, loading, userInfo } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-accordion-down rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = userInfo?.userRole === 1;
  const currentPath = location.pathname;

  const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
    route.pattern.test(currentPath)
  );

  if (isAdminOnlyRoute && !isAdmin) {
    if (currentPath === routes.dashboard.path) {
      return <Navigate to={routes.userDashboard.path} replace />;
    }
    return <Navigate to={routes.userDashboard.path} replace />;
  }

  return <Outlet />;
}
