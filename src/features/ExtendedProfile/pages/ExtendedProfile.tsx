"use client";
import { useExtendedProfilePage } from "../hooks/useExtendedProfilePage";

import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Heart,
  Briefcase,
  Phone,
  User,
  AlertCircle,
} from "lucide-react";
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { routes } from "@/components/Routes/routes";
interface ExtendedProfileData {
  middleName: string;
  alternativePhone: string;
  ministryGroup: string;
  servicePosition: string;
  spiritualGifts: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}
const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Friend",
  "Colleague",
  "Pastor",
  "Other",
];
const MINISTRY_GROUPS = [
  "Worship",
  "Teaching",
  "Youth",
  "Children",
  "Outreach",
  "Hospitality",
  "Administration",
  "Prayer",
  "Media",
export default function ExtendedProfilePage() {
  const h = useExtendedProfilePage();
  const { loading, saving, form, updateField, handleSave, navigate } = h;
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Additional Information</h1>
            <p className="text-sm text-muted-foreground">
              Ministry details and emergency contacts
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Details
          </CardTitle>
          <CardDescription>Additional personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Label>Middle Name</Label>
            <Input
              value={form.middleName}
              onChange={(e) => setForm((p) => ({ ...p, middleName: e.target.value }))}
              placeholder="Middle name (optional)"
            />
            <Label>Alternative Phone</Label>
              value={form.alternativePhone}
              onChange={(e) => setForm((p) => ({ ...p, alternativePhone: e.target.value }))}
              placeholder="Alternative phone (optional)"
        </CardContent>
      </Card>
      {/* Ministry */}
            <Briefcase className="h-5 w-5 text-blue-500" />
            Ministry Information
          <CardDescription>Your ministry involvement and spiritual gifts</CardDescription>
            <Label>Ministry Group</Label>
            <Select
              value={form.ministryGroup}
              onValueChange={(v) => setForm((p) => ({ ...p, ministryGroup: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ministry group" />
              </SelectTrigger>
              <SelectContent>
                {MINISTRY_GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Label>Service Position</Label>
              value={form.servicePosition}
              onChange={(e) => setForm((p) => ({ ...p, servicePosition: e.target.value }))}
              placeholder="e.g. Worship Leader, Small Group Facilitator"
            <Label>Spiritual Gifts</Label>
              value={form.spiritualGifts}
              onChange={(e) => setForm((p) => ({ ...p, spiritualGifts: e.target.value }))}
              placeholder="e.g. Teaching, Prophecy, Healing (comma-separated)"
      {/* Emergency Contact */}
            <Heart className="h-5 w-5 text-rose-500" />
            Emergency Contact
          <CardDescription>Contact in case of emergency</CardDescription>
            <Label>Contact Name</Label>
              value={form.emergencyContactName}
              onChange={(e) =>
                setForm((p) => ({ ...p, emergencyContactName: e.target.value }))
              }
              placeholder="Full name"
            <Label>Contact Phone</Label>
              value={form.emergencyContactPhone}
                setForm((p) => ({ ...p, emergencyContactPhone: e.target.value }))
              placeholder="Phone number"
            <Label>Relationship</Label>
              value={form.emergencyContactRelationship}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, emergencyContactRelationship: v }))
                <SelectValue placeholder="Select relationship" />
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
    </div>
  );
