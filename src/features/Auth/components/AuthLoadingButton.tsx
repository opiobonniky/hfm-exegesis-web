/**
 * AuthLoadingButton — consistent submit button with loading spinner for Auth pages.
 * Replaces the repeated button pattern with spinner across Login, ForgotPassword, etc.
 */
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
}

export function AuthLoadingButton({
  children,
  loading,
  disabled,
  type = "submit",
  onClick,
  className,
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        "w-full h-14 bg-primary text-white rounded-2xl font-semibold text-[15px] shadow-lg shadow-primary/20",
        "hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0",
        "transition-all duration-200 flex items-center justify-center gap-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
