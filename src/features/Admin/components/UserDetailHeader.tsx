// UserDetailHeader — header with back button and user actions
import {
  ArrowLeft, Shield, ShieldOff, CheckCircle, XCircle, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserDetailHeaderProps {
  username: string;
  status: boolean;
  emailVerified: boolean;
  actionLoading: boolean;
  onBack: () => void;
  onToggleStatus: () => void;
  onToggleVerification: () => void;
  onDelete: () => void;
}

export function UserDetailHeader({
  username,
  status,
  emailVerified,
  actionLoading,
  onBack,
  onToggleStatus,
  onToggleVerification,
  onDelete,
}: UserDetailHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-auto min-h-[4rem] py-2 gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold truncate">User Detail</h1>
              <p className="text-xs text-muted-foreground truncate">@{username}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
            <Button variant="outline" size="sm" onClick={onToggleStatus} disabled={actionLoading} className="gap-1.5 text-xs">
              {status ? <ShieldOff className="w-3.5 h-3.5 text-destructive" /> : <Shield className="w-3.5 h-3.5 text-emerald-500" />}
              {status ? "Deactivate" : "Activate"}
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleVerification} disabled={actionLoading} className="gap-1.5">
              {emailVerified ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
              {emailVerified ? "Unverify" : "Verify"}
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} disabled={actionLoading} className="gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
