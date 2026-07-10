import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key, { apiVersion: '2023-10-16' as any });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabase = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;

      if (userId && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const sub = subscription as any;
        await supabase.from('profiles').update({
          subscription_tier: tier === 'monthly' ? 'pro_monthly' : 'pro_yearly',
          subscription_status: 'active',
          stripe_subscription_id: subscription.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('id', userId);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
          subscription_status: 'past_due',
        }).eq('id', profile.id);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (profile) {
        await supabase.from('profiles').update({
          subscription_tier: 'free',
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        }).eq('id', profile.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
