// JournalEntryAdminDetail — admin view of a single journal entry
"use client";

import {
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  Trash2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useJournalEntryAdminDetail } from "../hooks/useJournalEntryAdminDetail";

export default function JournalEntryAdminDetail() {
  const h = useJournalEntryAdminDetail();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (h.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!h.item) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => h.navigate("/admin/journal-moderation")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Journal Entry
                </h1>
                <p className="text-xs text-muted-foreground">
                  by user {h.item.userId?.slice(0, 8)}…
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={h.handleTogglePublication}
                className="gap-1.5"
              >
                {h.item.isPublished ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {h.item.isPublished ? "Make Private" : "Make Public"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Title + visibility */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{h.item.title || "Untitled"}</h2>
              <Badge variant={h.item.isPublished ? "default" : "outline"}>
                {h.item.isPublished ? (
                  <Globe className="w-3 h-3 mr-1" />
                ) : (
                  <Lock className="w-3 h-3 mr-1" />
                )}
                {h.item.isPublished ? "Public" : "Private"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {h.item.category && (
                <Badge variant="secondary">{h.item.category}</Badge>
              )}
              {h.item.bookName && (
                <Badge variant="outline">
                  {h.item.bookName}
                  {h.item.chapter ? ` ${h.item.chapter}` : ""}
                  {h.item.verseNumber ? `:${h.item.verseNumber}` : ""}
                </Badge>
              )}
              {h.item.mood && (
                <Badge variant="outline" className="text-amber-600">
                  {h.item.mood}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {h.item.content}
            </p>
          </CardContent>
        </Card>

        {/* Additional fields */}
        {[
          { label: "Prayers", value: h.item.prayers },
          { label: "Gratitude", value: h.item.gratitude },
          { label: "Learnings", value: h.item.learnings },
          { label: "Application", value: h.item.application },
        ]
          .filter((f) => f.value)
          .map((field) => (
            <Card key={field.label}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                  {field.value}
                </p>
              </CardContent>
            </Card>
          ))}

        {/* Metadata */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold mb-1">Created</p>
                <p>
                  {h.item.createdOn
                    ? new Date(h.item.createdOn).toLocaleString()
                    : "—"}
                </p>
              </div>
              {h.item.updatedOn && (
                <div>
                  <p className="font-semibold mb-1">Updated</p>
                  <p>{new Date(h.item.updatedOn).toLocaleString()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => h.navigate("/admin/journal-moderation")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Journal Entry</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete &ldquo;{h.item.title}&rdquo;? This
            action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(false)}
              disabled={h.deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmDelete(false);
                h.handleDelete();
              }}
              disabled={h.deleting}
              className="gap-2"
            >
              {h.deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{" "}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
