#!/usr/bin/env node

/**
 * Apply Database Migrations Directly
 * Uses Supabase REST API to execute SQL migrations
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://whtwuisrljgjtpzbyhfp.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndodHd1aXNybGpnanRwemJ5aGZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ3ODMyMCwiZXhwIjoyMDc2MDU0MzIwfQ.IQmjxX2ymX9hoVsbhyOyLdMpERQJp2ay08JMyhbL7VQ';

// Migrations to apply
const migrations = [
  {
    name: 'Event RSVPs Table',
    file: path.join(__dirname, '../supabase/migrations/20251016120000_enhance_event_rsvps.sql')
  },
  {
    name: 'Stripe Donation Fields',
    file: path.join(__dirname, '../supabase/migrations/20251016100000_add_stripe_donation_fields.sql')
  }
];

// Execute SQL via Supabase REST API
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'whtwuisrljgjtpzbyhfp.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Main execution
async function applyMigrations() {
  console.log('\n🚀 Applying database migrations to Supabase...\n');

  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    console.log(`📝 Applying: ${migration.name}`);

    try {
      // Read migration file
      const sql = fs.readFileSync(migration.file, 'utf-8');

      // Execute via Supabase REST API
      await executeSQL(sql);

      console.log(`✅ Success: ${migration.name}\n`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed: ${migration.name}`);
      console.error(`   Error: ${error.message}\n`);
      failCount++;
    }
  }

  // Summary
  console.log('═'.repeat(50));
  console.log('📊 Migration Summary');
  console.log('═'.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
  }
  console.log('═'.repeat(50));

  if (failCount === 0) {
    console.log('\n🎉 All migrations applied successfully!\n');
    console.log('Next steps:');
    console.log('   1. Test events at http://localhost:5001/events');
    console.log('   2. Test donations at http://localhost:5001/donate');
    console.log('   3. Test store at http://localhost:5001/store\n');
  } else {
    console.log('\n⚠️  Some migrations failed. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run
applyMigrations().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
