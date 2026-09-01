/**
 * DeletePreview — preview of item being deleted in confirmation dialog.
 */
interface DeletePreviewProps {
  title: string;
  description: string;
}

export function DeletePreview({ title, description }: DeletePreviewProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>
    </div>
  );
}
