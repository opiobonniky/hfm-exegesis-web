import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TriviaUserDetail } from "../hooks/useAdminTriviaUserDetailPage";

interface UserHeaderProps {
  detail: TriviaUserDetail;
  onGoBack: () => void;
}

export function UserHeader({ detail, onGoBack }: UserHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={onGoBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <span className="text-2xl font-bold">{detail.username}</span>
        <span className="text-sm text-muted-foreground">{detail.email}</span>
      </div>
    </div>
  );
}
