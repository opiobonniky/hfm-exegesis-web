import { useNavigate } from "react-router-dom";
import { Mail, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useGoogleRegisterPage } from "../hooks/useGoogleRegisterPage";

const GoogleRegister = () => {
  const p = useGoogleRegisterPage();
  const { t, isRtl, state, phoneNumber, setPhoneNumber, username, setUsername, loading, error, handleRegister } = p;
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const firstName = state?.firstName || "";
  const lastName = state?.lastName || "";
  const email = state?.email || "";
  const photoUrl = state?.photoUrl || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${firstName} ${lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {firstName?.[0] || "G"}
                  {lastName?.[0] || "U"}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold">
            {(t.auth?.welcomeUser || 'Welcome, {name}!').replace('{name}', firstName)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t.auth?.completeRegistrationDesc || 'Complete your registration to get started'}
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{email}</p>
              <p className="text-xs text-muted-foreground truncate">
                {firstName} {lastName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.auth?.username || 'Username'}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.auth?.chooseUsername || 'Choose a username'}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.auth?.uniqueIdentifier || 'This will be your unique identifier'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.auth?.createPassword || 'Create Password'}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth?.enterPassword || 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t.common?.confirmPassword || 'Confirm Password'}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t.common?.confirmPassword || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background text-sm"
              />
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-500">{t.auth?.passwordsDoNotMatch || 'Passwords do not match'}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {t.auth?.continueBtn || 'Continue'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm">
          <button
            onClick={() => navigate("/login")}
            className="text-muted-foreground hover:text-primary"
          >
            {t.auth?.useDifferentAccount || 'Use different account'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default GoogleRegister;
