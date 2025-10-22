import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sendDonationReceipt } from '@/lib/email/resend'

// Lazy initialize Stripe to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

// Lazy initialize Supabase to avoid build-time errors
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase configuration is not complete');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const supabase = getSupabaseClient();
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Check if this is a donation or ticket purchase
        if (session.metadata?.type === 'donation') {
          await handleDonationCheckout(session, supabase)
        } else {
          // Handle ticket purchase
          const ticketRecordId = session.metadata?.ticket_record_id
          const eventId = session.metadata?.event_id

          if (!ticketRecordId || !eventId) {
            console.error('Missing metadata in checkout session')
            break
          }

          // Update ticket record to paid status
          const { error: updateError } = await supabase
            .from('event_tickets')
            .update({
              status: 'paid',
              stripe_payment_intent_id: session.payment_intent as string,
              stripe_customer_id: session.customer as string,
            })
            .eq('id', ticketRecordId)

          if (updateError) {
            console.error('Error updating ticket record:', updateError)
            break
          }

          console.log(`✅ Ticket ${ticketRecordId} marked as paid`)

          // TODO: Send confirmation email to buyer
        }

        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const ticketRecordId = session.metadata?.ticket_record_id

        if (!ticketRecordId) {
          console.error('Missing metadata in expired session')
          break
        }

        // Mark ticket as cancelled if session expired
        await supabase
          .from('event_tickets')
          .update({ status: 'cancelled' })
          .eq('id', ticketRecordId)
          .eq('status', 'pending') // Only update if still pending

        console.log(`⏰ Ticket ${ticketRecordId} cancelled due to session expiration`)

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (!paymentIntentId) break

        // Update ticket to refunded status
        const { error: refundError } = await supabase
          .from('event_tickets')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent_id', paymentIntentId)

        if (refundError) {
          console.error('Error updating ticket to refunded:', refundError)
          break
        }

        console.log(`💰 Ticket refunded for payment intent ${paymentIntentId}`)

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription && invoice.billing_reason !== 'subscription_create') {
          await handleRecurringDonation(invoice, supabase, stripe)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancelled(subscription, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle donation checkout completion
 */
async function handleDonationCheckout(
  session: Stripe.Checkout.Session,
  supabase: ReturnType<typeof getSupabaseClient>
) {
  const metadata = session.metadata

  if (!metadata) {
    console.error('No metadata in donation checkout session')
    return
  }

  const isRecurring = session.mode === 'subscription'

  // Create donation record
  const donationData = {
    stripe_payment_intent_id: isRecurring ? null : (session.payment_intent as string),
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: isRecurring ? (session.subscription as string) : null,
    user_id: metadata.user_id || null,
    amount: session.amount_total || 0,
    currency: session.currency || 'usd',
    status: 'succeeded',
    donation_type: metadata.donation_type || 'general',
    is_recurring: isRecurring,
    recurring_interval: isRecurring ? metadata.frequency : null,
    student_grade: metadata.student_grade || null,
    campus: metadata.campus || null,
    donor_name: metadata.donor_name,
    donor_email: metadata.donor_email,
    is_anonymous: metadata.is_anonymous === 'true',
    message: metadata.message || null,
    metadata: metadata,
  }

  const { error } = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error creating donation record:', error)
    throw error
  }

  console.log('✅ Donation record created successfully')

  // Send donation receipt email
  if (metadata.donor_email && metadata.donor_name) {
    await sendDonationReceipt({
      donorName: metadata.donor_name,
      donorEmail: metadata.donor_email,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      donationType: metadata.donation_type || 'general',
      isRecurring: isRecurring,
      recurringInterval: isRecurring ? metadata.frequency : null,
      transactionId: (isRecurring ? session.subscription : session.payment_intent) as string,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      studentName: metadata.student_name || null,
      studentGrade: metadata.student_grade || null,
      campus: metadata.campus || null,
      message: metadata.message || null,
    })
  }
}

/**
 * Handle recurring donation invoice payment
 */
async function handleRecurringDonation(
  invoice: Stripe.Invoice,
  supabase: ReturnType<typeof getSupabaseClient>,
  stripe: Stripe
) {
  if (!invoice.subscription) return

  const subscriptionId = invoice.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const metadata = subscription.metadata

  const donationData = {
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_customer_id: invoice.customer as string,
    stripe_subscription_id: subscriptionId,
    user_id: metadata?.user_id || null,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: 'succeeded',
    donation_type: metadata?.donation_type || 'general',
    is_recurring: true,
    recurring_interval: metadata?.frequency || null,
    student_grade: metadata?.student_grade || null,
    campus: metadata?.campus || null,
    donor_name: metadata?.donor_name || null,
    donor_email: metadata?.donor_email || null,
    is_anonymous: metadata?.is_anonymous === 'true',
    message: metadata?.message || null,
    metadata: metadata,
  }

  const { error } = await supabase.from('donations').insert(donationData)

  if (error) {
    console.error('Error creating recurring donation record:', error)
    throw error
  }

  console.log('✅ Recurring donation recorded')

  // Send donation receipt email for recurring payment
  if (metadata?.donor_email && metadata?.donor_name) {
    await sendDonationReceipt({
      donorName: metadata.donor_name,
      donorEmail: metadata.donor_email,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      donationType: metadata.donation_type || 'general',
      isRecurring: true,
      recurringInterval: metadata.frequency || null,
      transactionId: invoice.payment_intent as string,
      date: new Date(invoice.created * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      studentName: metadata.student_name || null,
      studentGrade: metadata.student_grade || null,
      campus: metadata.campus || null,
      message: metadata.message || null,
    })
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(
  subscription: Stripe.Subscription,
  supabase: ReturnType<typeof getSupabaseClient>
) {
  const { error } = await supabase
    .from('donations')
    .update({ status: 'cancelled' } as any)
    .eq('stripe_subscription_id', subscription.id)
    .eq('status', 'succeeded')

  if (error) {
    console.error('Error updating cancelled subscription:', error)
  }

  console.log('✅ Subscription cancelled in database')
}
