import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { sendPostRequest } from "@/services/api";
import { cn } from "@/lib/utils";

interface Props {
  onClose: () => void;
  selectedIds?: number[];
}
export function ExportModal({ onClose, selectedIds }: Props) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<"txt" | "json" | "pdf">("txt");
  const { toast } = useToast();
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await sendPostRequest("journal", "export-all", {
        format, ...(selectedIds && selectedIds.length > 0 ? { ids: selectedIds } : {}),
      });
      if (res.returnCode === 200 && res.returnData) {
        const { content, filename, entryCount } = res.returnData as any;
        const byteCharacters = atob(content);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
        const byteArray = new Uint8Array(byteNumbers);
        let blob: Blob;
        if (format === "pdf") blob = new Blob([byteArray], { type: "application/pdf" });
        else if (format === "json") { const text = new TextDecoder().decode(byteArray); blob = new Blob([text], { type: "application/json" }); }
        else { const text = new TextDecoder().decode(byteArray); blob = new Blob([text], { type: "text/plain" }); }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = filename || `legacy-ledger-export.${format}`;
        document.body.appendChild(a); a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 500);
        toast({ title: "Exported", description: `Exported ${entryCount} entries as .${format}` });
        onClose();
      }
    } catch (e: any) {
      toast({ title: "Export Failed", description: e?.message || "Failed to export entries", variant: "destructive" });
    } finally { setExporting(false); }
  };
  const formats = [
    { value: "pdf" as const, label: ".pdf", desc: "Formatted PDF" },
    { value: "txt" as const, label: ".txt", desc: "Plain Text" },
    { value: "json" as const, label: ".json", desc: "Structured Data" },
  ];
  return (
    <div className="p-6">
      <h3 className="text-lg font-bold text-foreground dark:text-stone-200 text-center mb-1">
        {selectedIds && selectedIds.length > 0 ? `Export ${selectedIds.length} Selected Entries` : "Export Legacy Ledger"}
      </h3>
      <p className="text-sm text-muted-foreground dark:text-muted-foreground/70 text-center mb-5">
        {selectedIds && selectedIds.length > 0 ? `Choose a format to export ${selectedIds.length} selected journal entries.` : "Choose a format to export all your entries."}
      </p>
      <div className="flex gap-3 mb-5">
        {formats.map((f) => (
          <button key={f.value} onClick={() => setFormat(f.value)}
            className={cn("flex-1 flex flex-col items-center py-4 rounded-xl border-2 transition-all",
              format === f.value ? "bg-foreground/10 text-foreground border-border" : "bg-card dark:bg-stone-900 text-foreground/80 dark:text-muted-foreground/50 border-border dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600",
            )}>
            <span className="text-lg font-black">{f.label}</span>
            <span className="text-xs mt-0.5 opacity-70">{f.desc}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-border dark:border-stone-800">Cancel</Button>
        <Button onClick={handleExport} disabled={exporting} className="flex-1 gap-2 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? "Exporting..." : "Export"}
        </Button>
    </div>
  );
