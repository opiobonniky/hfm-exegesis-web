import { Select, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGE_NAMES, type Language } from "@/components/languages/type";
import { getLanguageName } from "@/components/languages/localeUtils";
import { Check } from "lucide-react";

interface LanguageSelectorProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  className?: string;
}

export function LanguageSelector({ value, onChange, disabled, className }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue><span className="font-bold">{LANGUAGE_NAMES[value as Language]}</span></SelectValue>
      </SelectTrigger>
      <SelectContent className="min-w-[140px]">
        {[
          { label: "Primary", languages: ["en"] as Language[] },
          { label: "European", languages: ["de", "fr", "es", "pt", "it", "el", "ru"] as Language[] },
          { label: "Indian", languages: ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur"] as Language[] },
          { label: "Other", languages: ["ar", "sw", "ne", "fil"] as Language[] },
        ].map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/50">{group.label}</SelectLabel>
            {group.languages.map((code) => (
              <SelectItem key={code} value={code} className="py-1 text-[11px]">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    <span>{LANGUAGE_NAMES[code]}</span>
                    {code !== "en" && <span className="text-muted-foreground/60 text-[9px]">({getLanguageName(code, "en")})</span>}
                  </div>
                  {code === value && <Check className="w-2.5 h-2.5 text-primary shrink-0" />}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
