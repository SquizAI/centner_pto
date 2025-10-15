# Server Actions API Reference
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025

---

## Overview

Server Actions are the primary method for data mutations in the Centner PTO website. All Server Actions follow Next.js 15 conventions and include proper validation, error handling, and type safety.

---

## Authentication Actions

### Location: `app/actions/auth.ts`

#### `signup(formData: FormData)`

Creates a new user account with email and password.

**Parameters:**
```typescript
{
  email: string      // Valid email address
  password: string   // Min 8 characters
  name: string      // Full name
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  user?: User
}
```

**Example:**
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

#### `login(formData: FormData)`

Authenticates user with email and password.

**Parameters:**
```typescript
{
  email: string
  password: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
}
```

---

#### `logout()`

Signs out the current user.

**Returns:**
```typescript
{
  success: boolean
}
```

---

#### `resetPassword(email: string)`

Sends password reset email.

**Parameters:**
```typescript
{
  email: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
}
```

---

## Event Actions

### Location: `app/actions/events.ts`

#### `createEvent(formData: FormData)`

Creates a new event (admin only).

**Parameters:**
```typescript
{
  title: string
  description: string
  event_date: string       // ISO 8601 format
  end_date?: string        // ISO 8601 format
  location: string
  campus: string[]         // ['all'] or ['preschool', 'elementary', 'middle_high']
  event_type: 'fundraiser' | 'meeting' | 'volunteer' | 'student_event' | 'other'
  max_attendees?: number
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: Event
}
```

**Authorization:** Requires admin role

---

#### `updateEvent(eventId: string, formData: FormData)`

Updates an existing event (admin only).

**Parameters:**
Same as createEvent, plus:
```typescript
{
  eventId: string  // UUID
  status?: 'draft' | 'published' | 'cancelled'
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: Event
}
```

---

#### `deleteEvent(eventId: string)`

Deletes an event (admin only).

**Parameters:**
```typescript
{
  eventId: string  // UUID
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
}
```

---

#### `createRSVP(eventId: string, guestsCount: number)`

Creates an RSVP for an event.

**Parameters:**
```typescript
{
  eventId: string
  guestsCount: number  // Default 0, max 10
  notes?: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: RSVP
}
```

**Authorization:** Requires authenticated user

---

#### `cancelRSVP(rsvpId: string)`

Cancels an existing RSVP.

**Parameters:**
```typescript
{
  rsvpId: string  // UUID
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
}
```

---

## Donation Actions

### Location: `app/actions/donations.ts`

#### `createDonation(formData: FormData)`

Creates a donation and initiates Stripe Payment Intent.

**Parameters:**
```typescript
{
  amount: number           // In dollars (will be converted to cents)
  donationType: 'general' | 'stem' | 'arts' | 'scholarships' | 'campus_specific'
  donorName: string
  donorEmail: string
  studentGrade?: string
  campus?: string
  isRecurring?: boolean
  recurringInterval?: 'monthly' | 'quarterly' | 'annual'
  isAnonymous?: boolean
  message?: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  clientSecret?: string    // For Stripe Elements
  donationId?: string
}
```

**Example:**
```typescript
'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function createDonation(formData: FormData) {
  const supabase = createClient()

  const amount = Number(formData.get('amount')) * 100
  const donorEmail = formData.get('email') as string

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      receipt_email: donorEmail,
    })

    const { data, error } = await supabase
      .from('donations')
      .insert({
        stripe_payment_intent_id: paymentIntent.id,
        amount,
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
    return { error: 'Failed to process donation' }
  }
}
```

---

#### `getDonationHistory(userId: string)`

Retrieves donation history for a user.

**Parameters:**
```typescript
{
  userId: string  // UUID
}
```

**Returns:**
```typescript
{
  donations: Donation[]
}
```

---

## Photo Actions

### Location: `app/actions/photos.ts`

#### `createAlbum(formData: FormData)`

Creates a new photo album (admin only).

**Parameters:**
```typescript
{
  title: string
  description?: string
  eventId?: string
  campus: string[]
  status: 'draft' | 'published' | 'archived'
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: Album
}
```

---

#### `uploadPhoto(formData: FormData)`

Uploads a photo to an album (admin only).

**Parameters:**
```typescript
{
  file: File
  albumId: string
  caption?: string
  photographer?: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: Photo
}
```

**Max File Size:** 10MB
**Allowed Types:** JPG, PNG, WebP

---

#### `deletePhoto(photoId: string)`

Deletes a photo (admin only).

**Parameters:**
```typescript
{
  photoId: string  // UUID
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
}
```

---

## News Actions

### Location: `app/actions/news.ts`

#### `createPost(formData: FormData)`

Creates a news post (admin only).

**Parameters:**
```typescript
{
  title: string
  slug: string           // URL-friendly
  excerpt?: string
  content: string        // Rich text/markdown
  featuredImage?: string
  category: 'news' | 'announcement' | 'spotlight' | 'event_recap'
  isFeatured: boolean
  status: 'draft' | 'published' | 'archived'
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: NewsPost
}
```

---

#### `updatePost(postId: string, formData: FormData)`

Updates a news post (admin only).

---

#### `deletePost(postId: string)`

Deletes a news post (admin only).

---

## Volunteer Actions

### Location: `app/actions/volunteers.ts`

#### `createOpportunity(formData: FormData)`

Creates volunteer opportunity (admin only).

**Parameters:**
```typescript
{
  title: string
  description: string
  eventId?: string
  date: string
  durationHours: number
  location: string
  slotsAvailable: number
}
```

---

#### `signUpForOpportunity(opportunityId: string)`

Sign up for volunteer opportunity.

**Parameters:**
```typescript
{
  opportunityId: string
  notes?: string
}
```

**Returns:**
```typescript
{
  success?: boolean
  error?: string
  data?: VolunteerSignup
}
```

---

## Validation Schemas

### Location: `lib/validations/*.ts`

All Server Actions use Zod schemas for validation:

**Example: Event Schema**
```typescript
import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  event_date: z.string().datetime(),
  end_date: z.string().datetime().optional(),
  location: z.string().min(3).max(200),
  campus: z.array(z.enum(['preschool', 'elementary', 'middle_high', 'all'])),
  event_type: z.enum(['fundraiser', 'meeting', 'volunteer', 'student_event', 'other']),
  max_attendees: z.number().positive().optional(),
})
```

---

## Error Handling

All Server Actions follow a consistent error handling pattern:

```typescript
export async function serverAction(data: FormData) {
  try {
    // Validate input
    const validated = schema.safeParse(data)
    if (!validated.success) {
      return { error: 'Invalid input', details: validated.error.flatten() }
    }

    // Check authorization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Authentication required' }
    }

    // Perform action
    const result = await performAction(validated.data)

    // Revalidate cache
    revalidatePath('/relevant-path')

    return { success: true, data: result }
  } catch (error) {
    console.error('Action error:', error)
    return { error: 'Operation failed' }
  }
}
```

---

## Security Best Practices

1. **Always validate input** with Zod schemas
2. **Check authentication** before any mutation
3. **Verify authorization** for admin-only actions
4. **Revalidate paths** after mutations
5. **Never expose sensitive data** in error messages
6. **Use RLS policies** as backup security layer
7. **Rate limit** sensitive actions
8. **Log errors** server-side only

---

## Testing Server Actions

```typescript
// __tests__/actions/events.test.ts
import { createEvent } from '@/app/actions/events'

describe('createEvent', () => {
  it('should create event with valid data', async () => {
    const formData = new FormData()
    formData.append('title', 'Test Event')
    formData.append('description', 'Test Description')
    // ... other fields

    const result = await createEvent(formData)

    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
  })

  it('should reject invalid data', async () => {
    const formData = new FormData()
    formData.append('title', 'x') // Too short

    const result = await createEvent(formData)

    expect(result.error).toBeDefined()
  })
})
```

---

## Related Documentation

- [Technical Architecture](../architecture/TECHNICAL_ARCHITECTURE.md)
- [API Routes](./API_ROUTES.md)
- [Database Schema](../architecture/TECHNICAL_ARCHITECTURE.md#database-schema)
