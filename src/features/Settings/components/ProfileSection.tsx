import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Save } from "lucide-react";
import type { UserSettings } from "../hooks/useUserSettings";

interface ProfileSectionProps {
  profile: UserSettings["profile"];
  saving: boolean;
  onSave: (data: any) => void;
}
export function ProfileSection({ profile, saving, onSave }: ProfileSectionProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
    });
  };
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={profile?.name || ""} />
          </div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={profile?.email || ""} />
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={profile?.phone || ""} />
          <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
