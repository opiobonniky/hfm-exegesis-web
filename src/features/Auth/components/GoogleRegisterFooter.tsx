/**
 * GoogleRegisterFooter — "Use different account" link for Google registration.
 */

interface GoogleRegisterFooterProps {
  label: string;
  onClick: () => void;
}

export function GoogleRegisterFooter({ label, onClick }: GoogleRegisterFooterProps) {
  return (
    <p className="text-center text-sm">
      <button onClick={onClick} className="text-muted-foreground hover:text-primary">
        {label}
      </button>
    </p>
  );
}
