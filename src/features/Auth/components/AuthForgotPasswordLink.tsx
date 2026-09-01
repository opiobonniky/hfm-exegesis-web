/**
 * AuthForgotPasswordLink — "Forgot password?" link for Auth form pages.
 */
import { Link } from "react-router-dom";

interface Props {
  label: string;
}

export function AuthForgotPasswordLink({ label }: Props) {
  return (
    <div className="flex justify-end">
      <Link to="/forgot-password" className="text-sm text-primary hover:underline font-medium">
        {label}
      </Link>
    </div>
  );
}
