# Implementation Roadmap
## Centner Academy PTO Website - Developer Guide

**Version:** 1.0
**Last Updated:** October 14, 2025
**Developer**: Self-Implementation
**Timeline**: Flexible, based on availability

---

## Overview

This roadmap is designed for self-implementation by a developer building the Centner PTO website. It breaks down the project into manageable phases with clear milestones, technical tasks, and implementation priorities.

---

## Phase 1: Project Setup (Week 1)

### 1.1 Development Environment

**Tasks**:
- [ ] Install Node.js 20.x LTS
- [ ] Install pnpm or npm
- [ ] Set up IDE (VS Code recommended)
- [ ] Install VS Code extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript
  - Supabase

**Create Next.js App**:
```bash
npx create-next-app@latest centner-pto-website --typescript --tailwind --app --src-dir
cd centner-pto-website
```

**Install Core Dependencies**:
```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add stripe @stripe/stripe-js
pnpm add zod react-hook-form @hookform/resolvers
pnpm add date-fns
pnpm add lucide-react # Icons

# Dev dependencies
pnpm add -D @types/node
```

**Setup shadcn/ui**:
```bash
npx shadcn@latest init
npx shadcn@latest add button input label card form
```

---

### 1.2 Supabase Setup

**Create Project**:
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "centner-pto"
3. Save credentials:
   - Project URL
   - Anon key
   - Service role key

**Initialize Database**:
- Run the SQL schema from `TECHNICAL_ARCHITECTURE.md`
- Create tables: profiles, events, donations, photos, etc.
- Set up RLS policies
- Create storage buckets

**Local Setup**:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Pull schema
supabase db pull
```

---

### 1.3 Environment Variables

**Create `.env.local`**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (test mode initially)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

---

### 1.4 Project Structure

**Create Folder Structure**:
```bash
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (public)/
│   │   ├── about/
│   │   ├── events/
│   │   ├── gallery/
│   │   ├── store/
│   │   └── donate/
│   ├── admin/
│   ├── api/
│   │   └── webhooks/
│   └── actions/
├── components/
│   ├── ui/              # shadcn components
│   ├── layout/
│   ├── forms/
│   └── features/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   └── utils/
└── types/
```

---

## Phase 2: Core Foundation (Week 2-3)

### 2.1 Supabase Client Setup

**Create `lib/supabase/client.ts`**:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Create `lib/supabase/server.ts`**:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

---

### 2.2 Authentication System

**Priority**: HIGH

**Tasks**:
- [ ] Create login page (`app/(auth)/login/page.tsx`)
- [ ] Create signup page (`app/(auth)/signup/page.tsx`)
- [ ] Implement email/password auth
- [ ] Add password reset flow
- [ ] Create auth middleware
- [ ] Build user profile page

**Auth Actions** (`app/actions/auth.ts`):
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

---

### 2.3 Layout Components

**Priority**: HIGH

**Tasks**:
- [ ] Create header/navigation component
- [ ] Create footer component
- [ ] Add mobile menu
- [ ] Implement breadcrumbs
- [ ] Create loading states
- [ ] Add error boundaries

**Header Component** (`components/layout/header.tsx`):
```typescript
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Centner PTO
          </Link>

          <div className="hidden md:flex gap-6">
            <Link href="/about">About</Link>
            <Link href="/events">Events</Link>
            <Link href="/gallery">Gallery</Link>
            <Link href="/store">Store</Link>
            <Link href="/donate" className="font-semibold text-primary">
              Donate
            </Link>
          </div>

          <div>
            {user ? (
              <Link href="/dashboard">Dashboard</Link>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
```

---

### 2.4 Homepage

**Priority**: HIGH

**Tasks**:
- [ ] Hero section with mission statement
- [ ] Featured events (upcoming)
- [ ] Latest news (3 posts)
- [ ] Donate CTA
- [ ] Quick links section
- [ ] Featured photo gallery

**Homepage** (`app/page.tsx`):
```typescript
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/features/event-card'
import { NewsCard } from '@/components/features/news-card'

export default async function HomePage() {
  const supabase = createClient()

  // Fetch upcoming events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(3)

  // Fetch latest news
  const { data: news } = await supabase
    .from('news_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Cultivating Leaders with Heart
          </h1>
          <p className="text-xl mb-8">
            Join the Centner Academy PTO in supporting our students across all three campuses
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/donate" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold">
              Donate Now
            </Link>
            <Link href="/about" className="border-2 border-white px-8 py-3 rounded-lg font-semibold">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events?.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Latest News</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {news?.map(post => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

---

## Phase 3: Content Features (Week 4-6)

### 3.1 Events Calendar

**Priority**: HIGH

**Tasks**:
- [ ] Calendar view component (use `react-big-calendar` or custom)
- [ ] Event list view
- [ ] Event detail page
- [ ] RSVP functionality
- [ ] Filter by campus/type
- [ ] Export to calendar (iCal)

**Event List Page** (`app/events/page.tsx`):
```typescript
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/features/event-card'

export default async function EventsPage() {
  const supabase = createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Upcoming Events</h1>

      {/* Filters here */}

      <div className="grid md:grid-cols-3 gap-6">
        {events?.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
```

**RSVP Server Action** (`app/actions/events.ts`):
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRSVP(eventId: string, guestsCount: number = 0) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Authentication required' }

  const { data, error } = await supabase
    .from('event_rsvps')
    .insert({
      event_id: eventId,
      user_id: user.id,
      guests_count: guestsCount,
      status: 'confirmed',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/events/${eventId}`)
  return { success: true, data }
}
```

---

### 3.2 Photo Gallery

**Priority**: MEDIUM

**Tasks**:
- [ ] Album list page
- [ ] Album detail with photo grid
- [ ] Photo lightbox viewer
- [ ] Photo upload (admin)
- [ ] Bulk upload support
- [ ] Image optimization

**Gallery Page** (`app/gallery/page.tsx`):
```typescript
import { createClient } from '@/lib/supabase/server'
import { AlbumCard } from '@/components/features/album-card'

export default async function GalleryPage() {
  const supabase = createClient()

  const { data: albums } = await supabase
    .from('photo_albums')
    .select('*, photos(count)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Photo Gallery</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {albums?.map(album => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  )
}
```

**Photo Upload Action** (`app/actions/photos.ts`):
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadPhoto(formData: FormData) {
  const supabase = createClient()

  const file = formData.get('file') as File
  const albumId = formData.get('albumId') as string

  // Check auth and permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Upload to storage
  const fileName = `${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase
    .storage
    .from('event-photos')
    .upload(fileName, file)

  if (uploadError) return { error: 'Upload failed' }

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

  if (error) return { error: error.message }

  revalidatePath(`/gallery/${albumId}`)
  return { success: true, data }
}
```

---

### 3.3 News & Announcements

**Priority**: MEDIUM

**Tasks**:
- [ ] News list page
- [ ] News detail page
- [ ] Rich text editor (admin)
- [ ] Featured posts
- [ ] Categories
- [ ] Search functionality

---

## Phase 4: E-Commerce & Donations (Week 7-9)

### 4.1 Donation System

**Priority**: HIGH

**Install Stripe**:
```bash
pnpm add stripe @stripe/stripe-js @stripe/react-stripe-js
```

**Donation Page** (`app/donate/page.tsx`):
```typescript
import { DonationForm } from '@/components/features/donation-form'

export default function DonatePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">Support Our Students</h1>
      <p className="text-lg text-gray-600 mb-8">
        Your generous donation helps us provide enriching experiences
        for students across all three campuses.
      </p>

      <DonationForm />
    </div>
  )
}
```

**Donation Server Action** (`app/actions/donations.ts`):
```typescript
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function createDonation(formData: FormData) {
  const supabase = createClient()

  const amount = Number(formData.get('amount')) * 100 // Convert to cents
  const donorEmail = formData.get('email') as string
  const donorName = formData.get('name') as string
  const donationType = formData.get('donationType') as string

  try {
    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: donorEmail,
      metadata: {
        donorName,
        donationType,
      },
    })

    // Create donation record
    const { data, error } = await supabase
      .from('donations')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency: 'usd',
        donation_type: donationType,
        donor_name: donorName,
        donor_email: donorEmail,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      donationId: data.id,
    }
  } catch (error) {
    console.error('Donation error:', error)
    return { error: 'Failed to process donation' }
  }
}
```

**Stripe Webhook** (`app/api/webhooks/stripe/route.ts`):
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
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntent.id)

      // TODO: Send thank you email
      break

    case 'payment_intent.payment_failed':
      // Handle failed payment
      break
  }

  return NextResponse.json({ received: true })
}
```

---

### 4.2 Store Integration

**Option A: Shopify**

**Install Shopify SDK**:
```bash
pnpm add @shopify/storefront-api-client
```

**Option B: Stripe Products**

Use Stripe Product Catalog for simpler needs:
```typescript
// Fetch products from Stripe
const products = await stripe.products.list({
  active: true,
  expand: ['data.default_price'],
})
```

---

## Phase 5: Admin Panel (Week 10-11)

### 5.1 Admin Dashboard

**Priority**: MEDIUM

**Tasks**:
- [ ] Admin layout with sidebar
- [ ] Dashboard overview
- [ ] Quick stats
- [ ] Recent activity

**Admin Middleware** (`middleware.ts`):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if user is admin
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: '/admin/:path*',
}
```

---

### 5.2 Content Management

**Tasks**:
- [ ] Event management (CRUD)
- [ ] News post management
- [ ] Photo album management
- [ ] Donation reports
- [ ] User management

---

## Phase 6: Testing & Launch (Week 12-13)

### 6.1 Testing Checklist

**Functionality**:
- [ ] All forms submit correctly
- [ ] Authentication works
- [ ] RSVP system functional
- [ ] Donations process successfully
- [ ] Photo upload works
- [ ] Admin panel accessible

**Performance**:
- [ ] Lighthouse score 90+
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Core Web Vitals pass

**Security**:
- [ ] RLS policies active
- [ ] Environment variables secure
- [ ] Webhook signatures verified
- [ ] CSRF protection enabled

**Accessibility**:
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes
- [ ] Alt text on images

---

### 6.2 Deployment

**Deploy to Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Set Environment Variables in Vercel**:
- Go to Project Settings
- Add all env vars from `.env.local`
- Redeploy

**Configure Stripe Webhook**:
1. Get production webhook URL: `https://your-domain.com/api/webhooks/stripe`
2. Add in Stripe Dashboard
3. Add webhook secret to Vercel env vars

---

## Infrastructure Costs (Monthly)

Since you're self-developing, here are just the actual service costs:

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Pro | $20/mo |
| **Supabase** | Pro | $25/mo |
| **Domain** | Annual | ~$1/mo |
| **Email (Resend)** | Free tier | $0/mo |
| **Store (Shopify)** | Basic (optional) | $39/mo |
| **TOTAL** | Without Shopify | **$46/mo** |
| **TOTAL** | With Shopify | **$85/mo** |

**Transaction Fees** (Stripe): 2.9% + $0.30 per transaction

---

## Development Tips

### Performance Optimization

**Use Server Components by default**:
```typescript
// app/events/page.tsx - Server Component (default)
export default async function EventsPage() {
  const data = await fetchEvents() // Runs on server
  return <EventsList events={data} />
}
```

**Only use Client Components when needed**:
```typescript
// components/rsvp-button.tsx - Client Component
'use client'

export function RSVPButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)

  // Interactive functionality
  return <button onClick={handleRSVP}>RSVP</button>
}
```

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src={imageUrl}
  alt="Event photo"
  width={600}
  height={400}
  className="rounded-lg"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Database Queries

**Use select to limit data**:
```typescript
const { data } = await supabase
  .from('events')
  .select('id, title, event_date, location') // Only fetch what you need
  .eq('status', 'published')
  .order('event_date', { ascending: true })
  .limit(10)
```

---

## Priority Order

**Week 1-2**: Foundation
1. ✅ Project setup
2. ✅ Authentication
3. ✅ Layout components
4. ✅ Homepage

**Week 3-4**: Content
5. ✅ Events calendar
6. ✅ News/announcements
7. ✅ About page

**Week 5-6**: Gallery
8. ✅ Photo albums
9. ✅ Photo upload
10. ✅ Lightbox viewer

**Week 7-8**: Commerce
11. ✅ Donation system
12. ✅ Store integration
13. ✅ Stripe webhooks

**Week 9-10**: Admin
14. ✅ Admin dashboard
15. ✅ Content management
16. ✅ Reports

**Week 11-12**: Polish
17. ✅ Testing
18. ✅ Performance optimization
19. ✅ Accessibility audit

**Week 13**: Launch
20. ✅ Deploy to production
21. ✅ Monitor and iterate

---

## Need Help?

### Documentation Links
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Community
- Next.js Discord
- Supabase Discord
- Stack Overflow

---

**You've got this! Start with Phase 1 and take it step by step. Feel free to adjust the timeline based on your availability.**
