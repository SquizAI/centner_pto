'use server'

import { createClient } from '@/lib/supabase/server'
import { getStripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { z } from 'zod'
import Stripe from 'stripe'

// Validation schemas
const donationFormSchema = z.object({
  amount: z.number().min(5, 'Minimum donation is $5').max(10000, 'Maximum donation is $10,000'),
  donationType: z.enum([
    'general',
    'playground',
    'stem',
    'arts',
    'field_trips',
    'teacher_appreciation',
    'campus_specific',
  ]),
  frequency: z.enum(['one_time', 'monthly', 'quarterly', 'annual']),
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  studentName: z.string().optional(),
  studentGrade: z.string().optional(),
  campus: z.enum(['preschool', 'elementary', 'middle_high', 'all']).optional(),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
})

export interface ActionResult {
  success: boolean
  error?: string
  data?: any
}

/**
 * Create a Stripe Checkout Session for one-time or recurring donations
 */
export async function createCheckoutSession(
  formData: z.infer<typeof donationFormSchema>
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = donationFormSchema.parse(formData)
    const supabase = await createClient()

    // Get current user (optional - donations can be made without login)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Determine if this is a recurring donation
    const isRecurring = validated.frequency !== 'one_time'

    // Create or retrieve Stripe customer
    let customerId: string | undefined

    if (user) {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Get or create customer
      if (profile && (profile as any).stripe_customer_id) {
        customerId = (profile as any).stripe_customer_id
      }
    }

    // If no customer ID, create a new customer
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: validated.donorEmail,
        name: validated.donorName,
        metadata: {
          user_id: user?.id || '',
          campus: validated.campus || 'all',
          student_name: validated.studentName || '',
        },
      })
      customerId = customer.id

      // Update profile with customer ID if user is logged in
      if (user) {
        await supabase
          .from('profiles')
          .update({ stripe_customer_id: customerId } as any)
          .eq('id', user.id)
      }
    }

    // Prepare metadata
    const metadata: Stripe.MetadataParam = {
      type: 'donation', // Identifies this as a donation vs ticket purchase
      user_id: user?.id || '',
      donation_type: validated.donationType,
      frequency: validated.frequency,
      donor_name: validated.donorName,
      donor_email: validated.donorEmail,
      is_anonymous: validated.isAnonymous.toString(),
      student_name: validated.studentName || '',
      student_grade: validated.studentGrade || '',
      campus: validated.campus || 'all',
      message: validated.message || '',
    }

    let sessionConfig: Stripe.Checkout.SessionCreateParams

    if (isRecurring) {
      // Create recurring donation (subscription)
      const interval = validated.frequency === 'monthly'
        ? 'month'
        : validated.frequency === 'quarterly'
        ? 'month'
        : 'year'

      const intervalCount = validated.frequency === 'quarterly' ? 3 : 1

      sessionConfig = {
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: `Recurring Donation - ${validated.donationType.replace('_', ' ')}`,
                description: `${validated.frequency} donation to Centner Academy PTO`,
              },
              unit_amount: validated.amount * 100, // Convert to cents
              recurring: {
                interval: interval as 'month' | 'year',
                interval_count: intervalCount,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata,
        subscription_data: {
          metadata,
        },
      }
    } else {
      // Create one-time donation
      sessionConfig = {
        mode: 'payment',
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: STRIPE_CONFIG.currency,
              product_data: {
                name: `Donation - ${validated.donationType.replace('_', ' ')}`,
                description: 'One-time donation to Centner Academy PTO',
              },
              unit_amount: validated.amount * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: STRIPE_CONFIG.cancelUrl,
        metadata,
        payment_intent_data: {
          metadata,
        },
      }
    }

    // Create the checkout session
    const session = await getStripe().checkout.sessions.create(sessionConfig)

    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    }
  } catch (error) {
    console.error('Create checkout session error:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create checkout session',
    }
  }
}

/**
 * Get donation history for a user
 */
export async function getDonationHistory(userId?: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // If no userId provided, get current user
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          error: 'Not authenticated',
        }
      }
      targetUserId = user.id
    }

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch donation history',
    }
  }
}

/**
 * Get all donations (admin only)
 */
export async function getAllDonations(filters?: {
  status?: string
  donationType?: string
  startDate?: string
  endDate?: string
  limit?: number
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return {
        success: false,
        error: 'Unauthorized - Admin access required',
      }
    }

    let query = supabase.from('donations').select('*').order('created_at', { ascending: false })

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.donationType) {
      query = query.eq('donation_type', filters.donationType)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate)
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch donations',
    }
  }
}

/**
 * Get donation statistics (admin only)
 */
export async function getDonationStats(): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return {
        success: false,
        error: 'Unauthorized - Admin access required',
      }
    }

    // Get all successful donations
    const { data: donations, error } = await supabase
      .from('donations')
      .select('amount, donation_type, is_recurring, created_at')
      .eq('status', 'succeeded')

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Calculate statistics
    const totalAmount = donations?.reduce((sum, d) => sum + d.amount, 0) || 0
    const totalDonations = donations?.length || 0
    const recurringDonations = donations?.filter((d) => d.is_recurring).length || 0

    // Group by donation type
    const byType = donations?.reduce((acc: any, d) => {
      const type = d.donation_type
      if (!acc[type]) {
        acc[type] = { count: 0, amount: 0 }
      }
      acc[type].count++
      acc[type].amount += d.amount
      return acc
    }, {})

    return {
      success: true,
      data: {
        totalAmount: totalAmount / 100, // Convert from cents to dollars
        totalDonations,
        recurringDonations,
        averageDonation: totalDonations > 0 ? totalAmount / totalDonations / 100 : 0,
        byType,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch donation statistics',
    }
  }
}

/**
 * Cancel a recurring donation (subscription)
 */
export async function cancelRecurringDonation(subscriptionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Verify the subscription belongs to the user
    const { data: donation } = await supabase
      .from('donations')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (!donation) {
      return {
        success: false,
        error: 'Subscription not found or does not belong to you',
      }
    }

    // Cancel the subscription in Stripe
    await getStripe().subscriptions.cancel(subscriptionId)

    // Update the donation record
    await supabase
      .from('donations')
      .update({ status: 'cancelled' } as any)
      .eq('stripe_subscription_id', subscriptionId)

    return {
      success: true,
      data: { message: 'Recurring donation cancelled successfully' },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel recurring donation',
    }
  }
}
