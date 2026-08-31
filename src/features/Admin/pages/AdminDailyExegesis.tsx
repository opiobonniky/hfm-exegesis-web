// AdminDailyExegesis — thin page composing hooks + components
"use client";
import { useNavigate } from "react-router-dom";
import { Feather, Plus, Search, Loader2, ChevronRight, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAdminDailyExegesis } from "../hooks/useAdminDailyExegesis";
import { ExegesisCard, ExegesisFormDialog } from "../components";

export default function AdminDailyExegesis() {
  const navigate = useNavigate();
  const h = useAdminDailyExegesis();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}><span className="sr-only">Back</span>←</Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2"><Feather className="w-5 h-5 text-primary" /> Daily Exegesis Manager</h1>
                <p className="text-sm text-muted-foreground">Manage daily teaching and exegesis content</p>
              </div>
            </div>
            <Button onClick={() => h.openEdit()} className="gap-2"><Plus className="w-4 h-4" /> Add Exegesis</Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by title or passage..." value={h.search}
              onChange={e => h.setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && h.handleSearch()} className="pl-9" />
          </div>
          <Button variant="outline" onClick={h.handleSearch}>Search</Button>
        </div>

        {h.loading && h.items.length === 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardHeader className="pb-3"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : h.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Feather className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No exegeses found</h3>
            <p className="text-sm text-muted-foreground mb-4">{h.search ? "Try a different search term" : "Create your first daily exegesis"}</p>
            {!h.search && <Button onClick={() => h.openEdit()} className="gap-2"><Plus className="w-4 h-4" /> Add Exegesis</Button>}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {h.items.map(item => (
                <ExegesisCard key={item.id} id={item.id} title={item.title} passageReference={item.passageReference}
                  displayDate={item.displayDate} teachingBody={item.teachingBody} isPublished={item.isPublished}
                  onEdit={() => h.openEdit(item)} onDelete={() => h.setDeleteTarget(item)} />
              ))}
            </div>
                        {/* Infinite scroll sentinel */}
            <div ref={h.sentinelRef} className="h-4" />
            {h.loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && h.items.length > 0 && (
              <p className="text-center text-xs text-muted-foreground/50 py-4">
                All items loaded
              </p>
            )}
          </>
        )}
      </div>

      {/* Dialogs */}
      <ExegesisFormDialog open={h.dialogOpen} editItem={h.editItem} form={h.editForm}
        onFormChange={h.setEditForm} saving={h.saving} onSave={h.handleSave} onClose={h.closeDialog} />
      <Dialog open={!!h.deleteTarget} onOpenChange={o => !o && h.setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Delete Exegesis</DialogTitle>
            <DialogDescription>Are you sure you want to delete <strong>{h.deleteTarget?.title}</strong>? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => h.setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={h.handleDelete} disabled={h.deletingId === h.deleteTarget?.id} className="gap-2">
              {h.deletingId === h.deleteTarget?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
