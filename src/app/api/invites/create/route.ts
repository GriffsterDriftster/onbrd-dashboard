import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/src/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, email, role } = await req.json();
  if (!clientId || !email) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const me = await prisma.membership.findFirst({ where: { userId, clientId } });
  if (!me || me.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const token = crypto.randomBytes(24).toString('hex');
  await prisma.pendingInvite.create({ data: { clientId, email: String(email).toLowerCase(), role: role || 'member', token } });

  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  const inviteUrl = `${base}/api/invites/accept?token=${token}`;
  return NextResponse.json({ ok: true, inviteUrl });
}
