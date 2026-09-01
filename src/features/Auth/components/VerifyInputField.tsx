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
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          id={id}
          type={isCode ? "text" : "email"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className="w-full pl-10 h-12 border rounded-lg bg-muted/30 focus:bg-background focus:border-primary text-sm"
          required={required}
          {...(isCode ? { maxLength: 6, className: "w-full pl-10 h-12 border rounded-lg bg-muted/30 focus:bg-background focus:border-primary text-center text-lg tracking-[0.5em]" } : {})}
        />
      </div>
    </div>
  );
}
