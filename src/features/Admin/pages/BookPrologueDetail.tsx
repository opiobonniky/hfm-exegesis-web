// BookPrologueDetail — full detail view for a book prologue
"use client";

import { ArrowLeft, Loader2, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookPrologueDetail } from "../hooks/useBookPrologueDetail";

export default function BookPrologueDetail() {
  const h = useBookPrologueDetail();

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
                onClick={() => h.navigate("/admin/book-prologues")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-primary" /> Book
                  Prologue
                </h1>
                <p className="text-xs text-muted-foreground">
                  {h.item.bookName}
                </p>
              </div>
            </div>
            <Badge
              variant={h.item.isPublished !== false ? "default" : "secondary"}
            >
              {h.item.isPublished !== false ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Title card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScrollText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{h.item.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {h.item.bookName}
                </p>
              </div>
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

        {/* Metadata */}
        {(h.item.createdOn || h.item.updatedOn || h.item.createdBy) && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                {h.item.createdBy && (
                  <div>
                    <p className="font-semibold mb-1">Created By</p>
                    <p>{h.item.createdBy}</p>
                  </div>
                )}
                {h.item.createdOn && (
                  <div>
                    <p className="font-semibold mb-1">Created</p>
                    <p>{new Date(h.item.createdOn).toLocaleString()}</p>
                  </div>
                )}
                {h.item.updatedOn && (
                  <div>
                    <p className="font-semibold mb-1">Updated</p>
                    <p>{new Date(h.item.updatedOn).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pb-8">
          <Button
            variant="outline"
            onClick={() => h.navigate("/admin/book-prologues")}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Prologues
          </Button>
        </div>
      </div>
    </div>
  );
}
