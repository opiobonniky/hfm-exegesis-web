/**
 * AuthAccountLink — "I already have an account" / "Sign in instead" button.
 * Replaces raw <button className="..."> in pages.
 */

import { Link } from "react-router-dom";

interface AuthAccountLinkProps {
  to?: string;
  onClick?: () => void;
  label: string;
}

export function AuthAccountLink({ to, onClick, label }: AuthAccountLinkProps) {
  const className = "font-semibold text-primary hover:text-primary/80 transition-colors";

  if (to) {
    return <Link to={to} className={className}>{label}</Link>;
  }

  return <button type="button" onClick={onClick} className={className}>{label}</button>;
}
