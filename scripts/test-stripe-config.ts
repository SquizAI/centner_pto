/**
 * Test script to verify Stripe configuration
 * Run with: npx tsx scripts/test-stripe-config.ts
 */

import Stripe from 'stripe'
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

async function testStripeConfig() {
  console.log('🔍 Testing Stripe Configuration...\n')

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables:')
  const requiredVars = [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]

  const missingVars = requiredVars.filter((key) => !process.env[key])

  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '))
    console.log('\nPlease add these to your .env.local file')
    process.exit(1)
  }

  console.log('✅ All required environment variables present\n')

  // Test Stripe API connection
  console.log('2️⃣ Testing Stripe API Connection:')
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-02-24.acacia',
    })

    const balance = await stripe.balance.retrieve()
    console.log('✅ Successfully connected to Stripe API')
    console.log(`   Test mode: ${!balance.livemode}`)
    console.log(`   Currency: ${balance.available[0]?.currency || 'usd'}\n`)
  } catch (error) {
    console.error('❌ Failed to connect to Stripe API:', error)
    process.exit(1)
  }

  // Test Supabase connection
  console.log('3️⃣ Testing Supabase Connection:')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase.from('donations').select('count').limit(1)

    if (error) throw error

    console.log('✅ Successfully connected to Supabase')
    console.log('   Donations table accessible\n')
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error)
    console.log('\nNote: Make sure you have run the database migrations')
    process.exit(1)
  }

  // Test webhook secret format
  console.log('4️⃣ Validating Webhook Secret:')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret || !webhookSecret.startsWith('whsec_')) {
    console.warn('⚠️  Webhook secret format looks incorrect')
    console.log('   Expected format: whsec_...')
    console.log('   This may cause webhook verification to fail\n')
  } else {
    console.log('✅ Webhook secret format looks correct\n')
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ All configuration checks passed!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  console.log('Next steps:')
  console.log('1. Start your development server: npm run dev')
  console.log('2. Test donations at: http://localhost:5001/donate')
  console.log('3. Set up webhook forwarding: stripe listen --forward-to localhost:5001/api/webhooks/stripe')
  console.log('\nFor production, update to live API keys and configure production webhooks.')
}

testStripeConfig().catch(console.error)
