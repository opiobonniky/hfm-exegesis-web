"use client";

import { useAdminBookProloguesPage } from "../hooks/useAdminBookProloguesPage";
import { ScrollText, Trash2, Edit2, Save, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AdminPageHeader, AdminEmptyState, AdminLoadingGrid, AdminSearchBar } from "../components";

const EMPTY_FORM = { bookName: "", title: "", content: "", isPublished: true };

export default function AdminBookPrologues() {
  const h = useAdminBookProloguesPage();

  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader title="Book Prologues Manager" subtitle="Manage book introductions and overviews"
        icon={<ScrollText className="w-5 h-5 text-primary" />} onBack={() => h.navigate("/admin")} onAdd={() => h.openEdit()} addLabel="Add Prologue" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminSearchBar value={h.search} onChange={h.setSearch} onSearch={h.refresh} placeholder="Search by book name..." />

        {h.loading && h.items.length === 0 ? (
          <AdminLoadingGrid />
        ) : h.items.length === 0 ? (
          <AdminEmptyState icon={<ScrollText className="w-12 h-12" />} title="No prologues found"
            message={h.search ? "Try a different search term" : "Create your first book prologue"} onAction={!h.search ? () => h.openEdit() : undefined} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {h.items.map((item) => (
                <Card key={item.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{item.bookName}</p>
                      </div>
                      <Badge variant={item.isPublished ? "default" : "secondary"} className="shrink-0 ml-2">{item.isPublished ? "Published" : "Draft"}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => h.openEdit(item)} className="gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => h.setDeleteItem(item)} className="gap-1 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {h.hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={h.loadMore} disabled={h.loading} className="gap-2">
                  {h.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!h.editItem || h.editForm.bookName !== ""} onOpenChange={(o) => { if (!o) { h.setEditItem(null); h.setEditForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{h.editItem ? "Edit Prologue" : "Add New Prologue"}</DialogTitle>
            <DialogDescription>{h.editItem ? "Update the book prologue content" : "Create a new book introduction or overview"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Book Name *</Label>
              <Input placeholder="Search for a book..." value={h.editForm.bookName} onChange={(e) => h.setEditForm((p) => ({ ...p, bookName: e.target.value }))} />
              {h.editForm.bookName && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {h.filteredBooks.slice(0, 10).map((book) => (
                    <button key={book} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors" onClick={() => h.setEditForm((p) => ({ ...p, bookName: book }))}>{book}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input placeholder="e.g., The Gospel of John" value={h.editForm.title} onChange={(e) => h.setEditForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea placeholder="Write the book prologue content..." value={h.editForm.content} onChange={(e) => h.setEditForm((p) => ({ ...p, content: e.target.value }))} rows={8} className="min-h-[200px]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Published</Label>
                <p className="text-sm text-muted-foreground">Make this prologue visible to users</p>
              </div>
              <Switch checked={h.editForm.isPublished} onCheckedChange={(c) => h.setEditForm((p) => ({ ...p, isPublished: c }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { h.setEditItem(null); h.setEditForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={h.handleSave} disabled={h.saving} className="gap-2">{h.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {h.editItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!h.deleteItem} onOpenChange={(o) => { if (!o) h.setDeleteItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Delete Prologue</DialogTitle>
            <DialogDescription>Are you sure you want to delete the prologue for <strong>{h.deleteItem?.bookName}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deleting === h.deleteItem?.id} className="gap-2">
              {h.deleting === h.deleteItem?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
