export interface JournalDetailTimestampsProps {
  createdOn: string;
  updatedOn: string;
  formatDate: (date: string) => string;
}

export default function JournalDetailTimestamps({ createdOn, updatedOn, formatDate }: JournalDetailTimestampsProps) {
  return (
    <div className="text-center space-y-0.5 pb-8">
      <div className="text-[11px] text-muted-foreground/70 dark:text-muted-foreground">Written {formatDate(createdOn)}</div>
      <div className="text-[11px] text-muted-foreground/50 dark:text-muted-foreground">Last edited {formatDate(updatedOn)}</div>
    </div>
  );
}
