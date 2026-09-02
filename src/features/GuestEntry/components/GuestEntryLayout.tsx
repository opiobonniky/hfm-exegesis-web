import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function GuestEntryLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        {children}
      </div>
    </div>
  );
}
