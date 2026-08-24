"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

interface RTLContextType {
  isRtl: boolean;
  dir: "ltr" | "rtl";
}

const RTLContext = createContext<RTLContextType>({ isRtl: false, dir: "ltr" });

export function useRTL() {
  return useContext(RTLContext);
}

export function RTLProvider({ children }: { children: ReactNode }) {
  const [isRtl, setIsRtl] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem("language") || navigator.language.slice(0, 2);
    const rtl = RTL_LANGUAGES.includes(lang);
    setIsRtl(rtl);
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, []);

  return (
    <RTLContext.Provider value={{ isRtl, dir: isRtl ? "rtl" : "ltr" }}>
      {children}
    </RTLContext.Provider>
  );
}
