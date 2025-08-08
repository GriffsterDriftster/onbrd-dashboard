import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/src/lib/db';
import { ensureMembership } from '@/src/lib/tenant';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

    const membership = await ensureMembership(userId);
    const clientId = membership.clientId;

    const seatPriceId = process.env.STRIPE_SEAT_PRICE_ID;
    if (!seatPriceId) return NextResponse.json({ error: 'No STRIPE_SEAT_PRICE_ID set' }, { status: 400 });

    const sub = await prisma.subscription.findUnique({ where: { clientId } });
    if (!sub) return NextResponse.json({ error: 'No subscription' }, { status: 400 });

    const seats = await prisma.membership.count({ where: { clientId } });

    const subscription = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const seatItem = subscription.items.data.find(i => i.price.id === seatPriceId);
    if (!seatItem) return NextResponse.json({ error: 'Seat item not found on subscription' }, { status: 400 });

    await stripe.subscriptionItems.update(seatItem.id, { quantity: Math.max(1, seats), proration_behavior: 'create_prorations' });

    return NextResponse.json({ ok: true, seats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}
