import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/src/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ items: [] }, { status: 200 });
  const list = await prisma.membership.findMany({ where: { userId }, include: { client: true }, orderBy: { createdAt: 'asc' } });
  const active = cookies().get('clientId')?.value;
  return NextResponse.json({ items: list.map(m => ({ clientId: m.clientId, clientName: m.client.name, active: m.clientId === active })) });
}
