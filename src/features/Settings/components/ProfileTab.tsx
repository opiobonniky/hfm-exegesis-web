import { useState } from "react";
import { User, Mail, Phone, Calendar, Shield, Sparkles, Sprout, Loader2, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/components/languages/languageProvider";
import { useRTL } from "@/providers/RTLProvider";
import { cn } from "@/lib/utils";

interface ProfileTabProps {
  profile: any;
  isPayingUser: boolean;
  tierLabel: string;
  expiresLabel: string;
  saving: boolean;
  onProfileChange: (field: string, value: string) => void;
  onSaveProfile: () => void;
  onSowerAction: () => void;
  sowerLoading: boolean;
}

export function ProfileTab({ profile, isPayingUser, tierLabel, expiresLabel, saving, onProfileChange, onSaveProfile, onSowerAction, sowerLoading }: ProfileTabProps) {
  const { t } = useLanguage();
  const { isRtl } = useRTL();

  return (
    <div className="space-y-4">
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
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.usernameLabel}</Label>
            <Input value={profile.username} disabled className="bg-muted/50 border-dashed" />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.emailLabel}</Label>
            <Input type="email" value={profile.email} disabled className="bg-muted/50 border-dashed" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.firstNameLabel}</Label>
            <Input value={profile.firstName} onChange={(e) => onProfileChange("firstName", e.target.value)} />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.lastNameLabel}</Label>
            <Input value={profile.lastName} onChange={(e) => onProfileChange("lastName", e.target.value)} />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.middleNameLabel}</Label>
            <Input value={profile.middleName} onChange={(e) => onProfileChange("middleName", e.target.value)} />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.phoneLabel}</Label>
            <Input type="tel" value={profile.phoneNumber} onChange={(e) => onProfileChange("phoneNumber", e.target.value)} />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.dateOfBirthLabel}</Label>
            <Input type="date" value={profile.dateOfBirth} onChange={(e) => onProfileChange("dateOfBirth", e.target.value)} />
            <Label className="text-xs font-medium text-muted-foreground">{t.settings?.genderLabel}</Label>
            <Select value={profile.gender || "none"} onValueChange={(v) => onProfileChange("gender", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder={t.settings?.genderPlaceholder} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Prefer not to say</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={onSaveProfile} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {saving ? "Saving..." : t.settings?.saveProfile || "Save Profile"}
        </Button>
      </div>
      <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40 border border-violet-200 dark:border-violet-800/40 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
              {isPayingUser ? <Sparkles className="w-5 h-5 text-violet-600" /> : <Sprout className="w-5 h-5 text-violet-600" />}
            </div>
            <div>
              <h3 className="font-semibold text-violet-900 dark:text-violet-100">Sower Status</h3>
              <p className="text-xs text-violet-600/70 dark:text-violet-300/70">{isPayingUser ? "Supporting the mission" : "Support the Word, unlock tools"}</p>
            </div>
          </div>
          <Button variant={isPayingUser ? "outline" : "default"} size="sm" onClick={onSowerAction} disabled={sowerLoading}
            className={cn("gap-1.5 text-xs font-bold h-9", !isPayingUser && "bg-violet-600 hover:bg-violet-700 text-white")}>
            {sowerLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : isPayingUser ? "Manage" : "Upgrade"}
          </Button>
        </div>
      </div>
    </div>
  );
}
