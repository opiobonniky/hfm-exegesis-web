import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/languages/languageProvider";

interface PasswordTabProps {
  saving: boolean;
  onSave: (current: string, newPass: string) => void;
}
function getStrength(pw: string) {
  if (!pw) return { level: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  return { level: s, label: labels[s], color: colors[s] };
}

export function PasswordTab({ saving, onSave }: PasswordTabProps) {
  const { t } = useLanguage();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const strength = getStrength(newPass);
  const handleSubmit = () => {
    if (!current || !newPass || !confirm) return;
    if (newPass !== confirm) return;
    onSave(current, newPass);
    setCurrent(""); setNewPass(""); setConfirm("");
  };
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <Lock className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold">{t.settings?.changePassword}</h3>
          <p className="text-xs text-muted-foreground">{t.settings?.changePasswordDesc}</p>
      </div>
      </div>
      <div className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label>{t.settings?.currentPasswordLabel}</Label>
          <div className="relative">
            <Input type={show.current ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} />
            <button type="button" onClick={() => setShow(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2 relative">
          <Label>{t.settings?.newPasswordLabel}</Label>
          <div className="relative">
            <Input type={show.new ? "text" : "password"} value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <button type="button" onClick={() => setShow(s => ({ ...s, new: !s.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {newPass && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${(strength.level / 4) * 100}%` }} />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">{strength.label}</span>
            </div>
          )}
        </div>
        <div className="space-y-2 relative">
          <Label>{t.settings?.confirmPasswordLabel}</Label>
          <div className="relative">
            <Input type={show.confirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirm && newPass !== confirm && <p className="text-xs text-destructive">Passwords don't match</p>}
        </div>
        <Button onClick={handleSubmit} disabled={saving || !current || !newPass || newPass !== confirm} className="bg-primary hover:bg-primary/90">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {saving ? "Updating..." : t.settings?.updatePassword || "Update Password"}
        </Button>
      </div>
    </div>
  );
}
