# Technical Architecture Document
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** Draft

---

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Authentication & Authorization](#authentication--authorization)
6. [API Design](#api-design)
7. [E-Commerce Integration](#e-commerce-integration)
8. [Payment Processing](#payment-processing)
9. [File Storage](#file-storage)
10. [Deployment Architecture](#deployment-architecture)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)
13. [Monitoring & Analytics](#monitoring--analytics)
14. [Development Workflow](#development-workflow)

---

## Overview

The Centner Academy PTO website is a modern, full-stack web application built with Next.js 15+, leveraging the latest App Router patterns, Server Actions, and React Server Components for optimal performance and developer experience. The architecture prioritizes security, scalability, and maintainability while providing an excellent user experience across all devices.

### Key Architecture Principles
- **Server-First**: Utilize React Server Components and Server Actions for optimal performance
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Security**: Row-Level Security (RLS), secure payment processing, authenticated actions
- **Performance**: Edge caching, image optimization, streaming, minimal JavaScript
- **Scalability**: Serverless architecture, horizontal scaling capability
- **Maintainability**: Clear separation of concerns, reusable components, comprehensive testing

---

## Technology Stack

### Frontend Framework
**Next.js 15+ (App Router)**
- React 19+ with Server Components
- Server Actions for server-side mutations
- Streaming and Suspense for progressive rendering
- Built-in image optimization
- File-system based routing
- Automatic code splitting

**Rationale**: Next.js App Router provides the best developer experience with built-in optimizations, server-side rendering, and excellent performance out of the box.

### UI & Styling
**Tailwind CSS 4.x**
- Utility-first CSS framework
- JIT (Just-In-Time) compilation
- Custom design system integration
- Dark mode support (future)

**shadcn/ui or Radix UI**
- Accessible component primitives
- Headless UI components
- Full customization capability
- TypeScript support

**Rationale**: Tailwind provides rapid development with consistent design, while shadcn/ui offers production-ready, accessible components.

### Backend & Database
**Supabase**
- PostgreSQL database (v15+)
- Row-Level Security (RLS) policies
- Real-time subscriptions
- Authentication (Email, OAuth providers)
- File storage with access control
- Edge Functions (if needed)

**Rationale**: Supabase provides a complete backend-as-a-service with enterprise-grade PostgreSQL, eliminating the need to manage database infrastructure.

### E-Commerce Platform
**Shopify (Primary Option)**
- Storefront API (GraphQL)
- Checkout API
- Inventory management
- Order fulfillment
- Product catalog

**Alternative: Stripe Products + Checkout**
- If Shopify is too complex for simple merch
- Stripe Product Catalog
- Stripe Checkout Sessions
- Stripe Payment Links

**Rationale**: Shopify provides comprehensive e-commerce features with minimal setup. Stripe is a viable alternative for simpler use cases.

### Payment Processing
**Stripe**
- Payment Intents API for donations
- Checkout Sessions for complex flows
- Subscription management for recurring donations
- Webhook integration for payment events
- Customer Portal for donation history

**Rationale**: Industry-standard payment processor with excellent documentation and comprehensive features.

### Email Services
**Resend or SendGrid**
- Transactional emails (receipts, confirmations)
- Newsletter delivery
- Event notifications
- Template management

**Rationale**: Both offer reliable email delivery with good developer experience. Resend has better pricing for small volumes.

### Hosting & Deployment
**Vercel**
- Next.js optimized hosting
- Automatic deployments from Git
- Edge Network (CDN)
- Preview deployments
- Analytics and monitoring
- Environment variable management

**Rationale**: Vercel is built by the Next.js team and provides the best deployment experience for Next.js applications.

### Development Tools
- **TypeScript 5.x**: Type safety across the codebase
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Zod**: Runtime validation and type inference
- **React Hook Form**: Form state management
- **TanStack Query (optional)**: Data fetching and caching for client components

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browsers                        │
│                    (Desktop, Mobile, Tablet)                 │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Edge Network (CDN)                 │
│         (Static Assets, Edge Middleware, Caching)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 Application                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            App Router (Server Components)            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Server Actions (Mutations)                        │   │
│  │  • API Routes (Webhooks, External APIs)              │   │
│  │  • Streaming SSR with Suspense                       │   │
│  │  • Client Components (Interactive UI)                │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        ▼            ▼            ▼              ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
   │Supabase │  │ Stripe  │  │Shopify  │  │  Resend  │
   │         │  │         │  │         │  │  Email   │
   │• Auth   │  │• Donate │  │• Store  │  │ Service  │
   │• DB     │  │• Subs   │  │• Cart   │  │          │
   │• Storage│  │• Webhook│  │• Orders │  │• Receipts│
   │• RLS    │  │         │  │         │  │• Alerts  │
   └─────────┘  └─────────┘  └─────────┘  └──────────┘
```

### Application Layers

#### 1. Presentation Layer (Client)
- React Server Components (default)
- Client Components (interactive elements only)
- Tailwind CSS for styling
- shadcn/ui components

#### 2. Application Layer (Server)
- Next.js Server Actions for mutations
- Server Components for data fetching
- API Routes for webhooks and external integrations
- Middleware for authentication checks

#### 3. Business Logic Layer
- Server-side validation (Zod schemas)
- Data transformation and formatting
- Business rules enforcement
- Error handling

#### 4. Data Access Layer
- Supabase client (server-side only)
- Type-safe database queries
- RLS policy enforcement
- Realtime subscriptions (when needed)

#### 5. External Services Layer
- Stripe SDK for payments
- Shopify Storefront API
- Resend/SendGrid for emails
- Google Calendar API (optional)

---

## Database Schema

### Supabase PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- =====================================================
-- PROFILES TABLE
-- Stores PTO member and admin profiles
-- =====================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'volunteer', 'admin', 'super_admin')),
    campus TEXT CHECK (campus IN ('preschool', 'elementary', 'middle_high')),
    student_grades TEXT[], -- Array of grades (e.g., ['PreK', '3rd', '8th'])
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- =====================================================
-- EVENTS TABLE
-- Stores PTO events and activities
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    campus TEXT[] DEFAULT ARRAY['all'], -- Which campuses this event is for
    event_type TEXT CHECK (event_type IN ('fundraiser', 'meeting', 'volunteer', 'student_event', 'other')),
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read published events
CREATE POLICY "Anyone can view published events"
    ON events FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage events"
    ON events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- EVENT_RSVPS TABLE
-- Track event registrations
-- =====================================================
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
    guests_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own RSVPs"
    ON event_rsvps FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own RSVPs"
    ON event_rsvps FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- DONATIONS TABLE
-- Track all donations
-- =====================================================
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    donation_type TEXT DEFAULT 'general' CHECK (donation_type IN (
        'general', 'playground', 'stem', 'arts', 'field_trips',
        'scholarships', 'campus_specific', 'teacher_appreciation'
    )),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'quarterly', 'annual')),
    student_grade TEXT,
    campus TEXT,
    donor_name TEXT,
    donor_email TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own donations"
    ON donations FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all donations"
    ON donations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- PHOTO_ALBUMS TABLE
-- Organize event photos into albums
-- =====================================================
CREATE TABLE photo_albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    cover_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    campus TEXT[] DEFAULT ARRAY['all'],
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published albums"
    ON photo_albums FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage albums"
    ON photo_albums FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- PHOTOS TABLE
-- Store individual photos
-- =====================================================
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES photo_albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    file_name TEXT NOT NULL,
    caption TEXT,
    photographer TEXT,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photos in published albums"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM photo_albums
            WHERE id = photos.album_id AND status = 'published'
        )
    );

CREATE POLICY "Admins can manage photos"
    ON photos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- NEWS_POSTS TABLE
-- Blog-style news and announcements
-- =====================================================
CREATE TABLE news_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category TEXT CHECK (category IN ('news', 'announcement', 'spotlight', 'event_recap')),
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES profiles(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
    ON news_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage posts"
    ON news_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- VOLUNTEER_OPPORTUNITIES TABLE
-- Track volunteer needs and sign-ups
-- =====================================================
CREATE TABLE volunteer_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    date TIMESTAMPTZ,
    duration_hours NUMERIC(4,2),
    location TEXT,
    slots_available INTEGER NOT NULL,
    slots_filled INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open opportunities"
    ON volunteer_opportunities FOR SELECT
    USING (status = 'open');

-- =====================================================
-- VOLUNTEER_SIGNUPS TABLE
-- Track volunteer commitments
-- =====================================================
CREATE TABLE volunteer_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opportunity_id UUID REFERENCES volunteer_opportunities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    hours_completed NUMERIC(4,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, user_id)
);

ALTER TABLE volunteer_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signups"
    ON volunteer_signups FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own signups"
    ON volunteer_signups FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- INDEXES
-- Optimize common queries
-- =====================================================

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_campus ON events USING GIN(campus);
CREATE INDEX idx_donations_user ON donations(user_id);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_created ON donations(created_at DESC);
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_news_posts_published ON news_posts(published_at DESC) WHERE status = 'published';

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Authentication & Authorization

### Authentication Strategy

**Supabase Auth**
- Email/Password authentication
- OAuth providers (Google, future: Apple, Microsoft)
- Magic link authentication (passwordless)
- Email verification required
- Password reset flows

### Authorization Levels

**1. Public (Unauthenticated)**
- View published content (events, news, gallery)
- Browse store
- Make donations
- Make purchases
- Submit contact forms
- Subscribe to newsletter

**2. Member (Authenticated Parent)**
- All public permissions
- RSVP to events
- View donation history
- Save payment methods
- Volunteer sign-ups
- Profile management

**3. Volunteer**
- All member permissions
- Access volunteer resources
- View volunteer schedules
- Update volunteer hours

**4. Admin**
- All volunteer permissions
- Manage events (create, edit, delete)
- Manage news posts
- Upload photos
- Manage albums
- View all donations
- Export reports
- Manage store products (if not Shopify)

**5. Super Admin**
- All admin permissions
- User management
- Role assignments
- System configuration
- Access to sensitive data
- Database operations

### Row-Level Security (RLS) Implementation

All database tables use Supabase RLS policies to enforce authorization at the database level. This ensures security even if application-level checks are bypassed.

Key RLS patterns:
```sql
-- Users can only see their own data
USING (auth.uid() = user_id)

-- Admins can see all data
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
)

-- Public can view published content
USING (status = 'published')
```

---

## API Design

### Server Actions (Primary)

Server Actions are the primary method for data mutations in Next.js 15+.

**Example: Create Event RSVP**
```typescript
// app/actions/events.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const rsvpSchema = z.object({
  eventId: z.string().uuid(),
  guestsCount: z.number().min(0).max(10),
  notes: z.string().optional(),
})

export async function createEventRSVP(formData: FormData) {
  const supabase = createServerClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required' }
  }

  // Validate input
  const rawData = {
    eventId: formData.get('eventId'),
    guestsCount: Number(formData.get('guestsCount')),
    notes: formData.get('notes'),
  }

  const result = rsvpSchema.safeParse(rawData)
  if (!result.success) {
    return { error: 'Invalid input', details: result.error.flatten() }
  }

  // Insert RSVP
  const { data, error } = await supabase
    .from('event_rsvps')
    .insert({
      event_id: result.data.eventId,
      user_id: user.id,
      guests_count: result.data.guestsCount,
      notes: result.data.notes,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the event page
  revalidatePath(`/events/${result.data.eventId}`)

  return { success: true, data }
}
```

### API Routes (Webhooks & External)

API Routes handle webhooks from external services and any non-mutation APIs.

**Example: Stripe Webhook Handler**
```typescript
// app/api/webhooks/stripe/route.ts
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

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Update donation record
      await supabase
        .from('donations')
        .update({
          status: 'succeeded',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      // Send thank you email
      // await sendDonationConfirmationEmail(...)
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break

    // Handle other event types
  }

  return NextResponse.json({ received: true })
}
```

---

## E-Commerce Integration

### Option 1: Shopify (Recommended for Full Store)

**Implementation Approach**: Shopify Storefront API + Buy SDK

**Product Management**:
- Products managed in Shopify Admin
- Synced via Storefront API
- GraphQL queries for product data

**Cart & Checkout**:
- Shopify Checkout (hosted)
- Custom cart UI with Shopify Buy SDK
- Redirect to Shopify for payment

**Example: Fetch Products**
```typescript
// lib/shopify/client.ts
import { createStorefrontApiClient } from '@shopify/storefront-api-client'

const client = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: '2025-01',
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
})

export async function getProducts() {
  const query = `
    query GetProducts {
      products(first: 20) {
        edges {
          node {
            id
            title
            description
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }
  `

  const { data, errors } = await client.request(query)

  if (errors) {
    console.error('Shopify API errors:', errors)
    throw new Error('Failed to fetch products')
  }

  return data?.products?.edges?.map(({ node }) => node) ?? []
}
```

### Option 2: Stripe Products + Checkout (Alternative)

For simpler merchandise needs without complex inventory management.

**Implementation**:
- Products defined in Stripe Dashboard
- Stripe Checkout Sessions for payment
- Fulfillment managed externally

**Example: Create Checkout Session**
```typescript
// app/actions/checkout.ts
'use server'

import Stripe from 'stripe'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function createCheckoutSession(items: Array<{
  priceId: string
  quantity: number
}>) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map(item => ({
      price: item.priceId,
      quantity: item.quantity,
    })),
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/cart`,
    metadata: {
      type: 'store_purchase',
    },
  })

  redirect(session.url!)
}
```

---

## Payment Processing

### Donation Flow (Stripe Payment Intents)

**1. Client initiates donation**
```typescript
// app/donate/page.tsx (Server Component)
import { DonationForm } from '@/components/donation-form'

export default function DonatePage() {
  return (
    <div>
      <h1>Support Centner Academy PTO</h1>
      <DonationForm />
    </div>
  )
}
```

**2. Form submission (Client Component)**
```typescript
// components/donation-form.tsx
'use client'

import { useState } from 'react'
import { processDonation } from '@/app/actions/donations'
import { useFormState } from 'react-dom'

export function DonationForm() {
  const [state, formAction] = useFormState(processDonation, null)

  return (
    <form action={formAction}>
      <input name="amount" type="number" required />
      <select name="donationType">
        <option value="general">General Support</option>
        <option value="stem">STEM Programs</option>
        {/* ... */}
      </select>
      <select name="studentGrade">
        <option value="">Select Grade (Optional)</option>
        <option value="PreK">PreK</option>
        {/* ... */}
      </select>
      <input name="donorName" type="text" required />
      <input name="donorEmail" type="email" required />
      <button type="submit">Donate</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  )
}
```

**3. Server Action processes donation**
```typescript
// app/actions/donations.ts
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const donationSchema = z.object({
  amount: z.number().min(100), // $1.00 minimum
  donationType: z.enum(['general', 'stem', 'arts', 'scholarships', /* ... */]),
  studentGrade: z.string().optional(),
  donorName: z.string().min(1),
  donorEmail: z.string().email(),
  isRecurring: z.boolean().optional(),
})

export async function processDonation(prevState: any, formData: FormData) {
  const supabase = createClient()

  // Validate input
  const rawData = {
    amount: Number(formData.get('amount')) * 100, // Convert to cents
    donationType: formData.get('donationType'),
    studentGrade: formData.get('studentGrade') || undefined,
    donorName: formData.get('donorName'),
    donorEmail: formData.get('donorEmail'),
    isRecurring: formData.get('isRecurring') === 'true',
  }

  const result = donationSchema.safeParse(rawData)
  if (!result.success) {
    return { error: 'Invalid donation details' }
  }

  try {
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: result.data.amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: result.data.donorEmail,
      metadata: {
        donationType: result.data.donationType,
        studentGrade: result.data.studentGrade || 'not_specified',
        donorName: result.data.donorName,
      },
    })

    // Create donation record in Supabase
    const { data: donation, error: dbError } = await supabase
      .from('donations')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount: result.data.amount,
        currency: 'usd',
        donation_type: result.data.donationType,
        student_grade: result.data.studentGrade,
        donor_name: result.data.donorName,
        donor_email: result.data.donorEmail,
        is_recurring: result.data.isRecurring,
        status: 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return { error: 'Failed to process donation' }
    }

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      donationId: donation.id,
    }
  } catch (error) {
    console.error('Donation processing error:', error)
    return { error: 'Payment processing failed' }
  }
}
```

### Recurring Donations (Stripe Subscriptions)

For recurring donations, use Stripe Subscriptions instead of Payment Intents.

```typescript
// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: customerId,
  items: [{
    price: priceId, // Monthly/Quarterly/Annual price
  }],
  metadata: {
    donationType: 'general',
    campus: 'all',
  },
})
```

---

## File Storage

### Supabase Storage Configuration

**Buckets**:
- `event-photos`: Public, images from PTO events
- `news-images`: Public, featured images for blog posts
- `avatars`: Public, user profile pictures
- `documents`: Private, admin documents (future)

**Storage Policies**:
```sql
-- Allow public read access to event photos
CREATE POLICY "Public can view event photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-photos');

-- Allow admins to upload event photos
CREATE POLICY "Admins can upload event photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);
```

**Image Optimization**:
- Automatic image transformation via Supabase
- Multiple size variants (thumbnail, medium, large)
- WebP format for modern browsers
- Lazy loading with Next.js Image component

**Example: Upload Photo**
```typescript
// app/actions/photos.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadPhoto(formData: FormData) {
  const supabase = createClient()

  const file = formData.get('file') as File
  const albumId = formData.get('albumId') as string

  // Check authentication and permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Upload to Supabase Storage
  const fileName = `${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('event-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    return { error: 'Upload failed' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('event-photos')
    .getPublicUrl(fileName)

  // Create photo record
  const { data, error } = await supabase
    .from('photos')
    .insert({
      album_id: albumId,
      storage_path: fileName,
      file_name: file.name,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { error: 'Failed to create photo record' }
  }

  revalidatePath(`/gallery/${albumId}`)
  return { success: true, data }
}
```

---

## Deployment Architecture

### Vercel Deployment

**Environment Configuration**:
- **Production**: main branch → production.centnerpto.org
- **Staging**: staging branch → staging.centnerpto.org
- **Preview**: All PRs → unique preview URLs

**Environment Variables**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Shopify (if using)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_ADMIN_ACCESS_TOKEN=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Base URL
NEXT_PUBLIC_BASE_URL=https://centnerpto.org
```

**Build Configuration** (vercel.json):
```json
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "installCommand": "npm install",
  "devCommand": "next dev",
  "regions": ["iad1"],
  "env": {
    "NODE_VERSION": "20.x"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

### Performance Configuration

**Next.js Config** (next.config.js):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'centneracademy.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    ppr: true, // Partial Prerendering
    reactCompiler: true, // React Compiler (React 19)
  },
}

module.exports = nextConfig
```

---

## Security Considerations

### Security Best Practices

**1. Environment Variables**
- Never commit secrets to Git
- Use Vercel environment variables
- Rotate keys regularly
- Use different keys for development/production

**2. Authentication**
- Enforce email verification
- Strong password requirements
- Rate limiting on auth endpoints
- Session management via Supabase

**3. Authorization**
- Server-side validation always
- Row-Level Security (RLS) on all tables
- Check user permissions before mutations
- Never trust client-side data

**4. Payment Security**
- PCI compliance via Stripe
- Never store card details
- Webhook signature verification
- HTTPS only

**5. Input Validation**
- Zod schemas for all inputs
- Sanitize user content
- SQL injection prevention (parameterized queries)
- XSS prevention (React escapes by default)

**6. Rate Limiting**
- Implement on Server Actions
- Protect donation endpoints
- Limit file uploads
- Use Vercel Edge Config for rate limits

**Example: Rate Limiting Middleware**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/donate/:path*', '/api/contact/:path*'],
}
```

---

## Performance Optimization

### Optimization Strategies

**1. Server Components (Default)**
- Use Server Components by default
- Only use Client Components when needed (interactivity)
- Reduce JavaScript bundle size

**2. Streaming & Suspense**
```typescript
// app/events/page.tsx
import { Suspense } from 'react'
import { EventList } from '@/components/event-list'
import { EventListSkeleton } from '@/components/event-list-skeleton'

export default function EventsPage() {
  return (
    <div>
      <h1>Upcoming Events</h1>
      <Suspense fallback={<EventListSkeleton />}>
        <EventList />
      </Suspense>
    </div>
  )
}
```

**3. Image Optimization**
- Next.js Image component
- WebP/AVIF formats
- Responsive images
- Lazy loading

**4. Data Fetching**
- Parallel data fetching where possible
- Request deduplication (automatic in Next.js)
- Proper cache configuration

**5. Caching Strategy**
```typescript
// Static pages (revalidate every hour)
export const revalidate = 3600

// Dynamic pages with on-demand revalidation
// Use revalidatePath() or revalidateTag() in Server Actions

// Example: Revalidate after event creation
await revalidatePath('/events')
await revalidateTag('events-list')
```

**6. Database Optimization**
- Proper indexes on frequent queries
- Limit result sets
- Use database functions for complex queries
- Connection pooling (handled by Supabase)

---

## Monitoring & Analytics

### Tools & Services

**1. Vercel Analytics**
- Core Web Vitals
- Real User Monitoring (RUM)
- Edge caching metrics
- Function execution times

**2. Google Analytics 4**
- Page views
- User journeys
- Conversion tracking
- Custom events (donations, purchases)

**3. Error Tracking (Sentry - Optional)**
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
})
```

**4. Supabase Metrics**
- Database performance
- Storage usage
- Auth metrics
- API request volume

**5. Stripe Dashboard**
- Payment success rates
- Revenue tracking
- Failed payments
- Dispute management

### Custom Analytics Events

```typescript
// lib/analytics.ts
export function trackDonation(amount: number, type: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'donation', {
      event_category: 'engagement',
      event_label: type,
      value: amount / 100, // Convert to dollars
    })
  }
}

export function trackEventRSVP(eventId: string, eventTitle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'event_rsvp', {
      event_category: 'engagement',
      event_label: eventTitle,
      event_id: eventId,
    })
  }
}
```

---

## Development Workflow

### Local Development Setup

**1. Prerequisites**
```bash
- Node.js 20.x or later
- npm or pnpm
- Git
- Supabase CLI (optional, for local development)
```

**2. Clone and Install**
```bash
git clone <repository-url>
cd centner-pto-website
npm install
```

**3. Environment Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your development credentials
```

**4. Run Development Server**
```bash
npm run dev
# Open http://localhost:3000
```

**5. Supabase Local Development (Optional)**
```bash
supabase init
supabase start
supabase db reset # Apply migrations
```

### Code Quality Tools

**ESLint Configuration**
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Prettier Configuration**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code
- `staging`: Pre-production testing
- `feature/*`: New features
- `fix/*`: Bug fixes
- `hotfix/*`: Production hotfixes

**Commit Convention**:
```
feat: Add donation recurring option
fix: Resolve event RSVP duplicate issue
docs: Update API documentation
style: Format donation form component
refactor: Simplify photo upload logic
test: Add tests for event creation
chore: Update dependencies
```

### Testing Strategy (Future)

**Unit Tests** (Vitest)
- Utility functions
- Data transformations
- Validation schemas

**Integration Tests** (Playwright)
- User flows (donation, RSVP, store checkout)
- Form submissions
- Authentication flows

**E2E Tests** (Playwright)
- Critical user journeys
- Payment processing
- Admin operations

---

## Appendix

### Technology Version Matrix

| Technology | Version | Notes |
|------------|---------|-------|
| Next.js | 15.4.x | App Router, React 19 |
| React | 19.x | Server Components |
| TypeScript | 5.x | Strict mode |
| Tailwind CSS | 4.x | JIT compiler |
| Supabase JS | 2.x | Latest stable |
| Stripe | Latest | Node SDK |
| Node.js | 20.x LTS | Runtime |

### Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Shopify Storefront API](https://shopify.dev/docs/api/storefront)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Document Approval**:
- **Prepared By**: Development Team
- **Review Date**: October 14, 2025
- **Next Review**: January 2026
