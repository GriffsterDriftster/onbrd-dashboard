import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/db';
import { getKpis } from '@/src/lib/kpis';
import KpiGrid from '@/src/components/KpiGrid';
import { ContainmentChart, OutcomeChart } from '@/src/components/Charts';
import { ensureMembership } from '@/src/lib/tenant';
import { isSubscriptionActive } from '@/src/lib/billing';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress || null;

  const ensured = await ensureMembership(userId, email);
  const memberships = await prisma.membership.findMany({ where: { userId }, include: { client: true }, orderBy: { createdAt: 'asc' } });

  const cookieStore = cookies();
  let activeClientId = cookieStore.get('clientId')?.value || memberships[0]?.clientId || ensured.clientId;
  if (!memberships.find(m => m.clientId === activeClientId)) activeClientId = ensured.clientId;

  const client = await prisma.client.findUnique({ where: { id: activeClientId } });
  if (!client) redirect('/clients');

  const active = await isSubscriptionActive(client.id);
  if (!active) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Subscription required</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Client <strong>{client.name}</strong> doesn&apos;t have an active subscription.</p>
        <Link href="/billing" className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-white">Go to Billing</Link>
      </div>
    );
  }

  const kpis = await getKpis(client.id);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-neutral-600 dark:text-neutral-400">Client: {client.name}</p>
        </div>
        <Link href="/clients" className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5">Switch client</Link>
      </div>

      <KpiGrid
        containment={`${kpis.containment}%`}
        ttfr={`${kpis.ttfr}s`}
        escalation={`${kpis.escalationRate}%`}
        leads={`${kpis.leads}`}
        csat={`${kpis.csat}`}
        cpr={`$${kpis.costPerResolution}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContainmentChart data={kpis.trend} />
        <OutcomeChart data={kpis.outcome} />
      </div>
    </div>
  );
}
