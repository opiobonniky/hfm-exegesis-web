"use client";

import { useExtendedProfilePage } from "../hooks/useExtendedProfilePage";
import { ArrowLeft, Save, Loader2, Heart, Briefcase, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RELATIONSHIP_OPTIONS = ["Spouse", "Parent", "Sibling", "Child", "Friend", "Colleague", "Pastor", "Other"];
const MINISTRY_GROUPS = ["Worship", "Teaching", "Youth", "Children", "Outreach", "Hospitality", "Administration", "Prayer", "Media"];

export default function ExtendedProfilePage() {
  const h = useExtendedProfilePage();
  const { loading, saving, form, updateField, handleSave, navigate } = h;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const updateFieldAny = updateField as any;

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
            <p className="text-sm text-muted-foreground">Ministry details and emergency contacts</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </div>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Personal Details</CardTitle>
          <CardDescription>Additional personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Middle Name</Label>
            <Input value={form.middleName} onChange={(e) => updateFieldAny("middleName", e.target.value)} placeholder="Middle name (optional)" />
          </div>
          <div className="space-y-2">
            <Label>Alternative Phone</Label>
            <Input value={form.alternativePhone} onChange={(e) => updateFieldAny("alternativePhone", e.target.value)} placeholder="Alternative phone (optional)" />
          </div>
        </CardContent>
      </Card>

      {/* Ministry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-blue-500" /> Ministry Information</CardTitle>
          <CardDescription>Your ministry involvement and spiritual gifts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ministry Group</Label>
            <Select value={form.ministryGroup} onValueChange={(v) => updateFieldAny("ministryGroup", v)}>
              <SelectTrigger><SelectValue placeholder="Select ministry group" /></SelectTrigger>
              <SelectContent>
                {MINISTRY_GROUPS.map((g) => (<SelectItem key={g} value={g}>{g}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Service Position</Label>
            <Input value={form.servicePosition} onChange={(e) => updateFieldAny("servicePosition", e.target.value)} placeholder="e.g. Worship Leader, Small Group Facilitator" />
          </div>
          <div className="space-y-2">
            <Label>Spiritual Gifts</Label>
            <Input value={form.spiritualGifts} onChange={(e) => updateFieldAny("spiritualGifts", e.target.value)} placeholder="e.g. Teaching, Prophecy, Healing (comma-separated)" />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-rose-500" /> Emergency Contact</CardTitle>
          <CardDescription>Contact in case of emergency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={form.emergencyContactName} onChange={(e) => updateFieldAny("emergencyContactName", e.target.value)} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label>Contact Phone</Label>
            <Input value={form.emergencyContactPhone} onChange={(e) => updateFieldAny("emergencyContactPhone", e.target.value)} placeholder="Phone number" />
          </div>
          <div className="space-y-2">
            <Label>Relationship</Label>
            <Select value={form.emergencyContactRelationship} onValueChange={(v) => updateFieldAny("emergencyContactRelationship", v)}>
              <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
