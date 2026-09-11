// ForceChangePassword — interlock screen for users still signing in with the
// admin-issued temporary password. Shown by the ProtectedRoute guard before
// any other protected page is reachable.
import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { useForceChangePasswordPage } from "../hooks/useForceChangePasswordPage";
import FloatingInput from "../components/FloatingInput";
import {
  AuthAnimatedEntrance,
  AuthFormCard,
  AuthBrandedPanelDesktop,
  ForgotPasswordContentWrapper,
} from "../components";
import { AuthLogoImage } from "../components/AuthLogoImage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import logoImage from "@/assets/logos/exegesis_bg_rm.webp";

export default function ForceChangePassword() {
  const { data, actions } = useForceChangePasswordPage();
  const [showCurrent, setShowCurrent] = useState(false);

  return (
    <div className="min-h-screen flex bg-muted overflow-hidden relative">
      <AuthAnimatedEntrance />

      <ForgotPasswordContentWrapper>
        <AuthFormCard>
          <div className="space-y-6">
            <div className="flex justify-center">
              <AuthLogoImage src={logoImage} size="md" />
            </div>

            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Set a New Password</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account was created with a temporary password. For your
                security, please create your own password before continuing.
              </p>
            </div>

            <form onSubmit={actions.handleSubmit} className="space-y-5" noValidate>
              {/* Temporary password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-medium">
                  Temporary Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={data.currentPassword}
                    onChange={(e) => actions.setCurrentPassword(e.target.value)}
                    onFocus={() => actions.setFocusedField("currentPassword")}
                    onBlur={() => actions.handleBlur("currentPassword")}
                    autoComplete="current-password"
                    placeholder="From your welcome email"
                    className="w-full h-11 pl-9 pr-10 rounded-lg border bg-background text-sm outline-none transition-colors focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {data.touchedFields.currentPassword && actions.getFieldError("currentPassword") && (
                  <p className="text-xs text-destructive">{actions.getFieldError("currentPassword")}</p>
                )}
              </div>

              {/* New password */}
              <FloatingInput
                id="newPassword"
                label="New Password"
                icon={Lock}
                type={data.showPassword ? "text" : "password"}
                value={data.newPassword}
                onChange={(e) => actions.setNewPassword(e.target.value)}
                focused={data.focusedField === "newPassword"}
                setFocused={actions.setFocusedField}
                handleBlur={() => actions.handleBlur("newPassword")}
                error={actions.getFieldError("newPassword")}
                touched={!!data.touchedFields.newPassword}
                isPassword
                showPassword={data.showPassword}
                setShowPassword={actions.setShowPassword}
                autoComplete="new-password"
              />

              {/* Confirm password */}
              <FloatingInput
                id="confirmPassword"
                label="Confirm Password"
                icon={Lock}
                type={data.showPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => actions.setConfirmPassword(e.target.value)}
                focused={data.focusedField === "confirmPassword"}
                setFocused={actions.setFocusedField}
                handleBlur={() => actions.handleBlur("confirmPassword")}
                error={actions.getFieldError("confirmPassword")}
                touched={!!data.touchedFields.confirmPassword}
                autoComplete="new-password"
              />

              <Button type="submit" disabled={data.isLoading} className="w-full h-11 gap-2">
                {data.isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password & Continue"
                )}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              Tip: use at least 8 characters with uppercase, lowercase, a number,
              and a special character.
            </p>
          </div>
        </AuthFormCard>
      </ForgotPasswordContentWrapper>

      <AuthBrandedPanelDesktop
        logoSrc={logoImage}
        heading="Make it yours."
        quote="Your word is a lamp for my feet, a light on my path."
        attribution="Psalm 119:105"
      />
    </div>
  );
}
