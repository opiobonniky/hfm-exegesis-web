/**
 * GoogleRegisterEmailCard — displays email and name for Google registration.
 */
import { Mail } from "lucide-react";

interface GoogleRegisterEmailCardProps {
  email: string;
  firstName: string;
  lastName: string;
}

export function GoogleRegisterEmailCard({ email, firstName, lastName }: GoogleRegisterEmailCardProps) {
  return (
    <div className="bg-muted/30 rounded-xl p-4 border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <div className="overflow-hidden">
          <p className="font-medium truncate">{email}</p>
          <p className="text-xs text-muted-foreground truncate">{firstName} {lastName}</p>
        </div>
      </div>
    </div>
  );
}
