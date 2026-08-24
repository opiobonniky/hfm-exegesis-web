"use client";

import { User, Star, Lock, Sliders, Bell } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { ProfileTab } from "../components/ProfileTab";
import { PasswordTab } from "../components/PasswordTab";
import { PreferencesTab } from "../components/PreferencesTab";
import { NotificationsTab } from "../components/NotificationsTab";
import SettingsHeader from "../components/SettingsHeader";
import SettingsLoading from "../components/SettingsLoading";
import AdditionalDetailsTab from "../components/AdditionalDetailsTab";
const TAB_ICONS = { profile: User, additional: Star, password: Lock, preferences: Sliders, notifications: Bell };
export default function Settings() {
  const h = useSettingsPage();
  if (h.loading) return <SettingsLoading />;
  const tabs = [
    { value: "profile", label: "Profile", short: "Profile" },
    { value: "additional", label: "Details", short: "Details" },
    { value: "password", label: "Password", short: "Pass" },
    { value: "preferences", label: "Reading", short: "Read" },
    { value: "notifications", label: "Notifications", short: "Notify" },
  ];
  return (
    <div dir={h.isRtl ? "rtl" : "ltr"} className="min-h-full bg-background">
      <SettingsHeader />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="flex w-full max-w-2xl mb-6 bg-muted/50 p-1 rounded-xl overflow-x-auto">
            {tabs.map(({ value, label, short }) => {
              const Icon = TAB_ICONS[value as keyof typeof TAB_ICONS];
              return (
                <TabsTrigger key={value} value={value} className="rounded-lg gap-1.5 sm:gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm shrink-0">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden text-[10px]">{short}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value="profile">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <ProfileTab profile={h.profile} isPayingUser={h.isPayingUser} tierLabel={h.tierLabel} expiresLabel={h.expiresLabel}
                  saving={h.savingProfile} onProfileChange={h.handleProfileChange} onSaveProfile={h.handleSaveProfile}
                  onSowerAction={h.handleSowerAction} sowerLoading={h.sowerPortalLoading} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="additional">
                <AdditionalDetailsTab profile={h.profile} onFieldChange={h.handleProfileChange}
                  onSave={h.handleSaveProfile} saving={h.savingProfile} />
          <TabsContent value="password">
              <CardContent className="p-0"><PasswordTab saving={h.savingPassword} onSave={h.handlePasswordChange} /></CardContent>
          <TabsContent value="preferences">
              <CardContent className="p-0"><PreferencesTab fontSize={h.readingFontSize} onFontSizeChange={h.handleFontSizeChange}
                translation={h.preferredTranslation} onTranslationChange={h.handleTranslationChange} /></CardContent>
          <TabsContent value="notifications">
              <CardContent className="p-0"><NotificationsTab notifications={h.notifications} onToggle={h.handleNotificationChange} /></CardContent>
        </Tabs>
        <div className="h-8" />
      </div>
    </div>
  );
}
