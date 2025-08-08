import { prisma } from './db';
export async function ensureMembership(userId: string, email?: string | null) {
  const existing = await prisma.membership.findFirst({ where: { userId }, include: { client: true } });
  if (existing) return existing;

  if (email) {
    const invite = await prisma.pendingInvite.findFirst({ where: { email: email.toLowerCase() } });
    if (invite) {
      const membership = await prisma.membership.create({ data: { userId, clientId: invite.clientId, role: invite.role }, include: { client: true } });
      await prisma.pendingInvite.delete({ where: { id: invite.id } });
      return membership;
    }
  }
  const client = await prisma.client.upsert({ where: { name: 'Demo Client' }, update: {}, create: { name: 'Demo Client' } });
  return prisma.membership.create({ data: { userId, clientId: client.id, role: 'member' }, include: { client: true } });
}
