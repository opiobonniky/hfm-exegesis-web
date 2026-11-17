import { Copy, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tt } from '@/components/languages/hardcodedTranslate';

interface Props {
  label: string;
  liked: boolean;
  onCopy: () => void;
  onShare: () => void;
  onLike: () => void;
}

export function DailyReadingActions({ label, liked, onCopy, onShare, onLike }: Props) {
  return <div className="devotion-actions" role="group" aria-label={label}>
    <Button variant="outline" size="sm" onClick={onCopy}><Copy aria-hidden="true" />{tt('Copy')}</Button>
    <Button variant="outline" size="sm" onClick={onShare}><Share2 aria-hidden="true" />{tt('Share')}</Button>
    <Button variant="outline" size="sm" onClick={onLike} aria-pressed={liked} className={liked ? 'devotion-liked' : undefined}>
      <Heart aria-hidden="true" className={liked ? 'fill-current' : undefined} />{tt(liked ? 'Liked' : 'Like')}
    </Button>
  </div>;
}
