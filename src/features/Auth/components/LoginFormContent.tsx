import { Lock, Mail } from "lucide-react";
import { AuthFooter } from "./AuthFooter";
import { AuthForgotPasswordLink } from "./AuthForgotPasswordLink";
import { AuthFormHeader } from "./AuthFormHeader";
import { AuthFormWrapper } from "./AuthFormWrapper";
import { AuthLanguagePicker } from "./AuthLanguagePicker";
import { AuthLoadingButton } from "./AuthLoadingButton";
import { AuthLogo } from "./AuthLogo";
import FloatingInput from "./FloatingInput";
import type { LoginPageModel } from "../hooks/useLoginPage";

interface LoginFormContentProps {
  p: LoginPageModel;
  logoSrc: string;
}

export function LoginFormContent({ p, logoSrc }: LoginFormContentProps) {
  return (
    <AuthFormWrapper>
      <AuthLogo src={logoSrc} linkTo="/" />
      <AuthFormHeader title={p.title} subtitle={p.subtitle} />
      <AuthLanguagePicker
        currentLang={p.currentLang}
        langLoading={p.langLoading}
        onLanguageChange={p.setLanguage}
        labels={p.languageLabels}
      />

      <form
        onSubmit={p.handleLogin}
        className="space-y-4 anim-fade"
        style={{ animationDelay: "0.2s" }}
      >
        <FloatingInput
          id="email"
          label={p.emailLabel}
          icon={Mail}
          value={p.email}
          onChange={p.handleEmailChange}
          focused={p.emailFocused}
          setFocused={p.handleEmailFocus}
          handleBlur={p.handleEmailBlur}
          error=""
          touched={false}
          type="text"
          autoComplete="username"
        />
        <FloatingInput
          id="password"
          label={p.passwordLabel}
          icon={Lock}
          value={p.password}
          onChange={p.handlePasswordChange}
          focused={p.passwordFocused}
          setFocused={p.handlePasswordFocus}
          handleBlur={p.handlePasswordBlur}
          error=""
          touched={false}
          type={p.showPassword ? "text" : "password"}
          autoComplete="current-password"
          isPassword
          showPassword={p.showPassword}
          setShowPassword={p.setShowPassword}
        />
        <AuthForgotPasswordLink label={p.forgotPasswordLabel} />
        <AuthLoadingButton loading={p.isLoading}>
          {p.signInLabel}
        </AuthLoadingButton>
      </form>

      <AuthFooter
        termsLabel={p.termsLabel}
        termsLinkLabel={p.termsLinkLabel}
        privacyLabel={p.privacyLabel}
        privacyLinkLabel={p.privacyLinkLabel}
        additionalNote={p.additionalNote}
      />
    </AuthFormWrapper>
  );
}
