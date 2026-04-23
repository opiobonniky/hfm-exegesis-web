import PlanDetail from "@/pages/ReadingPlan/Plandetail";
import UserActivityPage from "@/pages/UserActivityPage";
import UsersPage from "@/pages/UserManagement/UsersPage";
import { ComponentType, lazy } from "react";

// Lazy load components for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyAccount = lazy(() => import("@/pages/VerifyAccount"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const DailyVerse = lazy(() => import("@/pages/DailyVerse"));
const VerseExplanations = lazy(() => import("@/pages/VerseExplanations"));
const AddDailyVerse = lazy(() => import("@/pages/AddDailyVerse"));
const AddExplanation = lazy(() => import("@/pages/AddExplanation"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AddReadingPlan = lazy(() => import("@/pages/ReadingPlan/Addreadingplan"));
const ReadingPlans = lazy(() => import("@/pages/ReadingPlan/ReadingPlans"));
const EditReadingPlan = lazy(
  () => import("@/pages/ReadingPlan/EditReadingPlan"),
);

const BibleReader = lazy(() => import("@/pages/BibleReader"));
const UserDashboard = lazy(() => import("@/pages/UserDashboard"));
const UserDailyVerse = lazy(() => import("@/pages/UserDailyVerse"));
const UserPlans = lazy(() => import("@/pages/UserPlans"));
const BibleReadingPlan = lazy(
  () => import("@/pages/ReadingPlan/BibleReadingPlan"),
);
const DailyReading = lazy(() => import("@/pages/ReadingPlan/DailyReading"));
const MyActivity = lazy(() => import("@/pages/MyActivity"));

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  isProtected: boolean;
  requiresLayout?: boolean; // Whether to use AppLayout
  title?: string; // For breadcrumbs or page titles
  exact?: boolean;
}

// Define all routes in a centralized configuration
export const routes = {
  // ==================== PUBLIC ROUTES ====================
  landing: {
    path: "/",
    component: Landing,
    isProtected: false,
    requiresLayout: false,
    title: "Welcome",
  },

  login: {
    path: "/login",
    component: Login,
    isProtected: false,
    requiresLayout: false,
    title: "Login",
  },
  register: {
    path: "/register",
    component: Register,
    isProtected: false,
    requiresLayout: false,
    title: "Register",
  },
  verifyAccount: {
    path: "/verify-account",
    component: VerifyAccount,
    isProtected: false,
    requiresLayout: false,
    title: "Verify Account",
  },
  forgotPassword: {
    path: "/forgot-password",
    component: ForgotPassword,
    isProtected: false,
    requiresLayout: false,
    title: "Forgot Password",
  },

  // ==================== PROTECTED ROUTES (WITH LAYOUT) ====================
  dashboard: {
    path: "/dashboard",
    component: Dashboard,
    isProtected: true,
    requiresLayout: true,
    title: "Dashboard",
  },
  dailyVerse: {
    path: "/daily-verse",
    component: DailyVerse,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Verse",
  },
  verseExplanations: {
    path: "/verse-explanations",
    component: VerseExplanations,
    isProtected: true,
    requiresLayout: true,
    title: "Verse Explanations",
  },
  addDailyVerse: {
    path: "/add-daily-verse",
    component: AddDailyVerse,
    isProtected: true,
    requiresLayout: true,
    title: "Add Daily Verse",
  },
  addExplanation: {
    path: "/add-explanation",
    component: AddExplanation,
    isProtected: true,
    requiresLayout: true,
    title: "Add Explanation",
  },
  readingPlans: {
    path: "/reading-plans",
    component: ReadingPlans,
    isProtected: true,
    requiresLayout: true,
    title: "Reading Plans",
  },
  addReadingPlan: {
    path: "/add-reading-plan",
    component: AddReadingPlan,
    isProtected: true,
    requiresLayout: true,
    title: "Add Reading Plan",
  },
  editReadingPlan: {
    path: "/edit-reading-plan/:planId",
    component: EditReadingPlan,
    isProtected: true,
    requiresLayout: true,
    title: "Edit Reading Plan",
  },
  editVerseExplanation: {
    path: "/add-verse-explanation/:bookName/:chapter/:verseNumber",
    component: AddExplanation,
    isProtected: true,
    requiresLayout: true,
    title: "Edit Verse Explanation",
  },
  systemUsers: {
    path: "/system-users",
    component: UsersPage,
    isProtected: true,
    requiresLayout: true,
    title: "System Users",
  },
  readingPlanDetail: {
    path: "/reading-plan-detail/:planId",
    component: PlanDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Reading Plan Detail",
  },
  useractivity: {
    path: "/user-activity",
    component: UserActivityPage,
    isProtected: true,
    requiresLayout: true,
    title: "User Activity",
  },
  bibleReader: {
    path: "/bible-reader",
    component: BibleReader,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Reader",
  },
  userDashboard: {
    path: "/user-dashboard",
    component: UserDashboard,
    isProtected: true,
    requiresLayout: true,
    title: "My Dashboard",
  },
  userDailyVerse: {
    path: "/user-daily-verse",
    component: UserDailyVerse,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Verse",
  },
  userPlans: {
    path: "/my-reading-plans",
    component: BibleReadingPlan,
    isProtected: true,
    requiresLayout: true,
    title: "My Reading Plans",
  },
  dailyReading: {
    path: "/daily-reading/:planId/:day",
    component: DailyReading,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Reading",
  },
  myActivity: {
    path: "/my-activity",
    component: MyActivity,
    isProtected: true,
    requiresLayout: true,
    title: "My Activity",
  },
  // ==================== 404 NOT FOUND ====================
  notFound: {
    path: "*",
    component: NotFound,
    isProtected: false,
    requiresLayout: false,
    title: "Not Found",
  },
};

// Helper function to get route by key
export const getRoute = (key: keyof typeof routes) => routes[key];

// Helper function to get all protected routes
export const getProtectedRoutes = () =>
  Object.values(routes).filter((route) => route.isProtected);

// Helper function to get all public routes
export const getPublicRoutes = () =>
  Object.values(routes).filter((route) => !route.isProtected);

// Helper function to get routes that require layout
export const getLayoutRoutes = () =>
  Object.values(routes).filter((route) => route.requiresLayout);

// Helper to generate path with params
export const generatePath = (
  key: keyof typeof routes,
  params?: Record<string, string | number>,
): string => {
  let path = routes[key].path;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      path = path.replace(`:${param}`, String(value));
    });
  }

  return path;
};

// Export route paths for easy navigation
export const routePaths = Object.entries(routes).reduce(
  (acc, [key, config]) => ({
    ...acc,
    [key]: config.path,
  }),
  {} as Record<keyof typeof routes, string>,
);
