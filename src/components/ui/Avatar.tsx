"use client";

import { cn } from "@/lib/utils";

const PALETTE = [
  "#d97706", "#0891b2", "#7c3aed", "#059669",
  "#dc2626", "#2563eb", "#0d9488",
];

const avatarColor = (seed: string) => {
  let h = 0;
  for (const c of seed) h += c.charCodeAt(0);
  return PALETTE[h % PALETTE.length];
};

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  username?: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  firstName = "",
  lastName = "",
  username = "",
  src,
  size = "md",
  className,
}: AvatarProps) {
  const initials = `${firstName?.[0] ?? "?"}${lastName?.[0] ?? ""}`.toUpperCase();
  const seed = username || firstName;
  const bg = avatarColor(seed);

  const sizeClasses = {
    sm: "w-7 h-7 text-[10px]",
    md: "w-8 h-8 text-[11px]",
    lg: "w-10 h-10 text-xs",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={cn(
          "rounded-full object-cover shrink-0",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}
