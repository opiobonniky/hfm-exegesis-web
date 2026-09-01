/**
 * HimFirstValues — values/features grid for HimFirstMedia pages.
 * Takes data array as prop — no .map() needed in page.
 */
import { LucideIcon } from "lucide-react";
import { HimFirstGrid } from "./HimFirstGrid";
import { HimFirstCard, HimFirstIconBox } from "./HimFirstCard";
import { HimFirstCardTitle, HimFirstCardDescription, HimFirstCardLongDescription } from "./HimFirstText";

interface HimFirstValueItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HimFirstValuesProps {
  items: HimFirstValueItem[];
  columns?: 2 | 3;
  variant?: "short" | "long";
}

export function HimFirstValues({ items, columns = 3, variant = "short" }: HimFirstValuesProps) {
  const Desc = variant === "long" ? HimFirstCardLongDescription : HimFirstCardDescription;
  return (
    <HimFirstGrid columns={columns}>
      {items.map((v) => (
        <HimFirstCard key={v.title}>
          <HimFirstIconBox>
            <v.icon className="w-6 h-6 text-brand-primary" />
          </HimFirstIconBox>
          <HimFirstCardTitle>{v.title}</HimFirstCardTitle>
          <Desc>{v.description}</Desc>
        </HimFirstCard>
      ))}
    </HimFirstGrid>
  );
}

/**
 * HimFirstFeatureList — horizontal feature cards for goals/mission pages.
 */
interface HimFirstFeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface HimFirstFeatureListProps {
  items: HimFirstFeatureItem[];
}

export function HimFirstFeatureList({ items }: HimFirstFeatureListProps) {
  return (
    <div className="space-y-8">
      {items.map((g) => (
        <HimFirstCard key={g.title} className="flex gap-6">
          <HimFirstIconBox className="w-14 h-14 mb-0">
            <g.icon className="w-7 h-7 text-brand-primary" />
          </HimFirstIconBox>
          <div>
            <HimFirstCardTitle>{g.title}</HimFirstCardTitle>
            <HimFirstCardLongDescription>{g.description}</HimFirstCardLongDescription>
          </div>
        </HimFirstCard>
      ))}
    </div>
  );
}
