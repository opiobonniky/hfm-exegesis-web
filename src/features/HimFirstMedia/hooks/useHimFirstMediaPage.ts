// useHimFirstMediaPage — shared hook for HimFirstMedia pages
import { useLanguage } from "@/components/languages/languageProvider";

export function useHimFirstMediaPage() {
  const { t, isRtl } = useLanguage();
  return { t, isRtl };
}
