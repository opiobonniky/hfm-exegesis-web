import { Link } from "react-router-dom";
import { Mail, User } from "lucide-react";
import { useGoogleRegisterPage } from "../hooks/useGoogleRegisterPage";
const GoogleRegister = () => {
  const p = useGoogleRegisterPage();
  const { t, isRtl, state, phoneNumber, setPhoneNumber, username, setUsername, loading, error, handleRegister } = p;
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
          <h1 className="text-2xl font-bold">{(t.auth?.welcomeUser || 'Welcome, {name}!').replace('{name}', firstName || '')}</h1>
          <p className="text-muted-foreground mt-1">
            {t.auth?.completeRegistrationDesc || 'Complete your registration to get started'}
          </p>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Chrome className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{email}</p>
              <p className="text-xs text-muted-foreground truncate">
                {firstName} {lastName}
              </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t.auth?.username || 'Username'}</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder={t.auth?.chooseUsername || 'Choose a username'}
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.replace(/\s/g, "").toLowerCase())
                }
                className="pl-3"
            <p className="text-xs text-muted-foreground">
              {t.auth?.uniqueIdentifier || 'This will be your unique identifier'}
            </p>
            <Label>{t.auth?.createPassword || 'Create Password'}</Label>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                type={showPassword ? "text" : "password"}
                placeholder={t.auth?.enterPassword || 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
          {password.length > 0 && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              <p className="text-xs text-muted-foreground text-right">
                {getStrengthLabel()}
          )}
            <Label>{t.common?.confirmPassword || 'Confirm Password'}</Label>
                placeholder={t.common?.confirmPassword || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">{t.auth?.passwordsDoNotMatch || 'Passwords do not match'}</p>
        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={!allReqsMet || !passwordsMatch || isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              {t.auth?.creatingAccount || 'Creating account...'}
            </>
          ) : (
              {t.auth?.continueBtn || 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
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
