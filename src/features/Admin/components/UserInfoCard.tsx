// UserInfoCard — reusable card with title and InfoRow items
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoRow {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

interface UserInfoCardProps {
  title: string;
  rows: InfoRow[];
}

export function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground">{label}</span>
        <p className="text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

export function UserInfoCard({ title, rows }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row, i) => (
          <InfoRow key={i} icon={row.icon} label={row.label} value={row.value} />
        ))}
      </CardContent>
    </Card>
  );
}
