import { ChevronDown } from "lucide-react";
import { tt } from "@/components/languages/hardcodedTranslate";
import type { NavMenuItemProps } from "../types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function NavMenuItem({ item, scrolled, onMenuClick, active }: NavMenuItemProps) {
  const sizeClass = scrolled ? "text-[10px] 2xl:text-xs" : "text-xs 2xl:text-sm";
  const idleColor = scrolled ? "text-muted-foreground hover:text-primary" : "text-white/90 hover:text-white";
  const activeColor = scrolled ? "text-primary" : "text-white";

  if (item.subItems) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-current={active ? "true" : undefined}
          className={`px-2 2xl:px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider 2xl:tracking-widest active:scale-95 nav-menu-item flex items-center gap-1 ${sizeClass} ${
            active ? `${activeColor} bg-brand-primary/10` : `${idleColor} hover:bg-brand-bg`
          }`}
        >
          {item.label}
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
        </DropdownMenuTrigger>
          <DropdownMenuContent align="center" sideOffset={8} className="min-w-[180px] rounded-2xl py-2">
            {item.subItems.map((sub) => (
              <DropdownMenuItem
                key={sub.href}
                onSelect={() => onMenuClick(sub.href)}
                className="cursor-pointer px-5 py-2.5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground focus:text-primary"
              >
                {sub.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onMenuClick(item.href)}
      aria-current={active ? "true" : undefined}
      className={`relative px-2 2xl:px-3 py-2 font-black rounded-xl transition-all whitespace-nowrap uppercase tracking-wider 2xl:tracking-widest active:scale-95 nav-menu-item after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:transition-colors ${sizeClass} ${
        active ? `${activeColor} after:bg-brand-accent` : `${idleColor} after:bg-transparent`
      }`}
    >
      {item.label || tt("Home")}
    </button>
  );
}
