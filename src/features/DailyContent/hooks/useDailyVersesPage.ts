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
  const [loadedPage, setLoadedPage] = useState(-1);
  const [revision, setRevision] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookName, setBookName] = useState('');
  const [chapter, setChapter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DailyItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const generation = useRef(0);
  const load = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await adminApi.request('admin', 'get-all-daily-verses', {
        page, size: PAGE_SIZE, smartDefault: false, listPreview: true,
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        ...(bookName ? { exactBookName: bookName } : {}),
        ...(bookName && chapter ? { chapter: Number(chapter) } : {}),
        ...(search ? { search } : {}),
      });
      if (request !== generation.current) return;
      if (response?.returnCode !== 200 || !Array.isArray(response.returnData?.content)) throw new Error('Unavailable');
      const incoming: DailyItem[] = response.returnData.content;
      setContent(previous => Array.from(new Map(
        [...(page === 0 ? [] : previous), ...incoming].map(item => [item.id, item]),
      ).values()));
      setTotal(response.returnData.totalElements || 0);
      setLoadedPage(page);
    } catch {
      if (request === generation.current) setLoadError(true);
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [page, startDate, endDate, bookName, chapter, search]);
  useEffect(() => { void load(); return () => { generation.current++; }; }, [load, revision]);
  const hasMore = loadedPage >= 0 && (loadedPage + 1) * PAGE_SIZE < total;
  const loadMore = useCallback(() => {
    if (loading || loadError || !hasMore || searchInput.trim() !== search) return;
    setPage(current => current === loadedPage ? current + 1 : current);
  }, [hasMore, loadedPage, loadError, loading, search, searchInput]);
  const retry = () => setRevision(current => current + 1);
  useEffect(() => {
    if (searchInput.trim() === search) return;
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, search]);
  const changeStartDate = (date: string) => { setStartDate(date); setPage(0); };
  const changeEndDate = (date: string) => { setEndDate(date); setPage(0); };
  const changeBook = (book: string) => { setBookName(book); setChapter(''); setPage(0); };
  const changeChapter = (next: string) => { setChapter(next); setPage(0); };
  const clearFilters = () => {
    setStartDate(''); setEndDate(''); setBookName(''); setChapter(''); setSearchInput(''); setSearch(''); setPage(0);
  };
  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      const response = await adminApi.request('admin', 'delete-daily-verse', { verseId: deleteTarget.id });
      if (response?.returnCode !== 200) throw new Error('Delete failed');
      setDeleteTarget(null);
      setPage(0);
      setRevision(current => current + 1);
      toast({ title: tt('Deleted') });
    } catch { toast({ title: tt('Delete failed'), variant: 'destructive' }); }
    finally { setDeleting(false); }
  };
  const openVerse = async (id: number, edit: boolean) => {
    try {
      const result = await adminApi.request('admin', 'get-all-daily-verses', { id, size: 1 }, { includeLanguage: false });
      const verse = result?.returnData?.content?.[0];
      if (result?.returnCode !== 200 || !verse) throw new Error('Verse unavailable');
      if (edit) navigate(routes.addDailyVerse.path, { state: { verse } });
      else navigate(`${routes.dailyVerseDetail.path}?verse=${encodeURIComponent(JSON.stringify(verse))}`);
    } catch { toast({ title: tt('Failed to load content'), variant: 'destructive' }); }
  };
  return { content, total, page, hasMore, loadMore, loadError, retry, startDate, endDate, changeStartDate, changeEndDate, loading, deleteTarget,
    bookName, chapter, search: searchInput, changeBook, changeChapter, changeSearch: setSearchInput, clearFilters,
    setDeleteTarget, deleting, confirmDelete,
    add: () => navigate(routes.addDailyVerse.path),
    edit: (verse: DailyItem) => openVerse(verse.id, true),
    view: (verse: DailyItem) => openVerse(verse.id, false),
  };
}
