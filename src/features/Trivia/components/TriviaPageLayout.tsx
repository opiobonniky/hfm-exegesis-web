// TriviaPage layout wrapper
import { ReactNode } from "react";

interface TriviaPageLayoutProps {
  isRtl: boolean;
  dotTexture: ReactNode;
  children: ReactNode;
}

export function TriviaPageLayout({ isRtl, dotTexture, children }: TriviaPageLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#e2eaf1] dark:bg-[hsl(222_47%_5%)]" dir={isRtl ? "rtl" : "ltr"}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,91,117,0.18),transparent_34%),radial-gradient(circle_at_10%_70%,rgba(58,91,117,0.1),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,hsl(212_63%_56%_/_0.14),transparent_34%),radial-gradient(circle_at_10%_70%,hsl(203_31%_35%_/_0.2),transparent_30%)]" />
      {dotTexture}
      <div className="relative">{children}</div>
    </div>
  );
}

interface TriviaContentWrapperProps {
  children: ReactNode;
}

export function TriviaContentWrapper({ children }: TriviaContentWrapperProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-6 sm:px-8 sm:py-8">
        {children}
      </div>
    </div>
  );
}

interface TriviaDotTextureProps {
  primaryColor: string;
  backgroundSize: string;
}

export function TriviaDotTexture({ primaryColor, backgroundSize }: TriviaDotTextureProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, ${primaryColor} 1px, transparent 0)`,
        backgroundSize,
      }}
    />
  );
}
