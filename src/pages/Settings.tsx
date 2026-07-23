"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  Lock, 
  Save, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Phone,
  Calendar,
  Heart,
  Users,
  Star,
  AlertTriangle,
  Globe,
  Check,
  Languages,
  Sparkles,
  CreditCard,
  Sprout,
  ExternalLink,
  Bell,
  Sun,
  Moon,
  Monitor,
  BookOpen,
  Sliders,
  Type
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest, TOKEN_KEY } from "@/services/api";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/languages/languageProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { routes } from "@/components/Routes/routes";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

/** Language grouped by region for the picker */
const LANGUAGE_GROUPS: { key: string; languages: Language[] }[] = [
  {
    key: "langGroupPrimary",
    languages: ["en"],
  },
  {
    key: "langGroupEuropean",
    languages: ["de", "fr", "es", "pt", "it", "el", "ru"],
  },
  {
    key: "langGroupIndian",
    languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"],
  },
  {
    key: "langGroupOther",
    languages: ["ar", "sw", "ne", "fil"],
  },
];

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhotoUrl?: string;
  maritalStatus?: string;
  alternativePhone?: string;
  ministryGroup?: string;
  servicePosition?: string;
  spiritualGifts?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const { t, lang: currentLang, setLanguage, isLoading: langLoading, isRtl } = useLanguage();
  const { isPayingUser, tierLabel, expiresLabel } = useSubscription();
  
  const [sowerPortalLoading, setSowerPortalLoading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    profilePhotoUrl: "",
    maritalStatus: "",
    alternativePhone: "",
    ministryGroup: "",
    servicePosition: "",
    spiritualGifts: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ── Notification preferences ──
  const [notifications, setNotifications] = useState({
    dailyVerseReminder: localStorage.getItem("notify_daily_verse") !== "false",
    devotionReminder: localStorage.getItem("notify_devotion") !== "false",
    emailNotifications: localStorage.getItem("notify_email") !== "false",
    pushNotifications: localStorage.getItem("notify_push") !== "false",
    studyReminders: localStorage.getItem("notify_study") !== "false",
  });

  const NOTIFICATION_STORAGE_KEYS: Record<keyof typeof notifications, string> = {
    dailyVerseReminder: "notify_daily_verse",
    devotionReminder: "notify_devotion",
    emailNotifications: "notify_email",
    pushNotifications: "notify_push",
    studyReminders: "notify_study",
  };

  const handleNotificationChange = (key: keyof typeof notifications, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(NOTIFICATION_STORAGE_KEYS[key], String(value));
    const labelMap: Record<string, string> = {
      dailyVerseReminder: "Daily Verse Reminder",
      devotionReminder: "Devotion Reminder",
      emailNotifications: "Email Notifications",
      pushNotifications: "Push Notifications",
      studyReminders: "Study Reminders",
    };
    toast({
      title: labelMap[key] || "Notification",
      description: value ? "Enabled" : "Disabled",
    });
  };

  // ── Reading preferences ──
  const [readingFontSize, setReadingFontSize] = useState(() => {
    return parseInt(localStorage.getItem("reading_font_size") || "18", 10);
  });
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem("theme_mode") || "system";
  });
  const [preferredTranslation, setPreferredTranslation] = useState(() => {
    return localStorage.getItem("preferred_translation") || "BSB";
  });

  const handleFontSizeChange = (size: number[]) => {
    const val = size[0];
    setReadingFontSize(val);
    localStorage.setItem("reading_font_size", String(val));
  };

  const handleThemeChange = (mode: string) => {
    setThemeMode(mode);
    localStorage.setItem("theme_mode", mode);
    // Apply theme class to html element
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (mode === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.remove("light", "dark");
    }
    toast({
      title: "Theme Updated",
      description: mode === "dark" ? "Dark mode enabled" : mode === "light" ? "Light mode enabled" : "System theme",
    });
  };

  const handleTranslationChange = (id: string) => {
    setPreferredTranslation(id);
    localStorage.setItem("preferred_translation", id);
    toast({
      title: "Translation Updated",
      description: `Preferred Bible translation set`,
    });
  };

  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: "", color: "" };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 1) return { level: score, label: t.auth?.weak || "Weak", color: "bg-red-500" };
    if (score <= 2) return { level: score, label: t.auth?.fair || "Fair", color: "bg-orange-500" };
    if (score <= 3) return { level: score, label: t.auth?.good || "Good", color: "bg-yellow-500" };
    return { level: score, label: t.auth?.strong || "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(passwords.newPassword);

  const loadProfile = async () => {
    try {
      const res = await sendPostRequest("auth", "get-current-user", {});
      if (res.returnCode === 200 && res.returnData) {
        const rawDob = res.returnData.dateOfBirth;
        let dobStr = "";
        if (rawDob) {
          if (typeof rawDob === "string") {
            dobStr = rawDob.split("T")[0];
          } else if (typeof rawDob === "object" && rawDob !== null) {
            dobStr = rawDob.split("T")[0];
          }
        }
        
        setProfile({
          id: res.returnData.id,
          username: res.returnData.username || "",
          email: res.returnData.email || "",
          firstName: res.returnData.firstName || "",
          lastName: res.returnData.lastName || "",
          middleName: res.returnData.middleName || "",
          phoneNumber: res.returnData.phoneNumber || "",
          dateOfBirth: dobStr,
          gender: res.returnData.gender || "",
          profilePhotoUrl: res.returnData.profilePhotoUrl || "",
          maritalStatus: res.returnData.maritalStatus || "",
          alternativePhone: res.returnData.alternativePhone || "",
          ministryGroup: res.returnData.ministryGroup || "",
          servicePosition: res.returnData.servicePosition || "",
          spiritualGifts: res.returnData.spiritualGifts || "",
          emergencyContactName: res.returnData.emergencyContactName || "",
          emergencyContactPhone: res.returnData.emergencyContactPhone || "",
          emergencyContactRelationship: res.returnData.emergencyContactRelationship || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      navigate("/login");
      return;
    }
    loadProfile();
  }, [navigate]);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await sendPostRequest("auth", "update-current-user", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        middleName: profile.middleName,
        phoneNumber: profile.phoneNumber,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        maritalStatus: profile.maritalStatus,
        alternativePhone: profile.alternativePhone,
        ministryGroup: profile.ministryGroup,
        servicePosition: profile.servicePosition,
        spiritualGifts: profile.spiritualGifts,
        emergencyContactName: profile.emergencyContactName,
        emergencyContactPhone: profile.emergencyContactPhone,
        emergencyContactRelationship: profile.emergencyContactRelationship,
      });
      if (res.returnCode === 200) {
        toast({ title: t.settings?.profileUpdated });
        loadProfile();
      } else {
        toast({ 
          title: res.message || t.settings?.profileUpdateFailed, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: t.settings?.profileUpdateError, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      toast({ title: t.settings?.passwordFieldsRequired, variant: "destructive" });
      return;
    }

    if (passwords.newPassword.length < 8) {
      toast({ title: t.settings?.passwordMinChars, variant: "destructive" });
      return;
    }

    if (!/[A-Z]/.test(passwords.newPassword) || !/[a-z]/.test(passwords.newPassword)) {
      toast({ title: t.settings?.passwordNeedUpperLower, variant: "destructive" });
      return;
    }

    if (!/\d/.test(passwords.newPassword)) {
      toast({ title: t.settings?.passwordNeedNumber, variant: "destructive" });
      return;
    }

    if (!/[^a-zA-Z0-9]/.test(passwords.newPassword)) {
      toast({ title: t.settings?.passwordNeedSpecial, variant: "destructive" });
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: t.settings?.passwordMismatch, variant: "destructive" });
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      toast({ title: t.settings?.passwordSameAsCurrent, variant: "destructive" });
      return;
    }

    setSavingPassword(true);
    try {
      const res = await sendPostRequest("auth", "update-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.returnCode === 200) {
        toast({ title: t.settings?.passwordUpdated });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: res.returnMessage || t.settings?.passwordUpdateFailed, variant: "destructive" });
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.returnMessage || error?.message || (t.settings?.passwordUpdateError ?? "Error updating password");
      toast({ title: errorMessage, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSowerAction = async () => {
    if (isPayingUser) {
      // Open Stripe Customer Portal
      setSowerPortalLoading(true);
      try {
        const res = await sendPostRequest(
          "subscriptions",
          "create-portal-session",
          {},
        );
        if (res.returnCode === 200 && res.returnData?.url) {
          window.open(res.returnData.url, "_blank");
        } else {
          toast({
            title: "Portal error",
            description: res.returnMessage || "Could not open billing portal.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        toast({
          title: "Error",
          description: err?.message || "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setSowerPortalLoading(false);
      }
    } else {
      // Free user — go to Sower page
      navigate(routes.sower.path);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="relative w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-7 h-7 text-primary" />
          <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1.5 -right-1.5 bg-background rounded-full p-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">{t.settings?.loading}</p>
      </div>
    );
  }

  return (

    <div className="min-h-full bg-background">
      <div className="relative bg-slate-450 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative  mx-auto px-3 sm:px-4 lg:px-6 pt-5 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary/40">
                {t.settings?.pageTitle}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-primary">
                {t.settings?.yourProfile}
              </h1>
            </div>
          </div>
          <p className={cn("text-sm text-primary/50", isRtl ? "mr-[52px]" : "ml-[52px]")}>
            {t.settings?.pageSubtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex w-full max-w-2xl mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
            <TabsTrigger 
              value="profile" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.settings?.tabProfile}</span>
              <span className="sm:hidden text-[10px]">{t.settings?.tabProfileShort}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="additional" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0"
            >
              <Star className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.settings?.tabExtra}</span>
              <span className="sm:hidden text-[10px]">{t.settings?.tabExtraShort}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="password" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.settings?.tabPassword}</span>
              <span className="sm:hidden text-[10px]">{t.settings?.tabPasswordShort}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.settings?.tabLanguage || 'Reading'}</span>
              <span className="sm:hidden text-[10px]">Read</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden text-[10px]">Notify</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.settings?.personalInfo}</h3>
                      <p className="text-xs text-muted-foreground">{t.settings?.personalInfoDesc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-xs font-medium text-muted-foreground">{t.settings?.usernameLabel}</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        disabled
                        className="bg-muted/50 border-dashed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">{t.settings?.emailLabel}</Label>
                      <div className="relative">
                        <Mail className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50", isRtl ? "right-3" : "left-3")} />
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className={cn("bg-muted/50 border-dashed", isRtl ? "pr-10" : "pl-10")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">{t.settings?.firstNameLabel}</Label>
                      <Input
                        id="firstName"
                        placeholder={t.settings?.firstNamePlaceholder}
                        value={profile.firstName}
                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">{t.settings?.lastNameLabel}</Label>
                      <Input
                        id="lastName"
                        placeholder={t.settings?.lastNamePlaceholder}
                        value={profile.lastName}
                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="text-xs font-medium text-muted-foreground">{t.settings?.middleNameLabel}</Label>
                      <Input
                        id="middleName"
                        placeholder={t.settings?.optionalPlaceholder}
                        value={profile.middleName}
                        onChange={(e) => handleProfileChange("middleName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-xs font-medium text-muted-foreground">{t.settings?.phoneLabel}</Label>
                      <div className="relative">
                        <Phone className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50", isRtl ? "right-3" : "left-3")} />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder={t.settings?.phonePlaceholder}
                          value={profile.phoneNumber}
                          onChange={(e) => handleProfileChange("phoneNumber", e.target.value)}
                          className={isRtl ? "pr-10" : "pl-10"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-xs font-medium text-muted-foreground">{t.settings?.dateOfBirthLabel}</Label>
                      <div className="relative">
                        <Calendar className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50", isRtl ? "right-3" : "left-3")} />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
                          className={isRtl ? "pr-10" : "pl-10"}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-xs font-medium text-muted-foreground">{t.settings?.genderLabel}</Label>
                      <Select
                        value={profile.gender || "none"}
                        onValueChange={(value) => handleProfileChange("gender", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.settings?.genderPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.settings?.genderPreferNot}</SelectItem>
                          <SelectItem value="Male">{t.settings?.genderMale}</SelectItem>
                          <SelectItem value="Female">{t.settings?.genderFemale}</SelectItem>
                          <SelectItem value="Other">{t.settings?.genderOther}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ── SOWER STATUS ──────────────────────────────────── */}
                <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-800/40 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                      {isPayingUser ? (
                        <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      ) : (
                        <Sprout className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-violet-900 dark:text-violet-100">
                        Sower Status
                      </h3>
                      <p className="text-xs text-violet-600/70 dark:text-violet-300/70">
                        {isPayingUser
                          ? 'You are supporting the mission'
                          : 'Support the Word, unlock tools'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-violet-900 dark:text-violet-100">
                          {tierLabel}
                        </span>
                        <span
                          className={cn(
                            "inline-block w-2 h-2 rounded-full",
                            isPayingUser
                              ? "bg-emerald-500"
                              : "bg-slate-400",
                          )}
                        />
                      </div>
                      {isPayingUser && expiresLabel && (
                        <p className="text-xs text-violet-600/60 dark:text-violet-300/60 mt-0.5">
                          Renews {expiresLabel}
                        </p>
                      )}
                      {!isPayingUser && (
                        <p className="text-xs text-violet-600/60 dark:text-violet-300/60 mt-0.5">
                          Bible reading is always free
                        </p>
                      )}
                    </div>

                    <Button
                      variant={isPayingUser ? "outline" : "default"}
                      size="sm"
                      onClick={handleSowerAction}
                      disabled={sowerPortalLoading}
                      className={cn(
                        "gap-1.5 text-xs font-bold h-9 shrink-0",
                        !isPayingUser &&
                          "bg-violet-600 hover:bg-violet-700 text-white shadow-sm",
                      )}
                    >
                      {sowerPortalLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPayingUser ? (
                        <CreditCard className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {sowerPortalLoading
                        ? "Loading..."
                        : isPayingUser
                          ? "Manage Sowing"
                          : "Become a Sower"}
                      {!isPayingUser && (
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profile.firstName || !profile.lastName}
                  >
                    {savingProfile ? (
                      <Loader2 className={cn("w-4 h-4 animate-spin", isRtl ? "ml-2" : "mr-2")} />
                    ) : (
                      <Save className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                    )}
                    {t.settings?.saveChanges}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.settings?.additionalDetails}</h3>
                      <p className="text-xs text-muted-foreground">{t.settings?.additionalDetailsDesc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className="text-xs font-medium text-muted-foreground">{t.settings?.maritalStatusLabel}</Label>
                      <Select
                        value={profile.maritalStatus || "none"}
                        onValueChange={(value) => handleProfileChange("maritalStatus", value === "none" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.settings?.maritalPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t.settings?.maritalPreferNot}</SelectItem>
                          <SelectItem value="Single">{t.settings?.maritalSingle}</SelectItem>
                          <SelectItem value="Married">{t.settings?.maritalMarried}</SelectItem>
                          <SelectItem value="Divorced">{t.settings?.maritalDivorced}</SelectItem>
                          <SelectItem value="Widowed">{t.settings?.maritalWidowed}</SelectItem>
                          <SelectItem value="Separated">{t.settings?.maritalSeparated}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alternativePhone" className="text-xs font-medium text-muted-foreground">{t.settings?.alternativePhoneLabel}</Label>
                      <Input
                        id="alternativePhone"
                        type="tel"
                        placeholder={t.settings?.phonePlaceholder}
                        value={profile.alternativePhone}
                        onChange={(e) => handleProfileChange("alternativePhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ministryGroup" className="text-xs font-medium text-muted-foreground">{t.settings?.ministryGroupLabel}</Label>
                      <Input
                        id="ministryGroup"
                        value={profile.ministryGroup}
                        onChange={(e) => handleProfileChange("ministryGroup", e.target.value)}
                        placeholder={t.settings?.ministryGroupPlaceholder}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="servicePosition" className="text-xs font-medium text-muted-foreground">{t.settings?.servicePositionLabel}</Label>
                      <Input
                        id="servicePosition"
                        value={profile.servicePosition}
                        onChange={(e) => handleProfileChange("servicePosition", e.target.value)}
                        placeholder={t.settings?.servicePositionPlaceholder}
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="spiritualGifts" className="text-xs font-medium text-muted-foreground">{t.settings?.spiritualGiftsLabel}</Label>
                      <Input
                        id="spiritualGifts"
                        value={profile.spiritualGifts}
                        onChange={(e) => handleProfileChange("spiritualGifts", e.target.value)}
                        placeholder={t.settings?.spiritualGiftsPlaceholder}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.settings?.emergencyContact}</h3>
                      <p className="text-xs text-muted-foreground">{t.settings?.emergencyContactDesc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName" className="text-xs font-medium text-muted-foreground">{t.settings?.contactNameLabel}</Label>
                      <Input
                        id="emergencyContactName"
                        placeholder={t.settings?.contactNamePlaceholder}
                        value={profile.emergencyContactName}
                        onChange={(e) => handleProfileChange("emergencyContactName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone" className="text-xs font-medium text-muted-foreground">{t.settings?.contactPhoneLabel}</Label>
                      <Input
                        id="emergencyContactPhone"
                        type="tel"
                        placeholder={t.settings?.phonePlaceholder}
                        value={profile.emergencyContactPhone}
                        onChange={(e) => handleProfileChange("emergencyContactPhone", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactRelationship" className="text-xs font-medium text-muted-foreground">{t.settings?.relationshipLabel}</Label>
                      <Input
                        id="emergencyContactRelationship"
                        placeholder={t.settings?.relationshipPlaceholder}
                        value={profile.emergencyContactRelationship}
                        onChange={(e) => handleProfileChange("emergencyContactRelationship", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={savingProfile || !profile.firstName || !profile.lastName}
                  >
                    {savingProfile ? (
                      <Loader2 className={cn("w-4 h-4 animate-spin", isRtl ? "ml-2" : "mr-2")} />
                    ) : (
                      <Save className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                    )}
                    {t.settings?.saveChanges}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                {/* ── Reading Settings ── */}
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Reading Settings</h3>
                      <p className="text-xs text-muted-foreground">Customize your Bible reading experience</p>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <Type className="w-3.5 h-3.5" />
                        Font Size
                      </Label>
                      <span className="text-sm font-bold text-foreground tabular-nums">{readingFontSize}px</span>
                    </div>
                    <Slider
                      value={[readingFontSize]}
                      onValueChange={handleFontSizeChange}
                      min={12}
                      max={32}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground/60">
                      <span>Aa</span>
                      <span>Aa</span>
                    </div>
                  </div>

                  {/* Theme */}
                  <div className="space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground">Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "light", icon: Sun, label: "Light" },
                        { value: "dark", icon: Moon, label: "Dark" },
                        { value: "system", icon: Monitor, label: "System" },
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => handleThemeChange(value)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all",
                            themeMode === value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 text-muted-foreground hover:border-border",
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Translation */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">Preferred Bible Translation</Label>
                    <Select value={preferredTranslation} onValueChange={handleTranslationChange}>
                      <SelectTrigger className="h-10">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground/60" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { id: "BSB", name: "Berean Standard Bible" },
                          { id: "KJV", name: "King James Version" },
                          { id: "WEB", name: "World English Bible" },
                          { id: "ASV", name: "American Standard Version" },
                          { id: "YLT", name: "Young's Literal Translation" },
                          { id: "DARBY", name: "Darby Translation" },
                          { id: "WEBSTER", name: "Webster Bible" },
                          { id: "BBE", name: "Bible in Basic English" },
                        ].map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ── Language / Region ── */}
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Languages className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.settings?.languageRegion}</h3>
                      <p className="text-xs text-muted-foreground">{t.settings?.languageDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">{t.settings?.interfaceLanguage}</Label>
                    <div className="relative">
                      <Select
                        value={currentLang}
                        onValueChange={(value) => setLanguage(value as Language)}
                        disabled={langLoading}
                      >
                        <SelectTrigger className="h-12">
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                            <SelectValue>
                              <span className="font-medium">{LANGUAGE_NAMES[currentLang]}</span>
                              {currentLang !== 'en' && (
                                <span className={cn("text-muted-foreground text-xs", isRtl ? "mr-2" : "ml-2")}>({getLanguageName(currentLang, 'en')})</span>
                              )}
                            </SelectValue>
                          </div>
                        </SelectTrigger>
                        <SelectContent className="max-h-[320px]">
                          {LANGUAGE_GROUPS.map((group) => (
                            <SelectGroup key={group.key}>
                              <SelectLabel className="px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50">
                                {(t.settings as Record<string, string>)?.[group.key] || group.key}
                              </SelectLabel>
                              {group.languages.map((code) => (
                                <SelectItem key={code} value={code} className="py-2.5">
                                  <div className="flex items-center justify-between w-full gap-4">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="font-medium truncate">{LANGUAGE_NAMES[code]}</span>
                                      {code !== 'en' && (
                                        <span className="text-muted-foreground/60 text-xs shrink-0">
                                          ({getLanguageName(code, 'en')})
                                        </span>
                                      )}
                                    </div>
                                    {code === currentLang && (
                                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      {langLoading && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                      {currentLang !== 'en'
                        ? t.settings?.translationNote
                        : t.settings?.switchNote}
                    </p>
                  </div>

                  {currentLang !== 'en' && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{t.settings?.translationWarning}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Notification Preferences</h3>
                      <p className="text-xs text-muted-foreground">Manage how you receive updates and reminders</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        key: "dailyVerseReminder" as const,
                        label: "Daily Verse Reminder",
                        description: "Receive a notification each day with the verse of the day",
                        icon: Sun,
                        iconBg: "bg-amber-100 dark:bg-amber-900/30",
                        iconColor: "text-amber-600",
                      },
                      {
                        key: "devotionReminder" as const,
                        label: "Devotion Reminder",
                        description: "Get notified when a new daily devotion is available",
                        icon: BookOpen,
                        iconBg: "bg-blue-100 dark:bg-blue-900/30",
                        iconColor: "text-blue-600",
                      },
                      {
                        key: "studyReminders" as const,
                        label: "Study Reminders",
                        description: "Gentle reminders to continue your Exegesis Lab studies",
                        icon: Bell,
                        iconBg: "bg-violet-100 dark:bg-violet-900/30",
                        iconColor: "text-violet-600",
                      },
                      {
                        key: "emailNotifications" as const,
                        label: "Email Notifications",
                        description: "Receive updates and digests via email",
                        icon: Mail,
                        iconBg: "bg-green-100 dark:bg-green-900/30",
                        iconColor: "text-green-600",
                      },
                      {
                        key: "pushNotifications" as const,
                        label: "Push Notifications",
                        description: "Enable browser push notifications for real-time updates",
                        icon: Bell,
                        iconBg: "bg-rose-100 dark:bg-rose-900/30",
                        iconColor: "text-rose-600",
                      },
                    ].map(({ key, label, description, icon: Icon, iconBg, iconColor }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                            <Icon className={cn("w-5 h-5", iconColor)} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{label}</p>
                            <p className="text-xs text-muted-foreground truncate">{description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={notifications[key]}
                          onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Notification preferences are stored locally. Enable browser notifications in your device settings for the best experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0 space-y-4">
                <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{t.settings?.changePassword}</h3>
                      <p className="text-xs text-muted-foreground">{t.settings?.changePasswordDesc}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-xs font-medium text-muted-foreground">{t.settings?.currentPasswordLabel}</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          placeholder={t.settings?.currentPasswordPlaceholder}
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn("absolute top-1/2 -translate-y-1/2 h-8 w-8 before:absolute before:content-[''] before:-inset-2 before:rounded-lg hover:bg-transparent [touch-action:manipulation]", isRtl ? "left-1" : "right-1")}
                          onClick={() => togglePasswordVisibility("current")}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground">{t.settings?.newPasswordLabel}</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          placeholder={t.settings?.newPasswordPlaceholder}
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn("absolute top-1/2 -translate-y-1/2 h-8 w-8 before:absolute before:content-[''] before:-inset-2 before:rounded-lg hover:bg-transparent [touch-action:manipulation]", isRtl ? "left-1" : "right-1")}
                          onClick={() => togglePasswordVisibility("new")}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {passwords.newPassword && (
                        <div className="space-y-2 pt-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className={cn(
                                  "h-1 flex-1 rounded transition-all",
                                  i <= passwordStrength.level ? passwordStrength.color : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className={cn(
                            "text-xs font-medium",
                            passwordStrength.level <= 2
                              ? "text-red-500"
                              : passwordStrength.level <= 3
                              ? "text-yellow-500"
                              : "text-green-500"
                          )}>
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">{t.settings?.confirmPasswordLabel}</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          placeholder={t.settings?.confirmPasswordPlaceholder}
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) => setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className={cn("absolute top-1/2 -translate-y-1/2 h-8 w-8 before:absolute before:content-[''] before:-inset-2 before:rounded-lg hover:bg-transparent [touch-action:manipulation]", isRtl ? "left-1" : "right-1")}
                          onClick={() => togglePasswordVisibility("confirm")}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      {passwords.newPassword && passwords.confirmPassword && (
                        passwords.newPassword === passwords.confirmPassword ? (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {t.settings?.passwordsMatch}
                          </p>
                        ) : (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {t.settings?.passwordsDontMatch}
                          </p>
                        )
                      )}
                    </div>
                  </div>

                  {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>{t.settings?.passwordsRequirementNote}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={
                      savingPassword ||
                      !passwords.currentPassword ||
                      !passwords.newPassword ||
                      !passwords.confirmPassword ||
                      passwords.newPassword !== passwords.confirmPassword ||
                      passwords.newPassword.length < 8 ||
                      !/[A-Z]/.test(passwords.newPassword) ||
                      !/[a-z]/.test(passwords.newPassword) ||
                      !/\d/.test(passwords.newPassword) ||
                      !/[^a-zA-Z0-9]/.test(passwords.newPassword)
                    }
                  >
                    {savingPassword ? (
                      <Loader2 className={cn("w-4 h-4 animate-spin", isRtl ? "ml-2" : "mr-2")} />
                    ) : (
                      <Lock className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
                    )}
                    {t.settings?.updatePassword}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="h-8" />
      </div>
    </div>
  );
}