// Login — thin compositor using a page hook and focused render components
import logoImage from "@/assets/logos/exegesis_bg_rm.png";
import { useLoginPage } from "../hooks/useLoginPage";
import { LoginBrandedPanel, LoginFormContent } from "../components";

export default function Login() {
  const p = useLoginPage();

  return (
    <div className="min-h-screen flex bg-background overflow-hidden" dir={p.isRtl ? "rtl" : "ltr"}>
      <LoginBrandedPanel
        isRtl={p.isRtl}
        taglineStart={p.taglineStart}
        taglineEnd={p.taglineEnd}
        wordLabel={p.wordLabel}
        quote={p.quote}
        attribution={p.attribution}
      />
      <LoginFormContent
        logoSrc={logoImage}
        currentLang={p.currentLang}
        langLoading={p.langLoading}
        setLanguage={p.setLanguage}
        languageLabels={p.languageLabels}
        title={p.title}
        subtitle={p.subtitle}
        email={p.email}
        emailLabel={p.emailLabel}
        emailFocused={p.emailFocused}
        handleEmailChange={p.handleEmailChange}
        handleEmailFocus={p.handleEmailFocus}
        handleEmailBlur={p.handleEmailBlur}
        password={p.password}
        passwordLabel={p.passwordLabel}
        passwordFocused={p.passwordFocused}
        handlePasswordChange={p.handlePasswordChange}
        handlePasswordFocus={p.handlePasswordFocus}
        handlePasswordBlur={p.handlePasswordBlur}
        showPassword={p.showPassword}
        setShowPassword={p.setShowPassword}
        handleLogin={p.handleLogin}
        forgotPasswordLabel={p.forgotPasswordLabel}
        isLoading={p.isLoading}
        signInLabel={p.signInLabel}
        termsLabel={p.termsLabel}
        termsLinkLabel={p.termsLinkLabel}
        privacyLabel={p.privacyLabel}
        privacyLinkLabel={p.privacyLinkLabel}
        additionalNote={p.additionalNote}
      />
    </div>
  );
}
