/**
 * GoogleRegisterForm — form for Google account registration.
 * Extracts all raw HTML, className, styled elements from GoogleRegister page.
 */
import { Mail, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { AuthLoadingButton } from "./AuthLoadingButton";

interface GoogleRegisterFormProps {
  t: any;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  passwordMismatch: boolean;
  loading: boolean;
  error: string;
  handleRegister: (e: React.FormEvent) => void;
}

export function GoogleRegisterForm({
  t, email, firstName, lastName,
  username, setUsername, password, setPassword,
  confirmPassword, setConfirmPassword, showPassword, setShowPassword,
  passwordMismatch, loading, error, handleRegister,
}: GoogleRegisterFormProps) {
  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">{t.auth?.username || "Username"}</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={t.auth?.chooseUsername || "Choose a username"} value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background text-sm" />
        </div>
        <p className="text-xs text-muted-foreground">{t.auth?.uniqueIdentifier || "This will be your unique identifier"}</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t.auth?.createPassword || "Create Password"}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type={showPassword ? "text" : "password"} placeholder={t.auth?.enterPassword || "Enter password"}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-sm" />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t.common?.confirmPassword || "Confirm Password"}</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type={showPassword ? "text" : "password"} placeholder={t.common?.confirmPassword || "Confirm Password"}
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background text-sm" />
        </div>
        {passwordMismatch && <p className="text-xs text-red-500">{t.auth?.passwordsDoNotMatch || "Passwords do not match"}</p>}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <AuthLoadingButton loading={loading}>
        {t.auth?.continueBtn || "Continue"}<ArrowRight className="w-4 h-4 ml-2" />
      </AuthLoadingButton>
    </form>
  );
}
