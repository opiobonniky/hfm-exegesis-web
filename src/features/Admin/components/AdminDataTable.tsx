// AdminDataTable — reusable table with loading/empty states
import { Loader2, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  className?: string;
  hidden?: "sm" | "md" | "lg";
  render: (item: T) => ReactNode;
}
interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  keyField?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (item: T) => void;
export function AdminDataTable<T extends Record<string, any>>({
  columns, data, loading, keyField = "id", emptyMessage = "No data found", emptyIcon, onRowClick,
}: Props<T>) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
      </div>
    );
  }
  if (data.length === 0) {
      <div className="flex flex-col items-center py-12 text-center">
        {emptyIcon || <Inbox className="w-10 h-10 text-muted-foreground/30 mb-3" />}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={col.key} className={`text-left p-3 font-medium text-xs ${col.className || ""} ${col.hidden === "sm" ? "hidden sm:table-cell" : col.hidden === "md" ? "hidden md:table-cell" : col.hidden === "lg" ? "hidden lg:table-cell" : ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={item[keyField] ?? idx}
              className={`border-b last:border-0 ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}`}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`p-3 ${col.className || ""} ${col.hidden === "sm" ? "hidden sm:table-cell" : col.hidden === "md" ? "hidden md:table-cell" : col.hidden === "lg" ? "hidden lg:table-cell" : ""}`}>
                  {col.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
