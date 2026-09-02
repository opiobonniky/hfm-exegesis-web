import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "../types";

interface NavMenuItemProps {
  item: MenuItem;
  scrolled: boolean;
  onMenuClick: (href?: string) => void;
}

export function NavMenuItem({ item, scrolled, onMenuClick }: NavMenuItemProps) {
  return (
    item.subItems ? (
      <div className="relative group">
        <button className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item flex items-center gap-1 ${scrolled ? "text-[10px] text-muted-foreground hover:text-primary hover:bg-muted" : "text-xs sm:text-sm text-white/90"}`}>
          {item.label}<ChevronDown className="w-2.5 h-2.5 transition-transform group-hover:rotate-180" />
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-card rounded-2xl shadow-2xl border border-border py-2 min-w-[180px] overflow-hidden">
            {item.subItems.map((sub) => (
              <button key={sub.label} onClick={() => onMenuClick(sub.href)} className="w-full text-left px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground hover:text-primary hover:bg-muted transition-colors">
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <button key={item.label} onClick={() => onMenuClick(item.href)} className={`px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-widest active:scale-95 nav-menu-item ${scrolled ? "text-[10px] text-muted-foreground hover:text-primary hover:bg-muted" : "text-xs sm:text-sm text-white/90"}`}>
        {item.label}
      </button>
    )
  );
}
