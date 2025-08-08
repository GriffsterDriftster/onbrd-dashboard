import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  const { userId } = auth();
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!email) return NextResponse.json({ error: 'Email missing' }, { status: 400 });

  const invite = await prisma.pendingInvite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: 'Invalid or used invite' }, { status: 400 });
  if (invite.email !== email) return NextResponse.json({ error: 'Invite email mismatch' }, { status: 403 });

  await prisma.membership.upsert({
    where: { userId_clientId: { userId, clientId: invite.clientId } },
    update: { role: invite.role },
    create: { userId, clientId: invite.clientId, role: invite.role },
  });
  await prisma.pendingInvite.delete({ where: { id: invite.id } });

  const res = NextResponse.redirect(new URL('/clients', req.url));
  res.cookies.set('clientId', invite.clientId, { path: '/', httpOnly: false, sameSite: 'lax' });
  return res;
}
