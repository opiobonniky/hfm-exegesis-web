import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Edit, Trash2, Eye } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: string;
  status: string;
  date: string;
  createdAt: string;
}
interface AdminContentTableProps {
  items: ContentItem[];
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onView: (item: ContentItem) => void;
}

export function AdminContentTable({ items, onEdit, onDelete, onView }: AdminContentTableProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
              <TableCell>
                <Badge variant={item.status === "published" ? "success" : "warning"}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(item.date || item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(item)} className="h-8 w-8 p-0">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
