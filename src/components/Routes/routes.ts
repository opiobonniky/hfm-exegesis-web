import PlanDetail from "@/pages/ReadingPlan/Plandetail";
import UsersPage from "@/pages/UserManagement/UsersPage";
import { Component } from "lucide-react";
import path from "path";
import { title } from "process";
import { ComponentType, lazy } from "react";

// Lazy load components for code splitting
const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const GoogleRegister = lazy(() => import("@/pages/GoogleRegister"));
const Register = lazy(() => import("@/pages/Register"));
const VerifyAccount = lazy(() => import("@/pages/VerifyAccount"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const HomeDashboard = lazy(() => import("@/pages/Index"));
const DailyVerse = lazy(() => import("@/pages/DailyVerse"));
const VerseExplanations = lazy(() => import("@/pages/VerseExplanations"));
const AddDailyVerse = lazy(() => import("@/pages/AddDailyVerse"));
const DailyDevotions = lazy(() => import("@/pages/DailyDevotions"));
const AddDailyDevotion = lazy(() => import("@/pages/AddDailyDevotion"));
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
const Settings = lazy(() => import("@/pages/Settings"));
const Journal = lazy(() => import("@/pages/Journal"));
const JournalEntry = lazy(() => import("@/pages/JournalEntry"));
const JournalDetail = lazy(() => import("@/pages/JournalDetail"));
const JournalPrompts = lazy(() => import("@/pages/JournalPrompts"));
const JournalTemplates = lazy(() => import("@/pages/JournalTemplates"));
const UserDevotions = lazy(() => import("@/pages/UserDevotions"));
const Search = lazy(() => import("@/pages/Search"));
const Trivia = lazy(() => import("@/pages/Trivia"));
const StudyBible = lazy(() => import("@/pages/LabDictionary"));
const BibleStudyFlow = lazy(() => import("@/pages/LabFlow"));
const LabHome = lazy(() => import("@/pages/LabHome"));
const AdminStudyTools = lazy(() => import("@/pages/AdminStudyTools"));
const DailyExegesis = lazy(() => import("@/pages/DailyExegesis"));
const SowerPage = lazy(() => import("@/pages/SowerPage"));
const BibleLibrary = lazy(() => import("@/pages/BibleLibrary"));
const VerseResources = lazy(() => import("@/pages/VerseResources"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const WhoWeAre = lazy(() => import("@/pages/HimFirstMedia/WhoWeAre"));
const OurVision = lazy(() => import("@/pages/HimFirstMedia/OurVision"));
const OurMission = lazy(() => import("@/pages/HimFirstMedia/OurMission"));
const OurGoals = lazy(() => import("@/pages/HimFirstMedia/OurGoals"));
const Leadership = lazy(() => import("@/pages/HimFirstMedia/Leadership"));
const Founders = lazy(() => import("@/pages/HimFirstMedia/Founders"));

// Route configuration interface
export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  isProtected: boolean;
  requiresLayout?: boolean; // Whether to use AppLayout
  requiresPublicLayout?: boolean; // Whether to use PublicLayout
  title?: string;
  exact?: boolean;
}

// Define all routes in a centralized configuration
export const routes = {
  // ==================== PUBLIC ROUTES ====================
  onboarding: {
    path: "/onboarding",
    component: Onboarding,
    isProtected: false,
    requiresLayout: false,
    title: "Welcome",
  },

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
  googleRegister: {
    path: "/google-register",
    component: GoogleRegister,
    isProtected: false,
    requiresLayout: false,
    title: "Google Register",
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
  home: {
    path: "/home",
    component: HomeDashboard,
    isProtected: true,
    requiresLayout: true,
    title: "Home",
  },
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
  dailyDevotions: {
    path: "/daily-devotions",
    component: DailyDevotions,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Devotions",
  },
  addDailyDevotion: {
    path: "/add-daily-devotion",
    component: AddDailyDevotion,
    isProtected: true,
    requiresLayout: true,
    title: "Add Daily Devotion",
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
  userDevotions: {
    path: "/user-devotions",
    component: UserDevotions,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Devotion",
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
  settings: {
    path: "/settings",
    component: Settings,
    isProtected: true,
    requiresLayout: true,
    title: "Settings",
  },
  journal: {
    path: "/journal",
    component: Journal,
    isProtected: true,
    requiresLayout: true,
    title: "Journal",
  },
  journalEntry: {
    path: "/journal/entry/:entryId",
    component: JournalEntry,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Entry",
  },
  journalDetail: {
    path: "/journal/view/:entryId",
    component: JournalDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Entry",
  },
  newJournalEntry: {
    path: "/journal/new",
    component: JournalEntry,
    isProtected: true,
    requiresLayout: true,
    title: "New Journal Entry",
  },
  journalPrompts: {
    path: "/journal-prompts",
    component: JournalPrompts,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Prompts",
  },
  journalTemplates: {
    path: "/journal-templates",
    component: JournalTemplates,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Templates",
  },
  search: {
    path: "/search",
    component: Search,
    isProtected: true,
    requiresLayout: true,
    title: "Search the Word",
  },
  trivia: {
    path: "/trivia",
    component: Trivia,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Trivia",
  },
  dictionary: {
    path: "/study-bible",
    component: StudyBible,
    isProtected: true,
    requiresLayout: true,
    title: "Dictionary",
  },
  labFlow: {
    path: "/bible-study",
    component: BibleStudyFlow,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Study",
  },
  studyBible: {
    path: "/lab-home",
    component: LabHome,
    isProtected: true,
    requiresLayout: true,
    title: "Study Bible",
  },
  // Backwards-compat alias for BibleStudy accessed from bible reader
  // Backwards-compat alias for BibleStudy accessed from bible reader
  bibleStudyDirect: {
    path: "/bible-study/:bookName/:chapter/:verseStart",
    component: BibleStudyFlow,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Study",
  },
  bibleStudyDirectRange: {
    path: "/bible-study/:bookName/:chapter/:verseStart/:verseEnd",
    component: BibleStudyFlow,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Study",
  },
  adminStudyTools: {
    path: "/admin/study-tools",
    component: AdminStudyTools,
    isProtected: true,
    requiresLayout: true,
    title: "Study Tools Admin",
  },
  dailyExegesis: {
    path: "/daily-exegesis",
    component: DailyExegesis,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Exegesis",
  },
  sower: {
    path: "/sower",
    component: SowerPage,
    isProtected: true,
    requiresLayout: true,
    title: "Sower",
  },
  verseResources: {
    path: "/verse-resources",
    component: VerseResources,
    isProtected: true,
    requiresLayout: true,
    title: "Verse Resources",
  },

  bibleLibrary: {
    path: "/bible-library",
    component: BibleLibrary,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Library",
  },
  // Backward-compat alias
  bibleLibraryLegacy: {
    path: "/bible",
    component: BibleLibrary,
    isProtected: true,
    requiresLayout: true,
    title: "Bible Library",
  },

  // ==================== PUBLIC HIM FIRST MEDIA PAGES ====================
  whoWeAre: {
    path: "/who-we-are",
    component: WhoWeAre,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Who We Are",
  },
  ourVision: {
    path: "/our-vision",
    component: OurVision,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Our Vision",
  },
  ourMission: {
    path: "/our-mission",
    component: OurMission,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Our Mission",
  },
  ourGoals: {
    path: "/our-goals",
    component: OurGoals,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Our Goals",
  },
  leadership: {
    path: "/leadership",
    component: Leadership,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Leadership",
  },
  founders: {
    path: "/founders",
    component: Founders,
    isProtected: false,
    requiresPublicLayout: true,
    requiresLayout: false,
    title: "Founders",
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

// Helper function to get all public routes (excluding those that use PublicLayout)
export const getPublicRoutes = () =>
  Object.values(routes).filter((route:any) => !route.isProtected && !route.requiresPublicLayout);

// Helper function to get public routes that use PublicLayout
export const getPublicLayoutRoutes = () =>
  Object.values(routes).filter((route:any) => !route.isProtected && route.requiresPublicLayout);

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
