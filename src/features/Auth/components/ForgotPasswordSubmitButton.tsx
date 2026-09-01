// ForgotPassword submit button component
import { ReactNode } from "react";
import { AuthLoadingSpinner } from "./AuthLoadingSpinner";

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
      {isLoading ? <AuthLoadingSpinner /> : children}
    </button>
  );
}
