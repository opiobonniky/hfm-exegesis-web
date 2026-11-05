import { BookText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tt } from "@/components/languages/hardcodedTranslate";

export function JournalHeader({ onCreate }: { onCreate: () => void }) {
  return <header className="border-b bg-card/70"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
    <div className="flex items-center gap-3"><div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><BookText className="size-6" /></div><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{tt("Journal")}</p><h1 className="text-2xl font-bold">{tt("My Journal")}</h1><p className="mt-1 text-sm text-muted-foreground">{tt("A record of God's work in your story")}</p></div></div>
    <Button onClick={onCreate} className="gap-2 rounded-xl"><Plus className="size-4" />{tt("New Journal")}</Button>
  </div></header>;
}
