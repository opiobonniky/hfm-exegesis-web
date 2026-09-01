/**
 * AuthLanguagePicker — language selector pill used in Login page.
 */
import { Globe, Check } from "lucide-react";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  currentLang: string;
  langLoading: boolean;
  onLanguageChange: (lang: Language) => void;
  labels: {
    primary?: string;
    european?: string;
    indian?: string;
    other?: string;
  };
}

const LANGUAGE_GROUPS = [
  { key: "primary", languages: ["en"] as Language[] },
  { key: "european", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
  { key: "indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
  { key: "other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
];

export function AuthLanguagePicker({
  currentLang,
  langLoading,
  onLanguageChange,
  labels,
}: Props) {
  return (
    <div className="flex justify-center anim-fade" style={{ animationDelay: "0.15s" }}>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border/50">
        <Globe className="w-3.5 h-3.5 text-muted-foreground/70" />
        <Select
          value={currentLang}
          onValueChange={(v) => onLanguageChange(v as Language)}
          disabled={langLoading}
        >
          <SelectTrigger className="h-7 text-xs border-0 bg-transparent shadow-none p-0 gap-1 text-muted-foreground hover:text-foreground/80 focus:ring-0 [&>svg]:hidden">
            <SelectValue>
              <span>{LANGUAGE_NAMES[currentLang as Language]}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-[140px]">
            {LANGUAGE_GROUPS.map((group) => (
              <SelectGroup key={group.key}>
                <SelectLabel className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/50">
                  {labels[group.key as keyof typeof labels] || group.key}
                </SelectLabel>
                {group.languages.map((code) => (
                  <SelectItem key={code} value={code} className="py-1.5 text-xs">
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span>{LANGUAGE_NAMES[code]}</span>
                        {code !== "en" && (
                          <span className="text-muted-foreground/60 text-[10px]">
                            ({getLanguageName(code, "en")})
                          </span>
                        )}
                      </div>
                      {code === currentLang && (
                        <Check className="w-3 h-3 text-primary shrink-0" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
