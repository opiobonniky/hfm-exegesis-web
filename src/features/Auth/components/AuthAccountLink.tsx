/**
 * AuthAccountLink — "I already have an account" / "Sign in instead" button.
 * Replaces raw <button className="..."> in pages.
 */

interface AuthAccountLinkProps {
  onClick: () => void;
  label: string;
}

export function AuthAccountLink({ onClick, label }: AuthAccountLinkProps) {
  return (
    <button onClick={onClick} className="w-full text-sm font-semibold text-white/50 hover:text-white/80 transition-colors py-2">
      {label}
    </button>
  );
}
