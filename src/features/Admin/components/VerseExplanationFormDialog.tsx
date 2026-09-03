// VerseExplanationFormDialog — High-fidelity editor for structured verse explanations
"use client";

import { Save, Loader2, Plus, Trash2, BookOpen, Lightbulb, Target, Tag, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BIBLE_BOOKS } from "@/data/staticData";

export interface WordStudyItem {
  strongsId?: string;
  surfaceText?: string;
  customDefinition?: string;
  sortOrder: number;
}

export interface CrossRefItem {
  bookName: string;
  chapter: number;
  verseNumber: number;
  referenceText?: string;
  commentary?: string;
  sortOrder: number;
}

export interface VerseExplanationForm {
  bookName: string;
  chapter: string;
  verseNumber: string;
  bibleVersion: string;
  exegesis: {
    explanationText: string;
    applicationText: string;
  };
  studyMetadata: {
    introduction: string;
    backgroundAuthor: string;
    backgroundBook: string;
    backgroundContext: string;
    finalThoughts: string;
  };
  wordStudies: WordStudyItem[];
  practicalApps: { applicationText: string; sortOrder: number }[];
  crossReferences: CrossRefItem[];
  themes: { themeName: string; sortOrder: number }[];
}

interface Props {
  open: boolean;
  editMode: boolean;
  form: VerseExplanationForm;
  filteredBooks: string[];
  saving: boolean;
  onFormChange: (updater: (prev: VerseExplanationForm) => VerseExplanationForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function VerseExplanationFormDialog({
  open,
  editMode,
  form,
  filteredBooks,
  saving,
  onFormChange,
  onSave,
  onClose,
}: Props) {
  const updateField = (path: string, value: any) => {
    onFormChange((prev) => {
      const next = { ...prev };
      const parts = path.split(".");
      let current = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const moveItem = <T,>(listPath: string, index: number, direction: "up" | "down") => {
    onFormChange((prev) => {
      const next = { ...prev };
      const list = [...(next as any)[listPath]];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= list.length) return prev;
      [list[index], list[newIndex]] = [list[newIndex], list[index]];
      (next as any)[listPath] = list;
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit Detailed Explanation" : "Create Detailed Explanation"}</DialogTitle>
          <DialogDescription>
            Complete the structured study guide for this verse.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="core" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="core" className="gap-2">
              <BookOpen className="w-4 h-4" /> Core
            </TabsTrigger>
            <TabsTrigger value="exegesis" className="gap-2">
              <Lightbulb className="w-4 h-4" /> Exegesis
            </TabsTrigger>
            <TabsTrigger value="study" className="gap-2">
              <Target className="w-4 h-4" /> Study
            </TabsTrigger>
            <TabsTrigger value="extras" className="gap-2">
              <Tag className="w-4 h-4" /> Extras
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 p-4">
            <TabsContent value="core" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Book Name *</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search for a book..."
                      value={form.bookName}
                      onChange={(e) => updateField("bookName", e.target.value)}
                    />
                    {form.bookName && filteredBooks.length > 0 && (
                      <div className="absolute z-10 w-full bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                        {filteredBooks.slice(0, 20).map((book) => (
                          <button
                            key={book}
                            className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
                            onClick={() => updateField("bookName", book)}
                          >
                            {book}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Bible Version</Label>
                  <Input
                    placeholder="e.g., BSB, KJV"
                    value={form.bibleVersion}
                    onChange={(e) => updateField("bibleVersion", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chapter *</Label>
                  <Input
                    type="number"
                    value={form.chapter}
                    onChange={(e) => updateField("chapter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verse Number *</Label>
                  <Input
                    type="number"
                    value={form.verseNumber}
                    onChange={(e) => updateField("verseNumber", e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exegesis" className="space-y-4">
              <div className="space-y-2">
                <Label>Exegesis / Explanation *</Label>
                <Textarea
                  placeholder="Provide a detailed theological explanation of the verse..."
                  value={form.exegesis.explanationText}
                  onChange={(e) => updateField("exegesis.explanationText", e.target.value)}
                  rows={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Application</Label>
                <Textarea
                  placeholder="How does this apply to daily faith?"
                  value={form.exegesis.applicationText}
                  onChange={(e) => updateField("exegesis.applicationText", e.target.value)}
                  rows={5}
                />
              </div>
            </TabsContent>

            <TabsContent value="study" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-bold">Introduction & Background</Label>
                <div className="space-y-2">
                  <Label className="text-xs">Verse Introduction</Label>
                  <Textarea
                    value={form.studyMetadata.introduction}
                    onChange={(e) => updateField("studyMetadata.introduction", e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Author</Label>
                    <Input
                      value={form.studyMetadata.backgroundAuthor}
                      onChange={(e) => updateField("studyMetadata.backgroundAuthor", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Book</Label>
                    <Input
                      value={form.studyMetadata.backgroundBook}
                      onChange={(e) => updateField("studyMetadata.backgroundBook", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Context</Label>
                    <Input
                      value={form.studyMetadata.backgroundContext}
                      onChange={(e) => updateField("studyMetadata.backgroundContext", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Final Thoughts</Label>
                  <Textarea
                    value={form.studyMetadata.finalThoughts}
                    onChange={(e) => updateField("studyMetadata.finalThoughts", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Strong Concordance Word Study</Label>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                    const newList = [...form.wordStudies, { strongsId: "", surfaceText: "", customDefinition: "", sortOrder: form.wordStudies.length }];
                    updateField("wordStudies", newList);
                  }}>
                    <Plus className="w-3 h-3" /> Add Word
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.wordStudies.map((ws, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                      <div className="flex flex-col gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("wordStudies", i, "up")}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("wordStudies", i, "down")}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 flex-1">
                        <Input placeholder="H3034" value={ws.strongsId} onChange={(e) => {
                          const next = [...form.wordStudies];
                          next[i] = { ...next[i], strongsId: e.target.value };
                          updateField("wordStudies", next);
                        }} />
                        <Input placeholder="Give Thanks" value={ws.surfaceText} onChange={(e) => {
                          const next = [...form.wordStudies];
                          next[i] = { ...next[i], surfaceText: e.target.value };
                          updateField("wordStudies", next);
                        }} />
                        <Input placeholder="Definition" value={ws.customDefinition} onChange={(e) => {
                          const next = [...form.wordStudies];
                          next[i] = { ...next[i], customDefinition: e.target.value };
                          updateField("wordStudies", next);
                        }} />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        updateField("wordStudies", form.wordStudies.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="extras" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Practical Applications</Label>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                    const newList = [...form.practicalApps, { applicationText: "", sortOrder: form.practicalApps.length }];
                    updateField("practicalApps", newList);
                  }}>
                    <Plus className="w-3 h-3" /> Add Point
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.practicalApps.map((pa, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex flex-col gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("practicalApps", i, "up")}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("practicalApps", i, "down")}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={pa.applicationText}
                          onChange={(e) => {
                            const next = [...form.practicalApps];
                            next[i] = { ...next[i], applicationText: e.target.value };
                            updateField("practicalApps", next);
                          }}
                          rows={2}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        updateField("practicalApps", form.practicalApps.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Cross References</Label>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                    const newList = [...form.crossReferences, { bookName: "", chapter: 0, verseNumber: 0, referenceText: "", commentary: "", sortOrder: form.crossReferences.length }];
                    updateField("crossReferences", newList);
                  }}>
                    <Plus className="w-3 h-3" /> Add Ref
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.crossReferences.map((cr, i) => (
                    <div key={i} className="flex gap-2 items-start p-3 border rounded-lg bg-muted/30">
                      <div className="flex flex-col gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("crossReferences", i, "up")}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("crossReferences", i, "down")}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <Input placeholder="Book" value={cr.bookName} onChange={(e) => {
                          const next = [...form.crossReferences];
                          next[i] = { ...next[i], bookName: e.target.value };
                          updateField("crossReferences", next);
                        }} />
                        <Input type="number" placeholder="Ch" value={cr.chapter} onChange={(e) => {
                          const next = [...form.crossReferences];
                          next[i] = { ...next[i], chapter: parseInt(e.target.value) || 0 };
                          updateField("crossReferences", next);
                        }} />
                        <Input type="number" placeholder="V" value={cr.verseNumber} onChange={(e) => {
                          const next = [...form.crossReferences];
                          next[i] = { ...next[i], verseNumber: parseInt(e.target.value) || 0 };
                          updateField("crossReferences", next);
                        }} />
                        <Input placeholder="Text" value={cr.referenceText} onChange={(e) => {
                          const next = [...form.crossReferences];
                          next[i] = { ...next[i], referenceText: e.target.value };
                          updateField("crossReferences", next);
                        }} />
                      </div>
                      <div className="mt-2 flex-1">
                        <Textarea
                          placeholder="Commentary"
                          value={cr.commentary}
                          onChange={(e) => {
                            const next = [...form.crossReferences];
                            next[i] = { ...next[i], commentary: e.target.value };
                            updateField("crossReferences", next);
                          }}
                          rows={2}
                        />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        updateField("crossReferences", form.crossReferences.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold">Key Themes</Label>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                    const newList = [...form.themes, { themeName: "", sortOrder: form.themes.length }];
                    updateField("themes", newList);
                  }}>
                    <Plus className="w-3 h-3" /> Add Theme
                  </Button>
                </div>
                <div className="space-y-3">
                  {form.themes.map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex flex-col gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("themes", i, "up")}>
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem("themes", i, "down")}>
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                      <Input
                        className="flex-1"
                        placeholder="e.g., Covenant Faithfulness"
                        value={t.themeName}
                        onChange={(e) => {
                          const next = [...form.themes];
                          next[i] = { ...next[i], themeName: e.target.value };
                          updateField("themes", next);
                        }}
                      />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                        updateField("themes", form.themes.filter((_, idx) => idx !== i));
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>

          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              {editMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
