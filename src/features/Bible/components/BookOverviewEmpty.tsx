// BookOverviewEmpty — shown when no prologue exists for a book
import { BookOpen } from "lucide-react";

export default function BookOverviewEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <BookOpen className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Ready to read?</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        No overview is available for this book yet. You can jump straight into
        the text.
      </p>
    </div>
  );
}
