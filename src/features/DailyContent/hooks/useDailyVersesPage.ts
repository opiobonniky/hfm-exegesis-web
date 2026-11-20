import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/features/Admin/services/adminApi';
import type { DailyItem } from '@/features/Admin/types';
import { PAGE_SIZE } from '@/features/Admin/constants';
import { routes } from '@/components/Routes/routes';
import { tt } from '@/components/languages/hardcodedTranslate';

export function useDailyVersesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<DailyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchDate, setSearchDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<DailyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    try {
      const response = await adminApi.request('admin', 'get-all-daily-verses', {
        page, size: PAGE_SIZE, smartDefault: false,
        ...(searchDate ? { startDate: searchDate, endDate: searchDate } : {}),
      });
      if (request !== generation.current) return;
      if (response?.returnCode !== 200 || !response.returnData) throw new Error('Unavailable');
      setContent(response.returnData.content || []);
      setTotal(response.returnData.totalElements || 0);
    } catch {
      if (request === generation.current) {
        setContent([]); setTotal(0);
        toast({ title: tt('Failed to load content'), variant: 'destructive' });
      }
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [page, searchDate, toast]);
  useEffect(() => { void load(); return () => { generation.current++; }; }, [load]);
  const changeDate = (date: string) => { setSearchDate(date); setPage(0); };
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const response = await adminApi.request('admin', 'delete-daily-verse', { verseId: deleteTarget.id });
      if (response?.returnCode !== 200) throw new Error('Delete failed');
      setDeleteTarget(null);
      if (content.length === 1 && page > 0) setPage(page - 1);
      else await load();
      toast({ title: tt('Deleted') });
    } catch { toast({ title: tt('Delete failed'), variant: 'destructive' }); }
    finally { setDeleting(false); }
  };
  return { content, total, page, setPage, searchDate, changeDate, loading, deleteTarget,
    setDeleteTarget, deleting, confirmDelete,
    add: () => navigate(routes.addDailyVerse.path),
    edit: (verse: DailyItem) => navigate(routes.addDailyVerse.path, { state: { verse } }),
    view: (verse: DailyItem) => navigate(`${routes.dailyVerseDetail.path}?verse=${encodeURIComponent(JSON.stringify(verse))}`),
  };
}
