import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/db';
import Link from 'next/link';

export default async function ClientsPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { client: true },
    orderBy: { createdAt: 'asc' }
  });
  const cookieStore = cookies();
  const current = cookieStore.get('clientId')?.value;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your clients</h2>
        <Link href="/clients/invite" className="rounded-lg bg-brand px-3 py-1.5 text-white">Invite user</Link>
      </div>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {memberships.map(m => (
          <li key={m.clientId} className="flex items-center justify-between p-4">
            <div>
              <div className="font-medium">{m.client.name}</div>
              <div className="text-sm text-neutral-500">Role: {m.role}</div>
            </div>
            <div className="flex items-center gap-2">
              {current === m.clientId && <span className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">Active</span>}
              <a className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5" href={`/clients/select?id=${m.clientId}`}>Make active</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
