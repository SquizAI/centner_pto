const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Supabase client with service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateEventImages() {
  try {
    console.log('Starting database update for event images...\n');

    // Read the results file
    const resultsPath = path.join(process.cwd(), 'event-images-results.json');
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

    console.log(`Found ${results.length} events to update\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Update each event
    for (const result of results) {
      if (!result.success) {
        console.log(`⏭️  Skipping ${result.id} (no image generated)`);
        errorCount++;
        continue;
      }

      try {
        const { data, error } = await supabase
          .from('events')
          .update({ image_url: result.imageUrl })
          .eq('id', result.id)
          .select();

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          console.log(`✓ Updated event: ${result.id}`);
          console.log(`  Image: ${result.imageUrl}`);
          successCount++;
        } else {
          console.log(`⚠️  Event not found: ${result.id}`);
          errorCount++;
          errors.push({ id: result.id, error: 'Event not found in database' });
        }
      } catch (error) {
        console.error(`✗ Error updating ${result.id}:`, error.message);
        errorCount++;
        errors.push({ id: result.id, error: error.message });
      }
    }

    // Summary
    console.log('\n\n=== UPDATE SUMMARY ===');
    console.log(`Total events: ${results.length}`);
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\nErrors encountered:');
      errors.forEach(err => {
        console.log(`- ${err.id}: ${err.error}`);
      });
    }

    console.log('\n✅ Database update complete!');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run the update
updateEventImages().catch(console.error);
