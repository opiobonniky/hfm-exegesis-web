// UserProfileCard — avatar + name + role/status/verified badges
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/Avatar";

interface UserProfileCardProps {
  firstName?: string;
  lastName?: string;
  username: string;
  profilePhotoUrl?: string | null;
  status: boolean;
  emailVerified: boolean;
  userRole: number;
  subscriptionTier?: string;
  role: { label: string; color: string };
  tierColor: string;
}

export function UserProfileCard({
  firstName,
  lastName,
  username,
  profilePhotoUrl,
  status,
  emailVerified,
  subscriptionTier,
  role,
  tierColor,
}: UserProfileCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar
            firstName={firstName}
            lastName={lastName}
            username={username}
            src={profilePhotoUrl || undefined}
            size="lg"
            className="w-16 h-16 text-xl"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">
                {firstName || lastName
                  ? `${firstName || ""} ${lastName || ""}`.trim()
                  : username}
              </h2>
              <Badge variant="outline" className={`text-[10px] font-semibold ${role.color}`}>
                {role.label}
              </Badge>
              <Badge variant={status ? "default" : "destructive"} className="text-[10px]">
                {status ? "Active" : "Inactive"}
              </Badge>
              {emailVerified && (
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                  <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Verified
                </Badge>
              )}
              {subscriptionTier && subscriptionTier !== "free" && (
                <Badge variant="outline" className={`text-[10px] ${tierColor}`}>
                  {subscriptionTier}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">@{username}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
