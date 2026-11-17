import { DevotionStickyHeader } from './DevotionStickyHeader';
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  label: string;
  scrolled: boolean;
  refreshing: boolean;
  onBack: () => void;
  onRefresh: () => void;
}

export function UserVerseStickyHeader({ label, ...props }: Props) {
  return <DevotionStickyHeader {...props} title={label} refreshLabel={tt('Refresh verse')} />;
}
