import { useVerifyAccountPage } from "../hooks/useVerifyAccountPage";
import {
  AuthLoadingButton,
  VerifyBrandedPanel,
  VerifyFormPanel,
  VerifyInputField,
  VerifyFooterLinks,
} from "../components";
import { Mail, ArrowRight, KeyRound } from "lucide-react";

const VerifyAccount = () => {
  const p = useVerifyAccountPage();
  const { t, isRtl, email, setEmail, code, setCode, isLoading, isResending, handleVerify, handleResend } = p;

  return (
    <div className="min-h-screen flex" dir={isRtl ? "rtl" : "ltr"}>
      <VerifyBrandedPanel
        bibleLabel={t.common?.appName?.split(" ")[1] || "Bible"}
        lampQuote={t.auth?.lampToMyFeet || "Your word is a lamp for my feet, a light on my path."}
        psalmReference={t.auth?.psalmReference || "Psalm 119:105"}
        startJourneyLabel={t.auth?.startJourney || "Verify your email to start your spiritual journey"}
      />

      <VerifyFormPanel
        backToLoginLabel={t.auth?.backToLogin || "Back to login"}
        verifyEmailLabel={t.auth?.verifyAccount || "Verify Email"}
        enterCodeLabel={t.auth?.enterCode || "Enter the verification code sent to your email"}
        appName={t.common?.appName || "Exegesis Bible"}
      >
        <form onSubmit={handleVerify} className="space-y-4">
          <VerifyInputField
            id="email"
            label={t.common?.email || "Email Address"}
            icon={Mail}
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            readOnly
          />
          <VerifyInputField
            id="code"
            label={t.auth?.verification || "Verification Code"}
            icon={KeyRound}
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
            isCode
          />
          <AuthLoadingButton loading={isLoading} disabled={code.length < 6}>
            {t.auth?.verifyAccount || "Verify Account"}
            <ArrowRight className="w-4 h-4" />
          </AuthLoadingButton>
        </form>

        <VerifyFooterLinks
          didNotReceiveLabel={t.auth?.didNotReceiveCode || "Didn't receive the code?"}
          resendLabel={t.auth?.resendCode || "Resend code"}
          sendingLabel={t.auth?.sending || "Sending..."}
          createNewLabel={t.auth?.createNewAccount || "Create a new account"}
          isResending={isResending}
          onResend={handleResend}
        />
      </VerifyFormPanel>
    </div>
  );
};

export default VerifyAccount;
