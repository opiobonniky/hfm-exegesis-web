import { Link } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { displayDate } from '@/services/numberLocale/format';
import { tt } from '@/components/languages/hardcodedTranslate';

/** Audit-only archive: no activate, role, verification or deletion controls. */
export default function AdminDeletedUsers() {
  const { data, actions } = useAdminUsers('deleted');
  return <main className="mx-auto max-w-6xl space-y-5 p-6">
    <Link to="/admin/users" className="text-primary underline">{tt('Back to User Management')}</Link>
    <h1 className="text-2xl font-bold">{tt('Deleted accounts')}</h1>
    <p className="text-sm text-muted-foreground">{tt('Read-only account archive. These accounts cannot sign in and are excluded from the normal user list.')}</p>
    <input aria-label={tt('Search deleted accounts')} placeholder={tt('Search deleted accounts')} value={data.search} onChange={event => actions.setSearch(event.target.value)} className="w-full rounded border bg-background p-3" />
    {data.loading && <p role="status">{tt('Loading…')}</p>}
    <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead><tr><th className="p-3">{tt('Name')}</th><th className="p-3">{tt('Archived email')}</th><th className="p-3">{tt('Joined')}</th></tr></thead>
      <tbody>{data.users.map(user => <tr key={user.id} className="border-t"><td className="p-3">{[user.firstName, user.lastName].filter(Boolean).join(' ') || user.username}</td><td className="p-3">{user.email}</td><td className="p-3">{displayDate(user.createdOn)}</td></tr>)}</tbody>
    </table></div>
    {!data.loading && !data.users.length && <p>{tt('No deleted accounts found')}</p>}
    <div ref={data.sentinelRef} />
  </main>;
}
