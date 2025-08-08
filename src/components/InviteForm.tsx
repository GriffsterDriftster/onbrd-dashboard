'use client';
import { useState } from 'react';

export default function InviteForm({ clientId }: { clientId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInviteUrl(null); setError(null); setLoading(true);
    try {
      const res = await fetch('/api/invites/create', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setInviteUrl(data.inviteUrl);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md space-y-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
      <label className="block">
        <span className="text-sm text-neutral-600">Email</span>
        <input value={email} onChange={e=>setEmail(e.target.value)} required type="email" className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:bg-neutral-900 dark:border-neutral-700" />
      </label>
      <label className="block">
        <span className="text-sm text-neutral-600">Role</span>
        <select value={role} onChange={e=>setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 dark:bg-neutral-900 dark:border-neutral-700">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <button disabled={loading} className="rounded-lg bg-brand px-4 py-2 text-white">{loading ? 'Creating…' : 'Create invite'}</button>
      {inviteUrl && <div className="text-sm"><span className="font-medium">Invite link:</span> <a className="underline break-all" href={inviteUrl} target="_blank" rel="noreferrer">{inviteUrl}</a></div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </form>
  );
}
