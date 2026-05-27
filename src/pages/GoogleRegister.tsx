import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowRight, Chrome, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/components/languages/languageProvider";
import { sendPostRequest } from "@/services/api";
import { routes } from "@/components/Routes/routes";

const GoogleRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUserInfo } = useAuth();
  const { t, isRtl } = useLanguage();

  console.log("Google registration state:", location.state);

  const { googleId, email, firstName, lastName, photoUrl } =
    location.state || {};

  const [username, setUsername] = useState(
    () =>
      `${firstName?.toLowerCase() || "user"}${lastName?.toLowerCase() || ""}`.replace(
        /\s/g,
        "",
      ) || "google_user",
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!googleId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">{t.auth?.invalidRequest || 'Invalid Request'}</h2>
          <p className="text-muted-foreground mt-2 mb-6">
            {t.auth?.pleaseSignInGoogle || 'Please sign in with Google first.'}
          </p>
          <Button onClick={() => navigate("/login")}>{t.auth?.goToLogin || 'Go to Login'}</Button>
        </div>
      </div>
    );
  }

  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const allReqsMet = strength >= 5;
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const getStrengthColor = () => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = () => {
    if (strength === 0) return t.auth?.veryWeak || 'Very Weak';
    if (strength === 1) return t.auth?.veryWeak || 'Very Weak';
    if (strength === 2) return t.auth?.weak || 'Weak';
    if (strength === 3) return t.auth?.fair || 'Fair';
    if (strength === 4) return t.auth?.good || 'Good';
    return t.auth?.strong || 'Strong';
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: t.auth?.usernameRequired || 'Username Required',
        description: t.auth?.enterUsername || 'Please enter a username.',
        variant: "destructive",
      });
      return;
    }

    if (!allReqsMet) {
      toast({
        title: t.auth?.passwordTooWeak || 'Password Too Weak',
        description: t.auth?.strongerPassword || 'Please use a stronger password.',
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: t.auth?.passwordsDontMatch || "Passwords Don't Match",
        description: t.auth?.passwordsMustMatch || 'Please make sure both passwords are the same.',
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await sendPostRequest(
        "auth",
        "complete-google-registration",
        {
          googleId,
          username: username.toLowerCase().trim(),
          password,
          firstName: firstName || "Google",
          lastName: lastName || "User",
          phoneNumber: "",
          gender: "Not specified",
          email: email,
          photoUrl: photoUrl || null,
        },
      );

      const { returnCode, returnData, returnMessage } = response;

      if (returnCode === 200 && returnData) {
        const userInfo: any = {
          token: returnData.token,
          tokenType: returnData.tokenType,
          username: returnData.username,
          email: returnData.email,
          firstName: returnData.firstName,
          lastName: returnData.lastName,
          profilePhotoUrl: returnData.profilePhotoUrl,
          userRole: returnData.userRole,
          roleName: returnData.roleName,
        };

        setUserInfo(userInfo);

        if (returnData.userRole === 1) {
          navigate(routes.dashboard.path);
        } else {
          navigate(routes.userDashboard.path);
        }
      } else {
        toast({
          title: t.auth?.registrationFailed || 'Registration Failed',
          description: returnMessage || (t.auth?.tryAgainMessage || 'Please try again.'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t.auth?.registrationFailed || 'Registration Failed',
        description: t.auth?.somethingWentWrong || 'Something went wrong. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            </div>
          </div>
        </div>

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
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t.auth?.uniqueIdentifier || 'This will be your unique identifier'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t.auth?.createPassword || 'Create Password'}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t.auth?.enterPassword || 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
              />
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
            </div>
          </div>

          {password.length > 0 && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {getStrengthLabel()}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>{t.common?.confirmPassword || 'Confirm Password'}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t.common?.confirmPassword || 'Confirm Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">{t.auth?.passwordsDoNotMatch || 'Passwords do not match'}</p>
            )}
          </div>
        </div>

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
            <>
              {t.auth?.continueBtn || 'Continue'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
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
