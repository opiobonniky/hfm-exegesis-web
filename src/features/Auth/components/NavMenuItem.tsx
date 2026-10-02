import { ChevronDown } from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { NavMenuItemProps } from "../types";

export function NavMenuItem({ item, scrolled, onMenuClick, active }: NavMenuItemProps) {
  const sizeClass = scrolled ? "text-[10px]" : "text-xs sm:text-sm";
  const idleColor = scrolled ? "text-muted-foreground hover:text-primary" : "text-white/90 hover:text-white";
  const activeColor = scrolled ? "text-primary" : "text-white";

  if (item.subItems) {
    return (
      <div className="relative group">
        <button
          type="button"
          aria-current={active ? "true" : undefined}
          className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item flex items-center gap-1 ${sizeClass} ${
            active ? `${activeColor} bg-brand-primary/10` : `${idleColor} hover:bg-brand-bg`
          }`}
        >
          {item.label}
          <ChevronDown className="w-2.5 h-2.5 transition-transform group-hover:rotate-180" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-card rounded-2xl shadow-2xl border border-border py-2 min-w-[180px] overflow-hidden">
            {item.subItems.map((sub) => (
              <button
                key={sub.href}
                type="button"
                onClick={() => onMenuClick(sub.href)}
                className="w-full text-left px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onMenuClick(item.href)}
      aria-current={active ? "true" : undefined}
      className={`relative px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors ${sizeClass} ${
        active ? `${activeColor} after:bg-brand-accent` : `${idleColor} after:bg-transparent`
      }`}
    >
      {item.label || tt("Home")}
    </button>
  );
}