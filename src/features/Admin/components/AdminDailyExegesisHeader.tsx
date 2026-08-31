// AdminDailyExegesisHeader — header section for admin daily exegesis page
import { Feather, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onBack?: () => void;
  onAdd: () => void;
}

export function AdminDailyExegesisHeader({ onBack, onAdd }: Props) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 min-w-0">
            {onBack &&


                <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
                  <span className="sr-only">Back</span>←
                </Button>

            }


            <div className="min-w-0">
              <h1 className="text-lg font-semibold flex items-center gap-2 truncate">
                <Feather className="w-5 h-5 text-primary shrink-0" /> Daily Exegesis
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Manage daily teaching and exegesis content
              </p>
            </div>
          </div>
          <Button onClick={onAdd} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Exegesis</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
