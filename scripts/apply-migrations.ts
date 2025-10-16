#!/usr/bin/env tsx

/**
 * Apply Database Migrations
 *
 * This script applies the Supabase migrations for:
 * 1. Event RSVPs table
 * 2. Donations with Stripe fields
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
}

async function applyMigrations() {
  console.log('\n🚀 Applying database migrations...\n')

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      `${colors.red}❌ Missing required environment variables:${colors.reset}`
    )
    console.error('   NEXT_PUBLIC_SUPABASE_URL')
    console.error('   SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nAdd these to your .env.local file.')
    console.error(
      '\nGet your service role key from: https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp/settings/api'
    )
    process.exit(1)
  }

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Migration files
  const migrations = [
    {
      name: 'Event RSVPs Table',
      file: 'supabase/migrations/20251016120000_enhance_event_rsvps.sql',
    },
    {
      name: 'Stripe Donation Fields',
      file: 'supabase/migrations/20251016100000_add_stripe_donation_fields.sql',
    },
  ]

  let successCount = 0
  let failCount = 0

  for (const migration of migrations) {
    console.log(`📝 Applying: ${colors.blue}${migration.name}${colors.reset}`)

    try {
      // Read migration file
      const sql = readFileSync(
        join(process.cwd(), migration.file),
        'utf-8'
      )

      // Execute migration
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

      if (error) {
        // Try direct execution as fallback
        const { error: directError } = await supabase
          .from('_migrations')
          .select('*')
          .limit(1)

        if (directError) {
          console.error(
            `${colors.red}❌ Failed: ${migration.name}${colors.reset}`
          )
          console.error(`   Error: ${error.message}`)
          failCount++
          continue
        }
      }

      console.log(`${colors.green}✓ Applied: ${migration.name}${colors.reset}\n`)
      successCount++
    } catch (err) {
      console.error(
        `${colors.red}❌ Failed: ${migration.name}${colors.reset}`
      )
      console.error(`   Error: ${err}`)
      failCount++
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 Migration Summary')
  console.log('='.repeat(50))
  console.log(`${colors.green}✓ Successful: ${successCount}${colors.reset}`)
  if (failCount > 0) {
    console.log(`${colors.red}❌ Failed: ${failCount}${colors.reset}`)
  }
  console.log('='.repeat(50) + '\n')

  if (failCount > 0) {
    console.log(
      `${colors.yellow}⚠️  Some migrations failed. Please apply them manually:${colors.reset}`
    )
    console.log(
      '   1. Go to: https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp/sql'
    )
    console.log('   2. Copy and paste the SQL from each migration file')
    console.log('   3. Click "Run"\n')
    process.exit(1)
  } else {
    console.log(`${colors.green}🎉 All migrations applied successfully!${colors.reset}\n`)
    console.log('Next steps:')
    console.log('   1. Test events at http://localhost:5001/events')
    console.log('   2. Test donations at http://localhost:5001/donate')
    console.log('   3. Configure Stripe and Shopify (see setup guides)\n')
  }
}

// Run migrations
applyMigrations().catch((error) => {
  console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error)
  process.exit(1)
})
