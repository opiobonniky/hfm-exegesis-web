import { AuthLoadingSpinner } from "./AuthLoadingSpinner";
import googleIcon from "@/assets/icons/google-icon.svg";

interface RegisterGoogleButtonProps {
  label: string;
  isLoading: boolean;
  onClick: () => void;
}

export function RegisterGoogleButton({ label, isLoading, onClick }: RegisterGoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full h-12 rounded-2xl border border-border bg-card font-bold text-sm flex items-center justify-center gap-3 hover:bg-muted transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <AuthLoadingSpinner size="sm" />
      ) : (
        <>
          <img src={googleIcon} alt="Google" className="w-5 h-5" />
          {label}
        </>
      )}
    </button>
  );
}
