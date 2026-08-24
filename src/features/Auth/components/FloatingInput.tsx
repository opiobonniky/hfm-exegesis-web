"use client";

import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  isPassword?: boolean;
  showPassword?: boolean;
  setShowPassword?: (v: boolean) => void;
}
export default function FloatingInput({
  id, label, icon: Icon, value, onChange, focused, setFocused,
  handleBlur, error, touched, type = "text", autoComplete = "off",
  isPassword, showPassword, setShowPassword,
}: FloatingInputProps) {
  return (
    <div className="space-y-1 w-full text-left">
      <div className="flex group h-14 relative">
        <div
          className={`w-12 flex items-center justify-center bg-card border border-r-0 rounded-l-2xl transition-all duration-300 shadow-sm ${
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
            type={type}
            name={id}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(id)}
            onBlur={handleBlur}
            autoComplete={autoComplete}
            className={`w-full h-full px-4 pt-4 bg-card border rounded-r-2xl focus:outline-none transition-all duration-300 text-[15px] font-medium shadow-sm ${
                ? "border-red-500 ring-4 ring-red-500/5"
                  ? "border-primary ring-4 ring-primary/5"
                  : "border-border"
          <label
            htmlFor={id}
            className={`absolute left-4 transition-all duration-300 pointer-events-none font-bold ${
              focused || value
                ? `top-2 text-[10px] uppercase tracking-widest ${error && touched ? "text-red-500" : "text-primary"}`
                : "top-4 text-[15px] text-muted-foreground/70"
          >
            {label}
          </label>
          {isPassword && setShowPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-muted-foreground transition-colors p-1.5"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
      </div>
      <AnimatePresence>
        {error && touched && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-[10px] font-black text-red-500 uppercase tracking-widest pl-1"
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
