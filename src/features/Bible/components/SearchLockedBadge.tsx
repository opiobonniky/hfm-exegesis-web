/**
 * SearchLockedBadge — locked feature badge with padding.
 */
import LockedFeatureBadge from "@/components/LockedFeatureBadge";

interface SearchLockedBadgeProps {
  featureName: string;
  featureDescription: string;
}

export function SearchLockedBadge({ featureName, featureDescription }: SearchLockedBadgeProps) {
  return (
    <div className="px-4 sm:px-6 py-4">
      <LockedFeatureBadge featureName={featureName} featureDescription={featureDescription} />
    </div>
  );
}
