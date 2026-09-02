// TriviaPage layout wrapper
import { ReactNode } from "react";

interface TriviaPageLayoutProps {
  isRtl: boolean;
  dotTexture: ReactNode;
  children: ReactNode;
}

export function TriviaPageLayout({ isRtl, dotTexture, children }: TriviaPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {dotTexture}
      {children}
    </div>
  );
}

interface TriviaContentWrapperProps {
  children: ReactNode;
}

export function TriviaContentWrapper({ children }: TriviaContentWrapperProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-6 sm:py-8 pb-20">
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
