import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StudyWordEditor } from '../components/StudyWordEditor';
import { wordStudyApi } from '../services/studyToolsApi';
import type { WordEntry } from '../types';
import { tt } from '@/components/languages/hardcodedTranslate';

export default function AddStudyWord() {
  const navigate = useNavigate();
  const { strongsId } = useParams<{ strongsId: string }>();
  const [word, setWord] = useState<WordEntry | null>(null);
  const [loading, setLoading] = useState(Boolean(strongsId));
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setWord(null); setError(''); setLoading(Boolean(strongsId));
    if (!strongsId) return;
    // The admin list returns canonical source copy, not translated reader text.
    void wordStudyApi.search(strongsId, undefined, 0, 100).then(result => {
      if (!active) return;
      if (result.returnCode !== 200) throw new Error(result.returnMessage || 'Could not load word');
      const entry = (result.returnData?.data as WordEntry[] || []).find(item => item.strongsId === strongsId);
      if (!entry) throw new Error('Study word not found');
      setWord(entry);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'Could not load word'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [strongsId, retry]);
  const back = () => navigate('/admin/study-tools');
  if (loading) return <div className="mx-auto max-w-6xl p-6" role="status">{tt('Loading study word...')}</div>;
  if (error) return <div className="mx-auto max-w-6xl space-y-4 p-6"><p role="alert">{tt(error)}</p><Button onClick={() => setRetry(value => value + 1)}>{tt('Try again')}</Button><Button variant="outline" onClick={back}>{tt('Back to word studies')}</Button></div>;
  return <StudyWordEditor key={strongsId || 'new'} word={word} onClose={back} onSaved={() => {}} />;
}
