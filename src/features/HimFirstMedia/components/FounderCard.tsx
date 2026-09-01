/**
 * FounderCard — founder bio card with avatar, name, role, and bio.
 */
import { HimFirstAvatar } from "./HimFirstCard";

interface FounderCardProps {
  name: string;
  role: string;
  bio: string;
  reverse?: boolean;
}

export function FounderCard({ name, role, bio, reverse }: FounderCardProps) {
  return (
    <div className={`flex flex-col ${reverse ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 sm:gap-12 items-center`}>
      <HimFirstAvatar initial={name.charAt(0)} size="lg" />
      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-brand-primary mb-1 font-[family-name:var(--font-heading)]">{name}</h3>
        <p className="text-sm font-black text-brand-accent uppercase tracking-widest mb-4">{role}</p>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">{bio}</p>
      </div>
    </div>
  );
}
