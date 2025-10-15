import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

// Initialize Supabase with service role key for webhook access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
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

        // Extract metadata
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
        // You can use a service like SendGrid, Resend, or Nodemailer here

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
