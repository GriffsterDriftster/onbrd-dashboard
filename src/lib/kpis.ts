import { prisma } from './db';
export async function getKpis(clientId: string) {
  const total = await prisma.conversation.count({ where: { clientId } });
  const bot = await prisma.conversation.count({ where: { clientId, resolvedBy: 'bot' } });
  const escalated = await prisma.conversation.count({ where: { clientId, escalated: true } });
  const leads = await prisma.conversation.count({ where: { clientId, leadCaptured: true } });
  const csatAgg = await prisma.conversation.aggregate({ where: { clientId, csat: { not: null } }, _avg: { csat: true } });
  const costAgg = await prisma.conversation.aggregate({ where: { clientId, resolvedBy: 'bot' }, _avg: { costCents: true } });
  const ttfrAgg = await prisma.conversation.aggregate({ where: { clientId }, _avg: { firstResponseSeconds: true } });

  const containment = total > 0 ? Math.round((bot / total) * 100) : 0;
  const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0;

  const trendRaw = await prisma.conversation.groupBy({ by: ['dayKey'], where: { clientId }, _count: { _all: true } });
  const botByDay = await prisma.conversation.groupBy({ by: ['dayKey'], where: { clientId, resolvedBy: 'bot' }, _count: { _all: true } });

  const botMap = new Map<string, number>(); for (const row of botByDay) botMap.set(row.dayKey, row._count._all);
  const trend = trendRaw.sort((a,b)=>a.dayKey.localeCompare(b.dayKey)).slice(-14).map(row => ({
    day: row.dayKey,
    containment: row._count._all ? Math.round(((botMap.get(row.dayKey) || 0) / row._count._all) * 100) : 0,
  }));

  const outcome = [
    { name: 'Bot-resolved', value: bot },
    { name: 'Human-resolved', value: total - bot },
    { name: 'Escalated', value: escalated },
  ];

  return {
    totals: { total },
    containment,
    ttfr: Math.round((ttfrAgg._avg.firstResponseSeconds || 0)).toString(),
    escalationRate,
    leads,
    csat: csatAgg._avg.csat ? Number(csatAgg._avg.csat).toFixed(2) : '–',
    costPerResolution: costAgg._avg.costCents ? (Number(costAgg._avg.costCents) / 100).toFixed(2) : '0.00',
    trend,
    outcome,
  };
}
