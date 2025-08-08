import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/src/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('stripe-signature') as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const clientId = (session.metadata?.clientId) as string | undefined;
        if (!clientId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await prisma.subscription.upsert({
          where: { clientId },
          update: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id || '',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          create: {
            clientId,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id || '',
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handling failed', err);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
