/**
 * AuthSkipButton — skip navigation button for Onboarding.
 * Replaces raw <button className="..."> in pages.
 */

interface AuthSkipButtonProps {
  onClick: () => void;
  label?: string;
}

export function AuthSkipButton({ onClick, label = "Skip" }: AuthSkipButtonProps) {
  return (
    <button onClick={onClick} className="text-sm font-semibold text-white/40 hover:text-white/70 transition-colors">
      {label}
    </button>
  );
}
