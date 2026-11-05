"use client";

import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FloatingInputProps {
  id: string;
  label: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  focused: boolean;
  setFocused: (id: string | null) => void;
  handleBlur: () => void;
  error: string;
  touched: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  isPassword?: boolean;
  showPassword?: boolean;
  setShowPassword?: (v: boolean) => void;
}

export default function FloatingInput({
  id, label, icon: Icon, value, onChange, focused, setFocused,
  handleBlur, error, touched, type = "text", autoComplete = "off", inputMode,
  isPassword, showPassword, setShowPassword,
}: FloatingInputProps) {
  return (
    <div className="space-y-1 w-full text-start">
      <div className="flex group h-14 relative">
        <div
          className={`w-12 flex items-center justify-center bg-card border border-e-0 rounded-s-2xl transition-all duration-300 shadow-sm ${
            error && touched
              ? "border-red-500 bg-red-50/10"
              : focused
                ? "border-primary"
                : "border-border"
          }`}
        >
          <Icon
            className={`w-[18px] h-[18px] transition-all duration-300 ${
              error && touched
                ? "text-red-500"
                : focused
                  ? "text-primary scale-110"
                  : "text-muted-foreground/70"
            }`}
          />
        </div>
        <div className="flex-1 relative">
          <input
            type={isPassword && showPassword ? "text" : type}
            name={id}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(id)}
            onBlur={handleBlur}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-invalid={!!(error && touched)}
            aria-describedby={error && touched ? `${id}-error` : undefined}
            className={`w-full h-full px-4 pt-4 ${isPassword ? "pe-12" : ""} bg-card border rounded-e-2xl focus:outline-none transition-all duration-300 text-[15px] font-medium shadow-sm ${
              error && touched
                ? "border-red-500 ring-4 ring-red-500/5"
                : focused
                  ? "border-primary ring-4 ring-primary/5"
                  : "border-border"
            }`}
          />
          <label
            htmlFor={id}
            className={`absolute start-4 transition-all duration-300 pointer-events-none font-bold ${
               focused || value || type === "date"
                ? `top-2 text-[10px] uppercase tracking-widest ${error && touched ? "text-red-500" : "text-primary"}`
                : "top-4 text-[15px] text-muted-foreground/70"
            }`}
          >
            {label}
          </label>
          {isPassword && setShowPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors p-1.5"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>
      <p id={`${id}-error`} role={error && touched ? "alert" : undefined} className={`min-h-4 text-xs text-destructive ps-1 transition-all ${error && touched ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
        {error && touched ? <span key={error}>{error}</span> : null}
      </p>
    </div>
  );
}
