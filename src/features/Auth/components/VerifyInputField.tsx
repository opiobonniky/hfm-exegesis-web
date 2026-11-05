import { LucideIcon } from "lucide-react";

interface VerifyInputFieldProps {
  id: string;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  isCode?: boolean;
  required?: boolean;
}

export function VerifyInputField({ id, label, icon: Icon, placeholder, value, onChange, readOnly, isCode, required }: VerifyInputFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative group">
        <Icon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          id={id}
          type={isCode ? "text" : "email"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          autoComplete={isCode ? "one-time-code" : "email"}
          inputMode={isCode ? "numeric" : "email"}
          className="w-full ps-10 pe-3 h-12 border rounded-xl bg-background text-sm outline-none focus:ring-2 focus:ring-primary read-only:bg-muted/40"
          required={required}
          {...(isCode ? { maxLength: 6, pattern: "[0-9]{6}", dir: "ltr", className: "w-full px-10 h-16 border rounded-xl bg-background text-center text-2xl font-semibold tracking-[0.35em] outline-none focus:ring-2 focus:ring-primary" } : {})}
        />
      </div>
    </div>
  );
}
