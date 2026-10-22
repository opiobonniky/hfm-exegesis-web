"use client";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useSettingsPage } from "../hooks/useSettingsPage";
import { ProfileTab } from "../components/ProfileTab";
import { PasswordTab } from "../components/PasswordTab";
import { PreferencesTab } from "../components/PreferencesTab";
import { NotificationsTab } from "../components/NotificationsTab";
import SettingsHeader from "../components/SettingsHeader";
import SettingsLoading from "../components/SettingsLoading";
import AdditionalDetailsTab from "../components/AdditionalDetailsTab";
import { SettingsTabBar, SettingsContentWrapper, SettingsContentArea, SettingsBottomSpacer } from "../components";

export default function Settings() {
  const { data, actions } = useSettingsPage();
  const h = { ...data, ...actions };
  if (h.loading) return <SettingsLoading />;

  return (
    <SettingsContentWrapper isRtl={h.isRtl}>
      <SettingsHeader />
      <SettingsContentArea>
        <Tabs defaultValue="profile" className="w-full">
          <SettingsTabBar />

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
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <AdditionalDetailsTab profile={h.profile} onFieldChange={h.handleProfileChange}
                  onSave={h.handleSaveProfile} saving={h.savingProfile} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <PasswordTab saving={h.savingPassword} onSave={h.handlePasswordChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <PreferencesTab fontSize={h.readingFontSize} onFontSizeChange={h.handleFontSizeChange}
                  translation={h.preferredTranslation} onTranslationChange={h.handleTranslationChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <NotificationsTab notifications={h.notifications} onToggle={h.handleNotificationChange} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="mt-10 flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Account</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Permanently delete your account and study content.
            </p>
          </div>
          <Link
            to="/delete-account"
            className="text-sm font-medium text-destructive hover:underline"
          >
            Delete account
          </Link>
        </div>
        <SettingsBottomSpacer />
      </SettingsContentArea>
    </SettingsContentWrapper>
  );
}
