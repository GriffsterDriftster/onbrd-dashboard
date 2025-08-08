import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { ensureMembership } from '@/src/lib/tenant';
import { prisma } from '@/src/lib/db';
import { currentUser } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || null;
    const membership = await ensureMembership(userId, email);
    const client = membership.client;

    let existing = await prisma.subscription.findUnique({ where: { clientId: client.id } });
    let customerId = existing?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: { clientId: client.id, clientName: client.name },
      });
      customerId = customer.id;
    }

    const priceId = process.env.STRIPE_PRICE_ID!;
    const seatPriceId = process.env.STRIPE_SEAT_PRICE_ID;
    const success = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/billing`;
    const cancel = success;

    const seats = await prisma.membership.count({ where: { clientId: client.id } });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [{ price: priceId, quantity: 1 }];
    if (seatPriceId) line_items.push({ price: seatPriceId, quantity: Math.max(1, seats) });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items,
      success_url: success,
      cancel_url: cancel,
      metadata: { clientId: client.id },
    });

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}
