// CreateUserHeader — header for the create user form
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateUserHeaderProps {
  onBack: () => void;
}

export function CreateUserHeader({ onBack }: CreateUserHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 h-16">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Create New User
            </h1>
            <p className="text-xs text-muted-foreground">
              Add a new user to the system with a role assignment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
