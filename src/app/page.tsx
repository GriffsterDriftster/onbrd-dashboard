import Link from 'next/link';
import { prisma } from '@/src/lib/db';
import { getKpis } from '@/src/lib/kpis';
import { Brain, Timer, Handshake, BarChart3 } from 'lucide-react';

function Stat({ label, value, Icon }: { label: string; value: string; Icon: any }) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white/70 dark:bg-neutral-900/60">
      <div className="flex items-center gap-3">
        <Icon aria-hidden className="h-5 w-5" />
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-400">{label}</div>
          <div className="text-2xl font-semibold" aria-live="polite">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  let client = await prisma.client.findFirst();
  if (!client) client = await prisma.client.create({ data: { name: 'Demo Client' } });
  const k = await getKpis(client.id);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900">
        <h2 className="text-3xl font-bold">Welcome</h2>
        <p className="mt-2 max-w-prose text-neutral-700 dark:text-neutral-300">
          Track chatbot performance for your clients. Use the demo data or connect Intercom to feed real conversations.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-flex items-center rounded-lg bg-brand px-4 py-2 text-white">Open Dashboard</Link>
          <Link href="/clients" className="inline-flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2">Clients</Link>
          <Link href="/billing" className="inline-flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2">Billing</Link>
        </div>
      </section>
      <section aria-labelledby="quick-stats" className="space-y-4">
        <h3 id="quick-stats" className="text-lg font-semibold">Quick stats (Demo Client)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Containment" value={`${k.containment}%`} Icon={Brain} />
          <Stat label="TTFR" value={`${k.ttfr}s`} Icon={Timer} />
          <Stat label="Escalation" value={`${k.escalationRate}%`} Icon={Handshake} />
          <Stat label="Total conversations" value={`${k.totals.total}`} Icon={BarChart3} />
        </div>
      </section>
    </div>
  );
}
