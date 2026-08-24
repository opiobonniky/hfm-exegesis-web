import {
  LayoutTemplate,
  Plus,
  Search,
  Loader2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface JournalTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string;
  prompts: string[];
  isActive: boolean;
  isDefault: boolean;
  createdOn: string;
}
const CATEGORIES = [
  { value: "general", key: "categoryGeneral" },
  { value: "study", key: "categoryStudy" },
  { value: "prayer", key: "categoryPrayer" },
  { value: "gratitude", key: "categoryGratitude" },
  { value: "reflection", key: "categoryReflection" },
];
function getCatLabel(t: any, catValue: string): string {
  const cat = CATEGORIES.find((c) => c.value === catValue);
  if (!cat) return catValue;
  return (t.journal as any)?.[cat.key] || catValue;
const JournalTemplates = () => {
  const p = useJournalTemplates();
  const { t, isRtl, templates, loading, category, setCategory, dialogOpen, setDialogOpen, formData, setFormData, saving, handleSave, deleteDialog, setDeleteDialog, deleting, handleDelete, refresh } = p;
  return (
    <div className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                <LayoutTemplate className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.journal?.templatePageTitle || "Journal Templates"}</h1>
                <p className="text-muted-foreground text-sm">
                  {t.journal?.templatePageSubtitle || "Create structured journaling templates for users"}
                </p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              {t.journal?.addTemplate || "Add Template"}
            </Button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder={t.journal?.promptCategory || 'Category'} />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {getCatLabel(t, cat.value)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="w-8 h-8 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t.journal?.noTemplatesYet || "No templates yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {t.journal?.templateEmptyDesc || "Create templates to help users journal consistently"}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
              {t.journal?.createTemplate || "Create Template"}
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getCatLabel(t, template.category)}</Badge>
                      {template.isDefault && (
                        <Badge variant="outline" className="bg-amber-50 border-amber-200">
                          <Star className={cn("w-3 h-3", isRtl ? "ml-1" : "mr-1")} />
                          {t.journal?.defaultBadge || "Default"}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setDeleteDialog(template)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-1">{template.name}</h3>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {template.description}
                    </p>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {(t.journal?.promptsColon || "Prompts:").replace("{n}", String(template.prompts.length))}
                    {template.prompts.slice(0, 3).map((prompt, idx) => (
                      <p key={idx} className="text-xs line-clamp-1">
                        • {prompt}
                      </p>
                    ))}
                    {template.prompts.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        {(t.journal?.morePrompts || "+{n} more...").replace("{n}", String(template.prompts.length - 3))}
                    )}
                </CardContent>
              </Card>
            ))}
        )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.journal?.addTemplateDialog || "Add Journal Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{t.journal?.templateName || 'Template Name'}</Label>
              <Input
                placeholder={t.journal?.templateName || 'Template Name'}
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
              <Label>{t.journal?.descriptionOptional || 'Description (optional)'}</Label>
                placeholder={t.journal?.descriptionOptional || 'Brief description...'}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.journal?.promptCategory || "Category"}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {getCatLabel(t, cat.value)}
                      </SelectItem>
                  </SelectContent>
                </Select>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(v) => setFormData((p) => ({ ...p, isDefault: v }))}
                />
                <Label>{t.journal?.setAsDefault || "Set as default template"}</Label>
              <Label>{t.journal?.promptsOnePerLine || "Prompts"}</Label>
              {formData.prompts.map((prompt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={(t.journal?.promptNumber || "Prompt {n}").replace("{n}", String(idx + 1))}
                    value={prompt}
                    onChange={(e) => updatePrompt(idx, e.target.value)}
                  />
                  {formData.prompts.length > 1 && (
                      onClick={() => removePromptField(idx)}
                </div>
              <Button variant="outline" size="sm" onClick={addPromptField}>
                <Plus className="w-4 h-4 mr-2" />
                {t.journal?.addPrompt || "Add Prompt"}
              </Button>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common?.cancel || "Cancel"}
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.journal?.createTemplate || "Create"}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
            <DialogTitle>{t.journal?.deleteTemplate || "Delete Template"}</DialogTitle>
          <p>{t.journal?.deleteTemplateDesc || "Are you sure you want to delete this template?"}</p>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.journal?.deleteTemplate || "Delete"}
    </div>
  );
};
export default JournalTemplates;
