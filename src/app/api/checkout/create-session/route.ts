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

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  try {
    const body = await request.json()
    const {
      eventId,
      quantity,
      buyerName,
      buyerEmail,
      buyerPhone,
    } = body

    // Validate required fields
    if (!eventId || !quantity || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get event details from Supabase
    const supabase = await createClient()
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if tickets are enabled
    if (!event.ticket_enabled) {
      return NextResponse.json(
        { error: 'Tickets are not available for this event' },
        { status: 400 }
      )
    }

    // Check ticket availability
    const availableTickets = (event.ticket_quantity || 0) - (event.tickets_sold || 0)
    if (quantity > availableTickets) {
      return NextResponse.json(
        { error: `Only ${availableTickets} tickets available` },
        { status: 400 }
      )
    }

    // Check if sales window is active
    const now = new Date()
    if (event.ticket_sales_start && new Date(event.ticket_sales_start) > now) {
      return NextResponse.json(
        { error: 'Ticket sales have not started yet' },
        { status: 400 }
      )
    }
    if (event.ticket_sales_end && new Date(event.ticket_sales_end) < now) {
      return NextResponse.json(
        { error: 'Ticket sales have ended' },
        { status: 400 }
      )
    }

    // Calculate total amount
    const unitPrice = parseFloat(event.ticket_price || '0')
    const totalAmount = unitPrice * quantity

    // Generate unique ticket codes
    const ticketCodes: string[] = []
    for (let i = 0; i < quantity; i++) {
      const code = `${event.title.substring(0, 3).toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      ticketCodes.push(code)
    }

    // Create pending ticket record in database
    const { data: ticketRecord, error: ticketError } = await supabase
      .from('event_tickets')
      .insert({
        event_id: eventId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        ticket_codes: ticketCodes,
        status: 'pending',
      })
      .select()
      .single()

    if (ticketError || !ticketRecord) {
      console.error('Error creating ticket record:', ticketError)
      return NextResponse.json(
        { error: 'Failed to create ticket record' },
        { status: 500 }
      )
    }

    // Create or get Stripe Product for this event
    let stripeProductId = event.stripe_product_id
    let stripePriceId = event.stripe_price_id

    if (!stripeProductId) {
      // Create Stripe Product
      const product = await stripe.products.create({
        name: event.title,
        description: event.description || undefined,
        images: event.image_url ? [event.image_url] : undefined,
        metadata: {
          event_id: eventId,
        },
      })
      stripeProductId = product.id

      // Create Stripe Price
      const price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(unitPrice * 100), // Convert to cents
        currency: 'usd',
      })
      stripePriceId = price.id

      // Update event with Stripe IDs
      await supabase
        .from('events')
        .update({
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        })
        .eq('id', eventId)
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: quantity,
        },
      ],
      customer_email: buyerEmail,
      metadata: {
        event_id: eventId,
        ticket_record_id: ticketRecord.id,
        buyer_name: buyerName,
        buyer_phone: buyerPhone || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}/ticket-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/events/${eventId}?cancelled=true`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    })

    // Update ticket record with Stripe session ID
    await supabase
      .from('event_tickets')
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq('id', ticketRecord.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
