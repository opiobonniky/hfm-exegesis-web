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
interface BookPrologue {
  id: number; bookName: string; title: string; content: string;
  isPublished: boolean; createdOn: string; updatedOn: string | null;
}
const EMPTY_FORM = { bookName: "", title: "", content: "", isPublished: true };
export default function AdminBookPrologues() {
  const h = useAdminBookProloguesPage();
  return (
    <div className="min-h-screen bg-background">
      <AdminPageHeader title="Book Prologues Manager" subtitle="Manage book introductions and overviews"
        icon={<ScrollText className="w-5 h-5 text-primary" />} onBack={() => navigate("/admin")} onAdd={() => openEdit()} addLabel="Add Prologue" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminSearchBar value={search} onChange={setSearch} onSearch={refresh} placeholder="Search by book name..." />
        {loading && items.length === 0 ? <AdminLoadingGrid /> : items.length === 0 ? (
          <AdminEmptyState icon={<ScrollText className="w-12 h-12" />} title="No prologues found"
            message={search ? "Try a different search term" : "Create your first book prologue"} onAction={!search ? () => openEdit() : undefined} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
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
                      <Button variant="outline" size="sm" onClick={() => openEdit(item)} className="gap-1"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteItem(item)} className="gap-1 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {hasMore && <div className="flex justify-center mt-6"><Button variant="outline" onClick={loadMore} disabled={loading} className="gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Load More</Button></div>}
          </>
        )}
      </div>
      {/* Edit Dialog */}
      <Dialog open={!!editItem || editForm.bookName !== ""} onOpenChange={(o) => { if (!o) { setEditItem(null); setEditForm(EMPTY_FORM); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Prologue" : "Add New Prologue"}</DialogTitle>
            <DialogDescription>{editItem ? "Update the book prologue content" : "Create a new book introduction or overview"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Book Name *</Label>
              <Input placeholder="Search for a book..." value={editForm.bookName} onChange={(e) => setEditForm((p) => ({ ...p, bookName: e.target.value }))} />
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {filteredBooks.slice(0, 10).map((book) => (
                    <button key={book} className="w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors" onClick={() => setEditForm((p) => ({ ...p, bookName: book }))}>{book}</button>
                  ))}
                </div>
              )}
            <div className="space-y-2"><Label>Title *</Label><Input placeholder="e.g., The Gospel of John" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Content *</Label><Textarea placeholder="Write the book prologue content..." value={editForm.content} onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))} rows={8} className="min-h-[200px]" /></div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label>Published</Label><p className="text-sm text-muted-foreground">Make this prologue visible to users</p></div>
              <Switch checked={editForm.isPublished} onCheckedChange={(c) => setEditForm((p) => ({ ...p, isPublished: c }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditItem(null); setEditForm(EMPTY_FORM); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {editItem ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => { if (!o) setDeleteItem(null); }}>
        <DialogContent>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Delete Prologue</DialogTitle>
            <DialogDescription>Are you sure you want to delete the prologue for <strong>{deleteItem?.bookName}</strong>? This action cannot be undone.</DialogDescription>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting === deleteItem?.id} className="gap-2">
              {deleting === deleteItem?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
    </div>
  );
