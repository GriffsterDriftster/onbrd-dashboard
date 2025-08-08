import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/db';

export default async function BillingPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const cookieStore = cookies();
  const clientId = cookieStore.get('clientId')?.value || (await prisma.membership.findFirst({ where: { userId } }))?.clientId;
  if (!clientId) redirect('/clients');

  const sub = await prisma.subscription.findUnique({ where: { clientId } });
  const status = sub?.status ?? 'none';
  const seats = await prisma.membership.count({ where: { clientId } });
  const hasActive = sub && ['active','trialing','past_due'].includes(sub.status);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Billing</h2>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900 space-y-3">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Seats:</strong> {seats}</p>
        <div className="flex gap-3">
          {hasActive ? (
            <>
              <form action="/api/stripe/portal" method="post"><button className="rounded-lg bg-brand px-4 py-2 text-white" type="submit">Manage billing</button></form>
              <form action="/api/stripe/sync-seats" method="post"><button className="rounded-lg border px-4 py-2" type="submit">Sync seats</button></form>
            </>
          ) : (
            <form action="/api/stripe/checkout" method="post"><button className="rounded-lg bg-brand px-4 py-2 text-white" type="submit">Subscribe</button></form>
          )}
        </div>
      </div>
      {!process.env.STRIPE_SECRET_KEY && (<p className="text-sm text-red-600">STRIPE_* env vars are missing. Add them in .env to enable checkout.</p>)}
    </div>
  );
}
