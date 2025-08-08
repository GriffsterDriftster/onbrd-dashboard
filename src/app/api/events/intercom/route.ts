import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const expected = process.env.DASHBOARD_AUTH_TOKEN;
    if (expected && authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { clientName, conversationId, startedAt, resolvedAt, resolvedBy, escalated, firstResponseSeconds, leadCaptured, csat, costCents } = body;
    if (!clientName || !conversationId || !startedAt || !resolvedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const client = await prisma.client.upsert({ where: { name: clientName }, update: {}, create: { name: clientName } });
    const dayKey = new Date(startedAt).toISOString().slice(0, 10);

    await prisma.conversation.upsert({
      where: { id: conversationId },
      update: {
        clientId: client.id, startedAt: new Date(startedAt),
        resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
        resolvedBy, escalated: Boolean(escalated),
        firstResponseSeconds: Number(firstResponseSeconds || 0),
        leadCaptured: Boolean(leadCaptured),
        csat: csat != null ? Number(csat) : null,
        costCents: Number(costCents || 0),
        dayKey,
      },
      create: {
        id: conversationId, clientId: client.id, startedAt: new Date(startedAt),
        resolvedAt: resolvedAt ? new Date(resolvedAt) : null,
        resolvedBy, escalated: Boolean(escalated),
        firstResponseSeconds: Number(firstResponseSeconds || 0),
        leadCaptured: Boolean(leadCaptured),
        csat: csat != null ? Number(csat) : null,
        costCents: Number(costCents || 0),
        dayKey,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
