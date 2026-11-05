import { useRef, useState } from "react";
import { Camera, Trash2, UserRound } from "lucide-react";
import { readProfilePhoto } from "../registration";
import { tt } from "@/components/languages/hardcodedTranslate";

export function RegistrationPhotoPicker({ value, onChange, disabled }: { value: string | null; onChange: (photo: string | null) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  return (
    <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5 text-center">
      <div className="mx-auto mb-3 flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
        {value ? <img src={value} alt={tt("Profile photo preview")} className="size-full object-cover" /> : <UserRound className="size-10 text-primary" />}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" aria-label={tt("Choose profile photo")} className="sr-only" disabled={disabled} onChange={async e => {
        const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
        try { setError(""); onChange(await readProfilePhoto(file)); } catch (err) { setError(err instanceof Error ? err.message : "Could not read image"); }
      }} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-primary/10"><Camera className="size-4" />{tt("Choose profile photo")}</button>
        {value && <button type="button" disabled={disabled} onClick={() => onChange(null)} className="inline-flex min-h-10 items-center gap-2 text-sm text-destructive"><Trash2 className="size-4" />{tt("Remove")}</button>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{tt("Optional · JPEG, PNG or WebP · Up to 5 MB")}</p>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{tt(error)}</p>}
    </section>
  );
}
