import { Navigate, useSearchParams } from 'react-router-dom';
import { routes } from './routes';

/** Compatibility only; the combined manager and tab interface have been removed. */
export default function LegacyDailyContentRedirect() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  return <Navigate replace to={tab === 'devotions' ? routes.dailyDevotions.path
    : tab === 'exegesis' ? routes.adminDailyExegesis.path : routes.adminDailyVerses.path} />;
}
