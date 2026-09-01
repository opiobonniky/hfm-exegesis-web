// ForgotPassword footer links
import { ArrowLeft } from "lucide-react";
import { AuthAccountLink } from "./AuthAccountLink";

interface ForgotPasswordFooterProps {
  rememberLabel: string;
  signInLabel: string;
  backToLoginLabel: string;
}

export function ForgotPasswordFooter({ rememberLabel, signInLabel, backToLoginLabel }: ForgotPasswordFooterProps) {
  return (
    <div className="text-center space-y-6">
      <p className="text-muted-foreground text-sm font-medium">
        {rememberLabel}{" "}
        <AuthAccountLink to="/login" label={signInLabel} />
      </p>
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/70 font-black uppercase tracking-widest hover:text-primary transition-colors group pt-6 border-t border-border/50">
        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
        <AuthAccountLink to="/login" label={backToLoginLabel} />
      </div>
    </div>
  );
}
