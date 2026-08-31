// UserSessionsCard — login sessions list with loading/empty states
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Session {
  id: string;
  success: boolean;
  deviceType?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  loggedInAt?: string;
  loggedOutAt?: string;
  failureReason?: string;
}

interface UserSessionsCardProps {
  sessions: Session[];
  loading: boolean;
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleString();
}

export function UserSessionsCard({ sessions, loading }: UserSessionsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Login Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No sessions recorded
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {sessions.slice(0, 20).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 text-sm"
              >
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    s.success ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">
                      {s.deviceType || "Unknown"}
                    </span>
                    {s.browser && (
                      <span className="text-xs text-muted-foreground">
                        {s.browser}
                      </span>
                    )}
                    {s.os && (
                      <span className="text-xs text-muted-foreground">
                        ({s.os})
                      </span>
                    )}
                  </div>
                  {s.ipAddress && (
                    <span className="text-[10px] text-muted-foreground">
                      {s.ipAddress}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">
                    {formatDateTime(s.loggedInAt)}
                  </div>
                  {s.loggedOutAt && (
                    <div className="text-[10px] text-muted-foreground/60">
                      \u2192 {formatDateTime(s.loggedOutAt)}
                    </div>
                  )}
                </div>
                {!s.success && s.failureReason && (
                  <Badge variant="destructive" className="text-[10px] shrink-0">
                    {s.failureReason}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
