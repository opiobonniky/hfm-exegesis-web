import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  
  const getBrowser = () => {
    if (ua.includes("Firefox/")) return "Firefox";
    if (ua.includes("Edg/")) return "Edge";
    if (ua.includes("Chrome/")) return "Chrome";
    if (ua.includes("Safari/") && !ua.includes("Chrome/")) return "Safari";
    if (ua.includes("OPR/") || ua.includes("Opera/")) return "Opera";
    return "Unknown";
  };

  const getOS = () => {
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Mac OS")) return "macOS";
    if (ua.includes("Linux")) return "Linux";
    if (ua.includes("Android")) return "Android";
    if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
    return "Unknown";
  };

  const getDeviceType = () => {
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "TABLET";
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "MOBILE";
    return "DESKTOP";
  };

  const getDeviceName = () => {
    if (ua.includes("iPhone")) return "iPhone";
    if (ua.includes("iPad")) return "iPad";
    if (ua.includes("Android")) {
      const match = ua.match(/Android\s([^;]+)/);
      return match ? match[1].trim() : "Android Device";
    }
    if (ua.includes("Windows")) return "Windows PC";
    if (ua.includes("Mac")) return "Mac";
    return "Desktop";
  };

  const getEngine = () => {
    if (ua.includes("Gecko/")) return "Gecko";
    if (ua.includes("WebKit/")) return "WebKit";
    if (ua.includes("Presto/")) return "Presto";
    if (ua.includes("Trident/")) return "Trident";
    return "Unknown";
  };

  const getLocale = () => {
    return navigator.language || "en-US";
  };

  return {
    userAgent: ua,
    browserName: getBrowser(),
    os: getOS(),
    deviceType: getDeviceType(),
    deviceName: getDeviceName(),
    engine: getEngine(),
    locale: getLocale(),
    ip: "", // Will be captured on server-side
  };
};

export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip || "";
  } catch {
    return "";
  }
};