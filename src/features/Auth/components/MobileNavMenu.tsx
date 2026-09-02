import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "./LanguageSelector";
import { MenuItem } from "../types";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { hexToRgba } from "../utils"; // Assuming this helper is moved to utils

interface MobileNavMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  menuPanelRef: React.RefObject<HTMLDivElement | null>;
  expandedMobileSection: string | null;
  setExpandedMobileSection: (v: string | null) => void;
  menuItems: MenuItem[];
  onMenuClick: (href?: string) => void;
  t: any;
  currentLang: string;
  setLanguage: (lang: Language) => void;
  langLoading: boolean;
}

export function MobileNavMenu({
  mobileMenuOpen, setMobileMenuOpen, menuPanelRef, expandedMobileSection, setExpandedMobileSection, menuItems, onMenuClick, t, currentLang, setLanguage, langLoading
}: MobileNavMenuProps) {
  if (!mobileMenuOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px] overflow-hidden">
      <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} ref={menuPanelRef} className="absolute top-0 left-0 bottom-0 w-[82%] max-w-xs bg-card shadow-2xl flex flex-col h-full">
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-primary rounded-full" />
            <span className="font-black text-brand-primary uppercase tracking-widest text-sm">{t.landing?.menu || "Menu"}</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          <div className="grid gap-1.5">
            {menuItems.map((item) =>
              item.subItems ? (
                <div key={item.label}>
                  <button onClick={() => setExpandedMobileSection(expandedMobileSection === item.label ? null : item.label)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(item.mobileColor || "#396284", 0.15), color: item.mobileColor || "#396284" }}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-foreground uppercase tracking-widest">{item.label}</div>
                      {item.description && <div className="text-[11px] font-medium text-muted-foreground truncate">{item.description}</div>}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedMobileSection === item.label ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${expandedMobileSection === item.label ? "max-h-80 opacity-100 mt-1" : "max-h-0 opacity-0"}`}>
                    <div className="pl-14 pr-3 space-y-0.5 pb-1">
                      {item.subItems.map((sub) => (
                        <button key={sub.label} onClick={() => onMenuClick(sub.href)} className="w-full text-left px-4 py-2.5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-primary hover:bg-muted transition-colors uppercase tracking-wider">
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <button key={item.label} onClick={() => onMenuClick(item.href)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hexToRgba(item.mobileColor || "#396284", 0.15), color: item.mobileColor || "#396284" }}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black text-foreground uppercase tracking-widest">{item.label}</div>
                    {item.description && <div className="text-[11px] font-medium text-muted-foreground truncate">{item.description}</div>}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              )
            )}

            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl hover:bg-brand-bg transition-all group text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-brand-primary/15 text-brand-primary"><ArrowRight className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-foreground uppercase tracking-widest">{t.landing?.signIn || "Sign In"}</div>
                <div className="text-[11px] font-medium text-muted-foreground truncate">{t.landing?.signInDesc || "Access your account"}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border">
            <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <LanguageSelector value={currentLang} onChange={(v) => setLanguage(v as Language)} disabled={langLoading}
              className="h-6 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground focus:ring-0 [&>svg]:hidden flex-1" />
          </div>
        </div>

        <div className="p-5 border-t border-border space-y-3 bg-muted/50">
          <Link to="/login" className="block" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-brand-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-brand-primary/20 text-base uppercase tracking-widest">
              {t.landing?.getStartedBtn || "Get Started"}
            </Button>
          </Link>
        </div>
      </motion.div>
      <div className="absolute inset-0 -z-10" onClick={() => setMobileMenuOpen(false)} />
    </div>
  );
}
