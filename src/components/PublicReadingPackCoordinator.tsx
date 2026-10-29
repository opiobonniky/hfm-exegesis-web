import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from './languages/languageProvider';
import { syncPublicPack } from '@/services/publicReadingPacks';

export function PublicReadingPackCoordinator() {
  const { isAuthenticated, isGuest, loading } = useAuth();
  const { lang } = useLanguage();
  useEffect(() => {
    if (loading || (!isAuthenticated && !isGuest)) return;
    const sync = () => {
      void syncPublicPack('books', 'en');
      void syncPublicPack('overview', lang);
    };
    sync();
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [isAuthenticated, isGuest, loading, lang]);
  return null;
}
