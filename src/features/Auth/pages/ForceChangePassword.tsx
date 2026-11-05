// ForceChangePassword — interlock screen for users still signing in with the
// admin-issued temporary password. Shown by the ProtectedRoute guard before
// any other protected page is reachable.
import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { useForceChangePasswordPage } from "../hooks/useForceChangePasswordPage";
import FloatingInput from "../components/FloatingInput";
import { AuthPageLayout } from "../components/AuthPageLayout";
import { RegistrationPasswordChecklist } from "../components/RegistrationPasswordChecklist";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { tt } from '@/components/languages/hardcodedTranslate';
import { StableLoadingContent } from "@/components/ui/StableLoadingContent";

export default function ForceChangePassword() {
  const { data, actions } = useForceChangePasswordPage();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <AuthPageLayout backToLogin={false} eyebrow="Account security" title={tt("Make your account yours")} description={tt("Replace your temporary password with one only you know before continuing.")} asideTitle="A fresh start. A secure account.">
          <div className="space-y-6">
            <div className="flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground"><ShieldAlert className="size-5 shrink-0 text-primary" /><p>{tt("You can find your temporary password in your welcome email.")}</p></div>

            <form onSubmit={actions.handleSubmit} className="space-y-5" noValidate>
              <fieldset disabled={data.isLoading} className="space-y-5">
              {/* Temporary password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-medium">{tt("Temporary Password")}</Label>
                <div className="relative">
                   <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={data.currentPassword}
                    onChange={(e) => actions.setCurrentPassword(e.target.value)}
                    onFocus={() => actions.setFocusedField("currentPassword")}
                    onBlur={() => actions.handleBlur("currentPassword")}
                    autoComplete="current-password"
                    placeholder={tt("From your welcome email")}
                    className="w-full h-12 ps-9 pe-12 rounded-xl border bg-background text-sm outline-none transition-colors focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute end-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"
                    aria-label={tt(showCurrent ? "Hide temporary password" : "Show temporary password")}
                    aria-pressed={showCurrent}
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
                label={tt("New Password")}
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

              <RegistrationPasswordChecklist password={data.newPassword} />
              {/* Confirm password */}
              <FloatingInput
                id="confirmPassword"
                label={tt("Confirm Password")}
                icon={Lock}
                type="password"
                isPassword
                showPassword={showConfirm}
                setShowPassword={setShowConfirm}
                value={data.confirmPassword}
                onChange={(e) => actions.setConfirmPassword(e.target.value)}
                focused={data.focusedField === "confirmPassword"}
                setFocused={actions.setFocusedField}
                handleBlur={() => actions.handleBlur("confirmPassword")}
                error={actions.getFieldError("confirmPassword")}
                touched={!!data.touchedFields.confirmPassword}
                autoComplete="new-password"
              />
              </fieldset>

              <Button type="submit" disabled={data.isLoading} className="w-full h-12 gap-2 rounded-xl">
                <StableLoadingContent
                  loading={data.isLoading}
                  idle={tt("Update Password & Continue")}
                  pending={<><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>{tt("Updating...")}</span></>}
                />
              </Button>
            </form>

          </div>
    </AuthPageLayout>
  );
}
