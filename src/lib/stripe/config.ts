import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  currency: 'usd',
  successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5001'}/donate/success`,
  cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5001'}/donate`,
} as const

export const DONATION_TYPES = {
  general: 'General PTO Support',
  playground: 'Playground Fund',
  stem: 'STEM Programs',
  arts: 'Arts & Music',
  field_trips: 'Field Trips',
  teacher_appreciation: 'Teacher Appreciation',
  campus_specific: 'Campus-Specific Projects',
} as const

export const PRESET_AMOUNTS = [25, 50, 100, 250, 500] as const

export const RECURRING_INTERVALS = {
  monthly: 'Monthly',
  quarterly: 'Every 3 Months',
  annual: 'Annually',
} as const
