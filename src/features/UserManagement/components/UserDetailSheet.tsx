"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, BadgeX, Shield, Mail, Phone, Calendar } from "lucide-react";
import type { User } from "../types";
interface UserDetailSheetProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleActive: (userId: string) => void;
}
export default function UserDetailSheet({
  user,
  open,
  onOpenChange,
  onToggleActive,
}: UserDetailSheetProps) {
  if (!user) return null;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {user.name?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold">{user.name}</p>
              <p className="text-sm text-muted-foreground">@{user.email?.split("@")[0]}</p>
          </div>
          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              <Shield className="w-3 h-3 mr-1" />
              {user.role}
            </Badge>
            <Badge variant={user.isVerified ? "default" : "outline"}>
              {user.isVerified ? (
                <><BadgeCheck className="w-3 h-3 mr-1" /> Verified</>
              ) : (
                <><BadgeX className="w-3 h-3 mr-1" /> Unverified</>
              )}
            <Badge variant={user.isActive ? "default" : "outline"}>
              {user.isActive ? "Active" : "Inactive"}
          {/* Info */}
          <div className="space-y-3">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            {user.phone && <InfoRow icon={Phone} label="Phone" value={user.phone} />}
            <InfoRow icon={Calendar} label="Joined" value={user.createdAt} />
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant={user.isActive ? "outline" : "default"}
              onClick={() => onToggleActive(user.id)}
              className="flex-1"
            >
              {user.isActive ? "Deactivate" : "Activate"}
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string }) {
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
