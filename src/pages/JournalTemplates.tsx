import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/languages/languageProvider";
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
}

const JournalTemplates = () => {
  const { userInfo } = useAuth();
  const { toast } = useToast();
  const { t, isRtl } = useLanguage();
  const isAdmin = userInfo?.userRole === 1;

  const [templates, setTemplates] = useState<JournalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    prompts: [""],
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<JournalTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchTemplates();
    }
  }, [category]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      if (category !== "all") payload.category = category;
      payload.isActive = true;

      const res = await sendPostRequest("journal", "templates/get-all", payload);
      if (res.returnCode === 200 && res.returnData) {
        setTemplates(res.returnData);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.prompts.some((p) => p.trim())) {
      toast({
        title: t.common?.error || 'Error',
        description: t.journal?.templateNameRequired || 'Name and at least one prompt are required',
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await sendPostRequest("journal", "templates/create", formData);
      if (res.returnCode === 200) {
        toast({ title: t.common?.save || 'Success', description: t.journal?.templateCreated || 'Template created successfully' });
        setDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          category: "general",
          prompts: [""],
          isDefault: false,
        });
        fetchTemplates();
      }
    } catch (error) {
      toast({
        title: t.common?.error || 'Error',
        description: t.journal?.failedToCreate || 'Failed to create template',
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    setDeleting(true);
    try {
      const res = await sendPostRequest("journal", "templates/delete", { id: deleteDialog.id });
      if (res.returnCode === 200) {
        toast({ title: t.journal?.templateDeleted || 'Deleted', description: t.journal?.deleteTemplate || 'Template deleted' });
        setDeleteDialog(null);
        fetchTemplates();
      }
    } catch (error) {
      toast({
        title: t.common?.error || 'Error',
        description: t.journal?.failedToDelete || 'Failed to delete',
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const addPromptField = () => {
    setFormData((prev) => ({ ...prev, prompts: [...prev.prompts, ""] }));
  };

  const removePromptField = (index: number) => {
    if (formData.prompts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        prompts: prev.prompts.filter((_, i) => i !== index),
      }));
    }
  };

  const updatePrompt = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      prompts: prev.prompts.map((p, i) => (i === index ? value : p)),
    }));
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{t.journal?.accessDenied || "Access Denied"}</h2>
          <p className="text-muted-foreground">{t.journal?.adminAccessRequired || "Admin access required"}</p>
        </div>
      </div>
    );
  }

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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{t.journal?.noTemplatesYet || "No templates yet"}</h3>
            <p className="text-muted-foreground mb-4">
              {t.journal?.templateEmptyDesc || "Create templates to help users journal consistently"}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className={cn("w-4 h-4", isRtl ? "ml-2" : "mr-2")} />
              {t.journal?.createTemplate || "Create Template"}
            </Button>
          </div>
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
                    </p>
                    {template.prompts.slice(0, 3).map((prompt, idx) => (
                      <p key={idx} className="text-xs line-clamp-1">
                        • {prompt}
                      </p>
                    ))}
                    {template.prompts.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        {(t.journal?.morePrompts || "+{n} more...").replace("{n}", String(template.prompts.length - 3))}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

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
            </div>
            <div className="space-y-2">
              <Label>{t.journal?.descriptionOptional || 'Description (optional)'}</Label>
              <Input
                placeholder={t.journal?.descriptionOptional || 'Brief description...'}
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
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
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.isDefault}
                  onCheckedChange={(v) => setFormData((p) => ({ ...p, isDefault: v }))}
                />
                <Label>{t.journal?.setAsDefault || "Set as default template"}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.journal?.promptsOnePerLine || "Prompts"}</Label>
              {formData.prompts.map((prompt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder={(t.journal?.promptNumber || "Prompt {n}").replace("{n}", String(idx + 1))}
                    value={prompt}
                    onChange={(e) => updatePrompt(idx, e.target.value)}
                  />
                  {formData.prompts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePromptField(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addPromptField}>
                <Plus className="w-4 h-4 mr-2" />
                {t.journal?.addPrompt || "Add Prompt"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.journal?.createTemplate || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.journal?.deleteTemplate || "Delete Template"}</DialogTitle>
          </DialogHeader>
          <p>{t.journal?.deleteTemplateDesc || "Are you sure you want to delete this template?"}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              {t.common?.cancel || "Cancel"}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {t.journal?.deleteTemplate || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalTemplates;