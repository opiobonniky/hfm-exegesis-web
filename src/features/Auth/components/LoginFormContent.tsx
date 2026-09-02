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

type LoginFormContentProps = Pick<
  LoginPageModel,
  | "currentLang"
  | "langLoading"
  | "setLanguage"
  | "languageLabels"
  | "title"
  | "subtitle"
  | "email"
  | "emailLabel"
  | "emailFocused"
  | "handleEmailChange"
  | "handleEmailFocus"
  | "handleEmailBlur"
  | "password"
  | "passwordLabel"
  | "passwordFocused"
  | "handlePasswordChange"
  | "handlePasswordFocus"
  | "handlePasswordBlur"
  | "showPassword"
  | "setShowPassword"
  | "handleLogin"
  | "forgotPasswordLabel"
  | "isLoading"
  | "signInLabel"
  | "termsLabel"
  | "termsLinkLabel"
  | "privacyLabel"
  | "privacyLinkLabel"
  | "additionalNote"
> & {
  logoSrc: string;
};

export function LoginFormContent(props: LoginFormContentProps) {
  return (
    <AuthFormWrapper>
      <AuthLogo src={props.logoSrc} linkTo="/" />
      <AuthFormHeader title={props.title} subtitle={props.subtitle} />
      <AuthLanguagePicker
        currentLang={props.currentLang}
        langLoading={props.langLoading}
        onLanguageChange={props.setLanguage}
        labels={props.languageLabels}
      />

      <form
        onSubmit={props.handleLogin}
        className="space-y-4 anim-fade"
        style={{ animationDelay: "0.2s" }}
      >
        <FloatingInput
          id="email"
          label={props.emailLabel}
          icon={Mail}
          value={props.email}
          onChange={props.handleEmailChange}
          focused={props.emailFocused}
          setFocused={props.handleEmailFocus}
          handleBlur={props.handleEmailBlur}
          error=""
          touched={false}
          type="text"
          autoComplete="username"
        />
        <FloatingInput
          id="password"
          label={props.passwordLabel}
          icon={Lock}
          value={props.password}
          onChange={props.handlePasswordChange}
          focused={props.passwordFocused}
          setFocused={props.handlePasswordFocus}
          handleBlur={props.handlePasswordBlur}
          error=""
          touched={false}
          type={props.showPassword ? "text" : "password"}
          autoComplete="current-password"
          isPassword
          showPassword={props.showPassword}
          setShowPassword={props.setShowPassword}
        />
        <AuthForgotPasswordLink label={props.forgotPasswordLabel} />
        <AuthLoadingButton loading={props.isLoading}>
          {props.signInLabel}
        </AuthLoadingButton>
      </form>

      <AuthFooter
        termsLabel={props.termsLabel}
        termsLinkLabel={props.termsLinkLabel}
        privacyLabel={props.privacyLabel}
        privacyLinkLabel={props.privacyLinkLabel}
        additionalNote={props.additionalNote}
      />
    </AuthFormWrapper>
  );
}
