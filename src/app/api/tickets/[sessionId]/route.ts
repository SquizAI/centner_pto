import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Lazy initialize Stripe to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const stripe = getStripeClient();
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get ticket record from database
    const supabase = await createClient()
    const { data: ticket, error: ticketError } = await supabase
      .from('event_tickets')
      .select(`
        *,
        events:event_id (
          id,
          title,
          description,
          event_date,
          end_date,
          location,
          campus,
          image_url
        )
      `)
      .eq('stripe_checkout_session_id', sessionId)
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ticket,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
        currency: session.currency,
      },
    })
  } catch (error) {
    console.error('Error retrieving ticket:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve ticket information' },
      { status: 500 }
    )
  }
}
