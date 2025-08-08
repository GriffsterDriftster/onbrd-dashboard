import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/db';
import InviteForm from '@/src/components/InviteForm';

export default async function InvitePage() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const cookieStore = cookies();
  const activeId = cookieStore.get('clientId')?.value || (await prisma.membership.findFirst({ where: { userId } }))?.clientId;
  if (!activeId) redirect('/clients');

  const membership = await prisma.membership.findFirst({ where: { userId, clientId: activeId }, include: { client: true } });
  if (!membership) redirect('/clients');
  if (membership.role !== 'admin') {
    return <p className="text-red-600">You must be an admin of {membership.client.name} to invite users.</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Invite a user to {membership.client.name}</h2>
      <InviteForm clientId={membership.clientId} />
    </div>
  );
}
