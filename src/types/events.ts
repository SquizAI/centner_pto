export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  end_date: string | null
  location: string | null
  campus: 'preschool' | 'elementary' | 'middle-high' | 'all'
  image_url: string | null
  max_attendees: number | null
  rsvp_count?: number
  rsvp_required: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  status: 'draft' | 'published' | 'cancelled'

  // Ticketing fields
  ticket_enabled: boolean
  ticket_price: number | null
  ticket_quantity: number | null
  tickets_sold: number
  ticket_sales_start: string | null
  ticket_sales_end: string | null
  stripe_product_id: string | null
  stripe_price_id: string | null
  requires_approval: boolean

  // External ticket sales link (e.g., Eventbrite, Ticketmaster)
  external_ticket_url: string | null
}

export interface EventTicket {
  id: string
  event_id: string
  user_id: string | null
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  quantity: number
  unit_price: number
  total_amount: number
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  stripe_customer_id: string | null
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  ticket_codes: string[]
  notes: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  events?: Event
}

export interface EventRSVP {
  id: string
  event_id: string
  user_id: string | null
  parent_name: string
  parent_email: string
  num_adults: number
  num_children: number
  notes: string | null
  created_at: string
}

export interface TicketPurchaseRequest {
  eventId: string
  quantity: number
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
}

export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export interface TicketWithEvent extends EventTicket {
  events: Event
}
