/**
 * AuthFooter — terms and legal text at bottom of Auth pages.
 */
import { Link } from "react-router-dom";

interface Props {
  termsLabel: string;
  termsLinkLabel: string;
  privacyLabel: string;
  privacyLinkLabel: string;
  additionalNote?: string;
}

export function AuthFooter({
  termsLabel,
  termsLinkLabel,
  privacyLabel,
  privacyLinkLabel,
  additionalNote,
}: Props) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] text-center text-muted-foreground/70 leading-relaxed max-w-[300px] mx-auto">
        {termsLabel}{" "}
        <Link to="/terms" className="text-primary font-bold underline">
          {termsLinkLabel}
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-primary font-bold underline">
          {privacyLinkLabel}
        </Link>
      </p>
      {additionalNote && (
        <p className="text-[11px] text-center text-muted-foreground/70 font-medium">
          {additionalNote}
        </p>
      )}
    </div>
  );
}
