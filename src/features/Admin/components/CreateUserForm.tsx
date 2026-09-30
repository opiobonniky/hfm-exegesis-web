// CreateUserForm — full create-user form with account, personal, role sections.
// No password field: the backend auto-generates a temporary password and emails
// it to the user (queued via the Message table).
import {
  User, Mail, KeyRound, Info, Phone, Calendar, Shield, Save, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tt } from '@/components/languages/hardcodedTranslate';

// ─── Shared helpers ─────────────────────────────────────────────────────────

function FormField({
  icon, label, error, required, children,
}: {
  icon?: React.ReactNode; label: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function RoleOption({
  value, icon, title, description, selected,
}: {
  value: string; icon: React.ReactNode; title: string; description: string; selected: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30"
      }`}
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={selected ? "text-primary" : "text-muted-foreground"}>{icon}</span>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </label>
  );
}

// ─── Form Props ─────────────────────────────────────────────────────────────

interface CreateUserFormProps {
  form: {
    username: string; email: string;
    firstName: string; lastName: string;
    phoneNumber: string; gender: string; dateOfBirth: string;
    userRole: number;
  };
  errors: Record<string, string>;
  saving: boolean;
  updateField: (field: string, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateUserForm({
  form, errors, saving, updateField, onSubmit, onCancel,
}: CreateUserFormProps) {
  return (
    <>
      {/* Account Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{tt("Account Details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField icon={<User className="w-4 h-4" />} label={tt("Username")} error={errors.username} required>
            <Input placeholder={tt("e.g. johndoe123")} value={form.username} onChange={(e) => updateField("username", e.target.value)} className="h-9 text-sm" />
          </FormField>
          <FormField icon={<Mail className="w-4 h-4" />} label={tt("Email")} error={errors.email} required>
            <Input type="email" placeholder={tt("user@example.com")} value={form.email} onChange={(e) => updateField("email", e.target.value)} className="h-9 text-sm" />
          </FormField>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <KeyRound className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tt("A secure temporary password is")}<span className="font-medium text-foreground">{tt("auto-generated and emailed")}</span>{tt("to this address. The user will be prompted to change it after signing in.")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{tt("Personal Information")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label={tt("First Name")} error={errors.firstName} required>
              <Input placeholder={tt("First name")} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} className="h-9 text-sm" />
            </FormField>
            <FormField label={tt("Last Name")}>
              <Input placeholder={tt("Last name")} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} className="h-9 text-sm" />
            </FormField>
          </div>
          <FormField icon={<Phone className="w-4 h-4" />} label={tt("Phone Number")}>
            <Input type="tel" placeholder="+1 (555) 123-4567" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} className="h-9 text-sm" />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label={tt("Gender")}>
              <Select value={form.gender} onValueChange={(v) => updateField("gender", v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not specified">{tt("Not specified")}</SelectItem>
                  <SelectItem value="Male">{tt("Male")}</SelectItem>
                  <SelectItem value="Female">{tt("Female")}</SelectItem>
                  <SelectItem value="Other">{tt("Other")}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField icon={<Calendar className="w-4 h-4" />} label={tt("Date of Birth")}>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} className="h-9 text-sm" />
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{tt("Role Assignment")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={String(form.userRole)} onValueChange={(v) => updateField("userRole", Number(v))} className="space-y-3">
            <RoleOption value="2" icon={<User className="w-5 h-5" />} title={tt("Regular User")} description={tt("Can read the Bible, journal, take trivia, and access standard features")} selected={form.userRole === 2} />
            <RoleOption value="1" icon={<Shield className="w-5 h-5" />} title={tt("Administrator")} description={tt("Full access to admin dashboard, content management, and user administration")} selected={form.userRole === 1} />
          </RadioGroup>
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 border">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{tt("The assigned role is included in the welcome email so the user knows their access level.")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={saving}>{tt("Cancel")}</Button>
        <Button onClick={onSubmit} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? tt("Creating...") : tt("Create User")}
        </Button>
      </div>
    </>
  );
}
