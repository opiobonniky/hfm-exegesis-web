import { ComponentType, lazy } from "react";

// Lazy load components for code splitting
const Landing = lazy(() => import("@/features/Auth/pages/Landing"));
const Login = lazy(() => import("@/features/Auth/pages/Login"));
const GoogleRegister = lazy(() => import("@/features/Auth/pages/GoogleRegister"));
const Register = lazy(() => import("@/features/Auth/pages/Register"));
const VerifyAccount = lazy(() => import("@/features/Auth/pages/VerifyAccount"));
const ForgotPassword = lazy(() => import("@/features/Auth/pages/ForgotPassword"));
const Dashboard = lazy(() => import("@/features/Admin/pages/AdminDashboard"));
const HomeDashboard = lazy(() => import("@/features/Home/pages/Index"));
const DailyVerse = lazy(() => import("@/features/DailyContent/pages/DailyVerse"));
const VerseExplanations = lazy(() => import("@/features/Bible/pages/VerseExplanations"));
const AddDailyVerse = lazy(() => import("@/features/DailyContent/pages/AddDailyVerse"));
const DailyDevotions = lazy(() => import("@/features/DailyContent/pages/DailyDevotions"));
const AddDailyDevotion = lazy(() => import("@/features/DailyContent/pages/AddDailyDevotion"));
const AddDailyExegesis = lazy(() => import("@/features/DailyContent/pages/AddDailyExegesis"));
const AddExplanation = lazy(() => import("@/features/DailyContent/pages/AddExplanation"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PlanDetail = lazy(() => import("@/features/ReadingPlan/pages/PlanDetail"));
const AddReadingPlan = lazy(() => import("@/features/ReadingPlan/pages/AddReadingPlan"));
const ReadingPlans = lazy(() => import("@/features/ReadingPlan/pages/ReadingPlans"));
const EditReadingPlan = lazy(() => import("@/features/ReadingPlan/pages/EditReadingPlan"));

const BibleReader = lazy(() => import("@/features/Bible/pages/BibleReader"));
const BookOverview = lazy(() => import("@/features/Bible/pages/BookOverview"));
const UserDashboard = lazy(() => import("@/features/Home/pages/UserDashboard"));
const UserDailyVerse = lazy(() => import("@/features/DailyContent/pages/UserDailyVerse"));
const UserPlans = lazy(() => import("@/features/ReadingPlan/pages/UserPlans"));
const BibleReadingPlan = lazy(() => import("@/features/ReadingPlan/pages/BibleReadingPlan"));
const DailyReading = lazy(() => import("@/features/ReadingPlan/pages/DailyReading"));
const Highlights = lazy(() => import("@/features/Bible/pages/Highlights"));
const Notes = lazy(() => import("@/features/Bible/pages/Notes"));
const Favorites = lazy(() => import("@/features/Bible/pages/Favorites"));
const HistoryPage = lazy(() => import("@/features/Bible/pages/History"));
const Settings = lazy(() => import("@/features/Settings/pages/Settings"));
const Journal = lazy(() => import("@/features/Journal/pages/Journal"));
const JournalEntry = lazy(() => import("@/features/Journal/pages/JournalEntry"));
const JournalDetail = lazy(() => import("@/features/Journal/pages/JournalDetail"));
const UserDevotions = lazy(() => import("@/features/DailyContent/pages/UserDevotions"));
const Search = lazy(() => import("@/features/Bible/pages/Search"));
const Trivia = lazy(() => import("@/features/Trivia/pages/Trivia"));
const StudyBible = lazy(() => import("@/features/Lab/pages/LabDictionary"));
const BibleStudyFlow = lazy(() => import("@/features/Lab/pages/LabFlow"));
const LabHome = lazy(() => import("@/features/Lab/pages/LabHome"));
const LabReview = lazy(() => import("@/features/Lab/pages/LabReview"));
const AdminDashboard = lazy(() => import("@/features/Admin/pages/AdminDashboard"));
const AdminStudyTools = lazy(() => import("@/features/Admin/pages/AdminStudyTools"));
const AdminTrivia = lazy(() => import("@/features/Admin/pages/AdminTrivia"));
const AdminDailyContent = lazy(() => import("@/features/Admin/pages/AdminDailyContent"));
const AdminSubscriptions = lazy(() => import("@/features/Admin/pages/AdminSubscriptions"));

const AdminBookPrologues = lazy(() => import("@/features/Admin/pages/AdminBookPrologues"));
const AdminVerseExplanations = lazy(() => import("@/features/Admin/pages/AdminVerseExplanations"));
const AdminTriviaPerformance = lazy(() => import("@/features/Admin/pages/AdminTriviaPerformance"));
const DailyVerseDetail = lazy(() => import("@/features/DailyContent/pages/DailyVerseDetail"));
const DailyDevotionDetail = lazy(() => import("@/features/DailyContent/pages/DailyDevotionDetail"));
const DailyExegesisDetail = lazy(() => import("@/features/DailyContent/pages/DailyExegesisDetail"));
const AdminDailyExegesis = lazy(() => import("@/features/Admin/pages/AdminDailyExegesis"));
const AdminTriviaUserDetail = lazy(() => import("@/features/AdminTriviaUserDetail/pages/AdminTriviaUserDetail"));
const AdminAddTriviaQuestion = lazy(() => import("@/features/AdminAddTriviaQuestion/pages/AdminAddTriviaQuestion"));
const TriviaDetail = lazy(() => import("@/features/Admin/pages/TriviaDetail"));
const AdminJournalModeration = lazy(() => import("@/features/Admin/pages/AdminJournalModeration"));
const AdminUsersPage = lazy(() => import("@/features/Admin/pages/AdminUsersPage"));
const AdminUserDetail = lazy(() => import("@/features/Admin/pages/AdminUserDetail"));
const AdminCreateUser = lazy(() => import("@/features/Admin/pages/AdminCreateUser"));
const VerseExplanationDetail = lazy(() => import("@/features/Admin/pages/VerseExplanationDetail"));
const BookPrologueDetail = lazy(() => import("@/features/Admin/pages/BookPrologueDetail"));
const JournalEntryAdminDetail = lazy(() => import("@/features/Admin/pages/JournalEntryAdminDetail"));
const AdminReadingPlanDetail = lazy(() => import("@/features/Admin/pages/AdminReadingPlanDetail"));
const ExtendedProfile = lazy(() => import("@/features/ExtendedProfile/pages/ExtendedProfile"));
const VoiceSettings = lazy(() => import("@/features/VoiceSettings/pages/VoiceSettings"));
const ReadingSettings = lazy(() => import("@/features/ReadingSettings/pages/ReadingSettings"));
const NotificationSettings = lazy(() => import("@/features/NotificationSettings/pages/NotificationSettings"));
const StrongsDictionary = lazy(() => import("@/features/StrongsDictionary/pages/StrongsDictionary"));
const GuestEntry = lazy(() => import("@/features/GuestEntry/pages/GuestEntry"));
const DailyExegesis = lazy(() => import("@/features/DailyContent/pages/DailyExegesis"));
const SowerPage = lazy(() => import("@/features/Subscription/pages/SowerPage"));
const BibleLibrary = lazy(() => import("@/features/Bible/pages/BibleLibrary"));
const VerseResources = lazy(() => import("@/features/Bible/pages/VerseResources"));
const Onboarding = lazy(() => import("@/features/Auth/pages/Onboarding"));
const WhoWeAre = lazy(() => import("@/features/HimFirstMedia/pages/WhoWeAre"));
const OurVision = lazy(() => import("@/features/HimFirstMedia/pages/OurVision"));
const OurMission = lazy(() => import("@/features/HimFirstMedia/pages/OurMission"));
const OurGoals = lazy(() => import("@/features/HimFirstMedia/pages/OurGoals"));
const Leadership = lazy(() => import("@/features/HimFirstMedia/pages/Leadership"));
const Founders = lazy(() => import("@/features/HimFirstMedia/pages/Founders"));

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
  addDailyExegesis: {
    path: "/add-daily-exegesis",
    component: AddDailyExegesis,
    isProtected: true,
    requiresLayout: true,
    title: "Add Daily Exegesis",
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
  addVerseExplanation: {
    path: "/admin/add-verse-explanation",
    component: AddExplanation,
    isProtected: true,
    requiresLayout: true,
    title: "Add Verse Explanation",
  },
  editVerseExplanation: {
    path: "/admin/edit-verse-explanation/:bookName/:chapter/:verseNumber",
    component: AddExplanation,
    isProtected: true,
    requiresLayout: true,
    title: "Edit Verse Explanation",
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
  bookOverview: {
    path: "/book-overview",
    component: BookOverview,
    isProtected: true,
    requiresLayout: true,
    title: "Book Overview",
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
  highlights: {
    path: "/highlights",
    component: Highlights,
    isProtected: true,
    requiresLayout: true,
    title: "Highlights",
  },
  notes: {
    path: "/notes",
    component: Notes,
    isProtected: true,
    requiresLayout: true,
    title: "My Notes",
  },
  favorites: {
    path: "/favorites",
    component: Favorites,
    isProtected: true,
    requiresLayout: true,
    title: "Favorites",
  },
  history: {
    path: "/history",
    component: HistoryPage,
    isProtected: true,
    requiresLayout: true,
    title: "Reading History",
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
  labReview: {
    path: "/lab-review/:sessionId",
    component: LabReview,
    isProtected: true,
    requiresLayout: true,
    title: "Study Review",
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
  adminDashboard: {
    path: "/admin",
    component: AdminDashboard,
    isProtected: true,
    requiresLayout: true,
    title: "Admin Console",
  },
  adminStudyTools: {
    path: "/admin/study-tools",
    component: AdminStudyTools,
    isProtected: true,
    requiresLayout: true,
    title: "Study Tools Admin",
  },
  adminTrivia: {
    path: "/admin/trivia",
    component: AdminTrivia,
    isProtected: true,
    requiresLayout: true,
    title: "Trivia Management",
  },
  adminDailyContent: {
    path: "/admin/daily-content",
    component: AdminDailyContent,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Content Manager",
  },
  adminSubscriptions: {
    path: "/admin/subscriptions",
    component: AdminSubscriptions,
    isProtected: true,
    requiresLayout: true,
    title: "Subscription Manager",
  },
  adminBookPrologues: {
    path: "/admin/book-prologues",
    component: AdminBookPrologues,
    isProtected: true,
    requiresLayout: true,
    title: "Book Prologues Manager",
  },
  bookPrologueDetail: {
    path: "/admin/book-prologues/:bookName",
    component: BookPrologueDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Book Prologue Detail",
  },
  adminVerseExplanations: {
    path: "/admin/verse-explanations",
    component: AdminVerseExplanations,
    isProtected: true,
    requiresLayout: true,
    title: "Verse Explanations Manager",
  },
  verseExplanationDetail: {
    path: "/admin/verse-explanations/:bookName/:chapter/:verseNumber",
    component: VerseExplanationDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Verse Explanation Detail",
  },
  adminDailyExegesis: {
    path: "/admin/daily-exegesis",
    component: AdminDailyExegesis,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Exegesis Manager",
  },
  adminTriviaUserDetail: {
    path: "/admin/trivia/user/:userId",
    component: AdminTriviaUserDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Trivia User Detail",
  },
  adminAddTriviaQuestion: {
    path: "/admin/trivia/add",
    component: AdminAddTriviaQuestion,
    isProtected: true,
    requiresLayout: true,
    title: "Add Trivia Question",
  },
  adminEditTriviaQuestion: {
    path: "/admin/trivia/edit/:questionId",
    component: AdminAddTriviaQuestion,
    isProtected: true,
    requiresLayout: true,
    title: "Edit Trivia Question",
  },
  triviaDetail: {
    path: "/admin/trivia/:questionId",
    component: TriviaDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Trivia Question Detail",
  },
  adminTriviaPerformance: {
    path: "/admin/trivia/performance",
    component: AdminTriviaPerformance,
    isProtected: true,
    requiresLayout: true,
    title: "Trivia Performance",
  },
  dailyVerseDetail: {
    path: "/daily-verse-detail",
    component: DailyVerseDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Verse Detail",
  },
  dailyDevotionDetail: {
    path: "/daily-devotion-detail",
    component: DailyDevotionDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Devotion Detail",
  },
  dailyExegesisDetail: {
    path: "/daily-exegesis-detail",
    component: DailyExegesisDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Daily Exegesis Detail",
  },
  adminJournalModeration: {
    path: "/admin/journal-moderation",
    component: AdminJournalModeration,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Moderation",
  },
  journalEntryAdminDetail: {
    path: "/admin/journal-moderation/:entryId",
    component: JournalEntryAdminDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Journal Entry Detail",
  },
  adminUsers: {
    path: "/admin/users",
    component: AdminUsersPage,
    isProtected: true,
    requiresLayout: true,
    title: "User Management",
  },
  adminUserDetail: {
    path: "/admin/users/:userId",
    component: AdminUserDetail,
    isProtected: true,
    requiresLayout: true,
    title: "User Detail",
  },
  adminCreateUser: {
    path: "/admin/users/create",
    component: AdminCreateUser,
    isProtected: true,
    requiresLayout: true,
    title: "Create User",
  },
  adminReadingPlanDetail: {
    path: "/admin/reading-plans/:planId",
    component: AdminReadingPlanDetail,
    isProtected: true,
    requiresLayout: true,
    title: "Reading Plan Detail",
  },
  extendedProfile: {
    path: "/extended-profile",
    component: ExtendedProfile,
    isProtected: true,
    requiresLayout: true,
    title: "Extended Profile",
  },
  voiceSettings: {
    path: "/voice-settings",
    component: VoiceSettings,
    isProtected: true,
    requiresLayout: true,
    title: "Voice Settings",
  },
  readingSettings: {
    path: "/reading-settings",
    component: ReadingSettings,
    isProtected: true,
    requiresLayout: true,
    title: "Reading Settings",
  },
  notificationSettings: {
    path: "/notification-settings",
    component: NotificationSettings,
    isProtected: true,
    requiresLayout: true,
    title: "Notification Settings",
  },
  strongsDictionary: {
    path: "/strongs-dictionary",
    component: StrongsDictionary,
    isProtected: true,
    requiresLayout: true,
    title: "Strong's Dictionary",
  },
  guestEntry: {
    path: "/guest",
    component: GuestEntry,
    isProtected: false,
    requiresLayout: false,
    title: "Welcome",
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
