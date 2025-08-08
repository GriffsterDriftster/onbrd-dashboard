import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, sinceISO, limit = 50, conversations } = body || {};
    if (!clientName) return NextResponse.json({ error: 'clientName is required' }, { status: 400 });

    const client = await prisma.client.upsert({ where: { name: clientName }, update: {}, create: { name: clientName } });

    const token = process.env.INTERCOM_ACCESS_TOKEN;
    let imported = 0;

    if (token && !conversations) {
      const since = sinceISO ? `&updated_at_after=${encodeURIComponent(sinceISO)}` : '';
      const resp = await fetch(`https://api.intercom.io/conversations?per_page=${limit}${since}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!resp.ok) {
        const text = await resp.text();
        return NextResponse.json({ error: 'Intercom API error', details: text }, { status: 502 });
      }
      const data = await resp.json();
      const items = data.conversations || data.data || [];
      for (const c of items) {
        const id = String(c.id || c.uuid || c.conversation_id);
        const startedAt = new Date(c.created_at ? c.created_at * 1000 : Date.now());
        const resolvedAt = c.updated_at ? new Date(c.updated_at * 1000) : null;
        const resolvedBy = c.state === 'closed' && c.source?.delivered_as === 'automation' ? 'bot' : 'human';
        const escalated = Boolean(c.open || c.waiting_since);
        const firstResponseSeconds = 2;
        const leadCaptured = Boolean(c.custom_attributes?.lead_captured);
        const csat = c.custom_attributes?.csat_score ? Number(c.custom_attributes.csat_score) : null;
        const costCents = 0;
        const dayKey = startedAt.toISOString().slice(0,10);

        await prisma.conversation.upsert({
          where: { id },
          update: { clientId: client.id, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents, dayKey },
          create: { id, clientId: client.id, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents, dayKey },
        });
        imported++;
      }
    } else if (Array.isArray(conversations)) {
      for (const c of conversations) {
        const id = String(c.id);
        const startedAt = new Date(c.startedAt);
        const resolvedAt = c.resolvedAt ? new Date(c.resolvedAt) : null;
        const resolvedBy = c.resolvedBy || 'bot';
        const escalated = Boolean(c.escalated);
        const firstResponseSeconds = Number(c.firstResponseSeconds || 0);
        const leadCaptured = Boolean(c.leadCaptured);
        const csat = c.csat != null ? Number(c.csat) : null;
        const costCents = Number(c.costCents || 0);
        const dayKey = startedAt.toISOString().slice(0,10);

        await prisma.conversation.upsert({
          where: { id },
          update: { clientId: client.id, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents, dayKey },
          create: { id, clientId: client.id, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents, dayKey },
        });
        imported++;
      }
    } else {
      return NextResponse.json({ error: 'Set INTERCOM_ACCESS_TOKEN or provide `conversations` array.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, imported });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
