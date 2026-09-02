import React from "react";

interface LabPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const LabPageWrapper: React.FC<LabPageWrapperProps> = ({ children, className }) => (
  <div className={`min-h-screen flex flex-col bg-background ${className ?? ""}`.trim()}>
    {children}
  </div>
);
