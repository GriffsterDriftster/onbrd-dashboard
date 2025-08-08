import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { ensureMembership } from '@/src/lib/tenant';
import { prisma } from '@/src/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url));

    const m = await ensureMembership(userId);
    const clientId = m.clientId;

    const sub = await prisma.subscription.findUnique({ where: { clientId } });
    if (!sub) return NextResponse.json({ error: 'No subscription' }, { status: 400 });

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/billing`,
    });

    return NextResponse.redirect(portal.url, { status: 303 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 });
  }
}
