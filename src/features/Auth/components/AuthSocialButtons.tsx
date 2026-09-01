/**
 * AuthSocialButtons — social login buttons (Google, Lordsbook, etc.).
 */
import { ReactNode } from "react";

interface SocialButton {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  loading?: boolean;
}

interface Props {
  buttons: SocialButton[];
}

export function AuthSocialButtons({ buttons }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          type="button"
          className="h-12 bg-card border-2 border-border/50 rounded-xl flex items-center justify-center gap-2 hover:bg-muted hover:border-border hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-200 font-semibold text-foreground relative"
          onClick={btn.onClick}
          disabled={btn.loading}
        >
          {btn.loading ? (
            <div className="w-4 h-4 border-2 border-border border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <>
              {btn.icon}
              <span className="text-xs font-medium truncate">{btn.label}</span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}
