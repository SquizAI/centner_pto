# API Routes Reference
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025

---

## Overview

API Routes (Route Handlers) in Next.js 15 are used for webhooks, external integrations, and any endpoints that don't fit the Server Action pattern.

---

## Webhook Endpoints

### POST `/api/webhooks/stripe`

Handles Stripe webhook events for payment processing.

**Location:** `app/api/webhooks/stripe/route.ts`

**Authentication:** Stripe webhook signature verification

**Request:**
```typescript
{
  type: string              // Event type (e.g., 'payment_intent.succeeded')
  data: {
    object: object          // Event object
  }
  // ... other Stripe event fields
}
```

**Headers:**
```typescript
{
  'stripe-signature': string  // Required for verification
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      await supabase
        .from('donations')
        .update({
          status: 'succeeded',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      // Send thank you email
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break

    case 'customer.subscription.updated':
      // Handle subscription changes
      break

    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break
  }

  return NextResponse.json({ received: true })
}
```

**Supported Events:**
- `payment_intent.succeeded` - Donation completed
- `payment_intent.payment_failed` - Donation failed
- `payment_intent.canceled` - Donation canceled
- `customer.subscription.created` - Recurring donation started
- `customer.subscription.updated` - Recurring donation updated
- `customer.subscription.deleted` - Recurring donation canceled
- `charge.refunded` - Refund processed

---

### POST `/api/webhooks/shopify`

Handles Shopify webhook events for store orders.

**Location:** `app/api/webhooks/shopify/route.ts`

**Authentication:** Shopify HMAC verification

**Request:**
Varies by webhook type (orders, products, inventory, etc.)

**Headers:**
```typescript
{
  'x-shopify-hmac-sha256': string     // Required for verification
  'x-shopify-topic': string            // Event type
  'x-shopify-shop-domain': string      // Store domain
}
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const hmac = req.headers.get('x-shopify-hmac-sha256')
  const topic = req.headers.get('x-shopify-topic')

  // Verify webhook
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET!)
    .update(body)
    .digest('base64')

  if (hash !== hmac) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const data = JSON.parse(body)

  switch (topic) {
    case 'orders/create':
      // Handle new order
      break

    case 'orders/fulfilled':
      // Handle order fulfillment
      break

    case 'products/update':
      // Handle product update
      break
  }

  return NextResponse.json({ received: true })
}
```

**Supported Topics:**
- `orders/create` - New order placed
- `orders/updated` - Order updated
- `orders/fulfilled` - Order fulfilled
- `orders/cancelled` - Order cancelled
- `products/create` - Product created
- `products/update` - Product updated
- `products/delete` - Product deleted

---

## Calendar Export

### GET `/api/calendar/export`

Exports events to iCalendar format.

**Location:** `app/api/calendar/export/route.ts`

**Query Parameters:**
```typescript
{
  campus?: 'preschool' | 'elementary' | 'middle_high' | 'all'
  type?: 'fundraiser' | 'meeting' | 'volunteer' | 'student_event'
  from?: string  // ISO date
  to?: string    // ISO date
}
```

**Response:**
```
Content-Type: text/calendar
Content-Disposition: attachment; filename="centner-pto-events.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Centner PTO//Events//EN
...
END:VCALENDAR
```

**Implementation:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import ical from 'ical-generator'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const campus = searchParams.get('campus')

  const supabase = createClient()

  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('event_date', { ascending: true })

  if (campus && campus !== 'all') {
    query = query.contains('campus', [campus])
  }

  const { data: events } = await query

  const calendar = ical({ name: 'Centner PTO Events' })

  events?.forEach(event => {
    calendar.createEvent({
      start: new Date(event.event_date),
      end: event.end_date ? new Date(event.end_date) : undefined,
      summary: event.title,
      description: event.description,
      location: event.location,
      url: `https://centnerpto.org/events/${event.id}`,
    })
  })

  return new NextResponse(calendar.toString(), {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': 'attachment; filename="centner-pto-events.ics"',
    },
  })
}
```

---

## Email Unsubscribe

### GET `/api/unsubscribe`

Unsubscribe from email newsletters.

**Location:** `app/api/unsubscribe/route.ts`

**Query Parameters:**
```typescript
{
  token: string  // Encrypted email or user ID
}
```

**Response:**
Redirects to confirmation page or returns JSON

---

## Search API

### GET `/api/search`

Global search across events, news, and content.

**Location:** `app/api/search/route.ts`

**Query Parameters:**
```typescript
{
  q: string       // Search query
  type?: 'events' | 'news' | 'all'
  limit?: number  // Default 20
}
```

**Response:**
```typescript
{
  results: Array<{
    type: 'event' | 'news' | 'album'
    id: string
    title: string
    excerpt: string
    url: string
    date: string
  }>
  total: number
}
```

---

## Analytics API

### POST `/api/analytics/track`

Track custom analytics events.

**Location:** `app/api/analytics/track/route.ts`

**Request:**
```typescript
{
  event: string           // Event name
  properties?: object     // Event properties
  userId?: string         // Optional user ID
}
```

**Response:**
```typescript
{
  success: boolean
}
```

---

## Image Optimization

### GET `/api/images/optimize`

Proxy for optimized images from Supabase Storage.

**Location:** `app/api/images/optimize/route.ts`

**Query Parameters:**
```typescript
{
  src: string     // Image URL
  w?: number      // Width
  q?: number      // Quality (1-100)
}
```

**Response:**
Optimized image with proper caching headers

---

## Rate Limiting

All API routes implement rate limiting:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  // Handle request
}
```

---

## Error Responses

All API routes return consistent error responses:

```typescript
{
  error: string           // Error message
  code?: string          // Error code
  details?: object       // Additional details
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## CORS Configuration

```typescript
// middleware.ts or route handler
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

---

## Testing API Routes

```typescript
// __tests__/api/webhooks/stripe.test.ts
import { POST } from '@/app/api/webhooks/stripe/route'
import { NextRequest } from 'next/server'

describe('Stripe Webhook', () => {
  it('should handle payment success', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test' } },
    }

    const req = new NextRequest('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(event),
      headers: {
        'stripe-signature': 'test_sig',
      },
    })

    const response = await POST(req)
    expect(response.status).toBe(200)
  })
})
```

---

## Related Documentation

- [Server Actions](./SERVER_ACTIONS.md)
- [Webhook Configuration](../deployment/WEBHOOKS.md)
- [Security Guidelines](../architecture/TECHNICAL_ARCHITECTURE.md#security)
