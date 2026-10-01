// ForgotPassword submit button component
import { ReactNode } from "react";
import { AuthLoadingSpinner } from "./AuthLoadingSpinner";
import { StableLoadingContent } from "@/components/ui/StableLoadingContent";

interface ForgotPasswordSubmitButtonProps {
  isLoading: boolean;
  children: ReactNode;
}

export function ForgotPasswordSubmitButton({ isLoading, children }: ForgotPasswordSubmitButtonProps) {
  return (
    <button
      type="submit"
      className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-[15px] shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
      disabled={isLoading}
    >
      <StableLoadingContent loading={isLoading} idle={children} pending={<AuthLoadingSpinner />} />
    </button>
  );
}
