import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyExegesisErrorProps } from "../types";

export function DailyExegesisError({ message, onRetry }: DailyExegesisErrorProps) {
  return (
    <Button variant="outline" onClick={onRetry} className="mb-4 flex w-full items-center justify-center gap-2">
      <RefreshCcw className="h-4 w-4" />
      {message}
    </Button>
  );
}
