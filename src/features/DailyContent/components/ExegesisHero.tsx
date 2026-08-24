// ExegesisHero — hero banner with date, title, passage + series navigation carousel
import { Calendar, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Exegesis {
  id: number; title: string; passageReference: string; displayDate: string; isPublished: boolean;
}
interface Props {
  item: Exegesis;
  series: Exegesis[];
  onSelect: (item: Exegesis) => void;
  onOpenBible: () => void;
  displayDate: string;
  isUpcoming: boolean;
  canOpenBible: boolean;
export function ExegesisHero({ item, series, onSelect, onOpenBible, displayDate, isUpcoming, canOpenBible }: Props) {
  return (
    <>
      <section className="bg-gradient-to-r from-primary to-indigo-600 text-white py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{displayDate}</span>
            {isUpcoming && <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5 ml-2">Upcoming</Badge>}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight">{item.title}</h1>
          <Button variant="secondary" onClick={onOpenBible} disabled={!canOpenBible} className="w-max gap-2">
            <BookOpen className="w-4 h-4" /> {item.passageReference}
          </Button>
        </div>
      </section>
      {series.length > 1 && (
        <section className="bg-muted py-3">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex gap-2">
            {series.map((entry) => (
              <button key={entry.id} onClick={() => onSelect(entry)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all shrink-0",
                  entry.id === item.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted",
                )}>
                {entry.passageReference}
              </button>
            ))}
        </section>
      )}
    </>
  );
