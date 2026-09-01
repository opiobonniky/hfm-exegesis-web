import { AuthAccountLink } from "./AuthAccountLink";

interface VerifyFooterLinksProps {
  didNotReceiveLabel: string;
  resendLabel: string;
  sendingLabel: string;
  createNewLabel: string;
  isResending: boolean;
  onResend: () => void;
}

export function VerifyFooterLinks({ didNotReceiveLabel, resendLabel, sendingLabel, createNewLabel, isResending, onResend }: VerifyFooterLinksProps) {
  return (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        {didNotReceiveLabel}{" "}
        <button
          onClick={onResend}
          disabled={isResending}
          className="text-primary hover:underline font-medium disabled:opacity-50"
        >
          {isResending ? sendingLabel : resendLabel}
        </button>
      </p>
      <p className="text-sm">
        <AuthAccountLink to="/register" label={createNewLabel} />
      </p>
    </div>
  );
}
