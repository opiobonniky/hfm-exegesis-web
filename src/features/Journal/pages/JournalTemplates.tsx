"use client";

import { Plus, Trash2, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useJournalTemplatesPage, CATEGORIES, getCatLabel } from "../hooks/useJournalTemplatesPage";

export default function JournalTemplates() {
  const {
    t, templates, loading, dialogOpen, setDialogOpen,
    deleteDialog, setDeleteDialog, deleting, saving,
    formData, setFormData, saveDisabled,
    handleSave, handleDelete, openAddDialog,
  } = useJournalTemplatesPage();

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.journal?.templates || "Journal Templates"}</h1>
        <Button onClick={openAddDialog} className="gap-2"><Plus className="w-4 h-4" />{t.journal?.addTemplate || "Add Template"}</Button>
      </div>

      {templates.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm font-medium text-muted-foreground">No templates yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create templates to speed up journaling</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">{getCatLabel(t, template.category)}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteDialog(template)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && <p className="text-xs text-muted-foreground mb-3">{template.description}</p>}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Prompts: {template.prompts.length}</p>
                  {template.prompts.slice(0, 3).map((prompt, idx) => (
                    <p key={idx} className="text-xs line-clamp-1">• {prompt}</p>
                  ))}
                  {template.prompts.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{template.prompts.length - 3} more...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.journal?.addTemplateDialog || "Add Journal Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>{t.journal?.templateName || "Template Name"}</Label>
              <Input placeholder={t.journal?.templateName || "Template Name"} value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.journal?.descriptionOptional || "Description (optional)"}</Label>
              <Textarea placeholder={t.journal?.descriptionOptional || "Brief description..."} value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>{t.journal?.promptCategory || "Category"}</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{getCatLabel(t, cat.value)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prompts</Label>
              {formData.prompts.map((prompt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={prompt} placeholder={`Prompt ${idx + 1}`}
                    onChange={(e) => setFormData((p) => ({ ...p, prompts: p.prompts.map((pr, i) => i === idx ? e.target.value : pr) }))} />
                  {formData.prompts.length > 1 && (
                    <Button variant="ghost" size="icon" className="shrink-0"
                      onClick={() => setFormData((p) => ({ ...p, prompts: p.prompts.filter((_, i) => i !== idx) }))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setFormData((p) => ({ ...p, prompts: [...p.prompts, ""] }))}>
                <Plus className="w-3 h-3 mr-1" /> Add Prompt
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData((p) => ({ ...p, isActive: c }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveDisabled}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Template</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete "{deleteDialog?.name}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
