import { prisma } from './db';
export async function isSubscriptionActive(clientId: string) {
  const sub = await prisma.subscription.findUnique({ where: { clientId } });
  if (!sub) return false;
  return ['active','trialing','past_due'].includes(sub.status);
}
