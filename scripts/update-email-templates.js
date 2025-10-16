#!/usr/bin/env node

/**
 * Script to update Supabase email templates
 *
 * This script reads the email templates from the supabase/email-templates directory
 * and updates them in your Supabase project using the Management API.
 *
 * Usage:
 *   node scripts/update-email-templates.js
 *
 * Requirements:
 *   - SUPABASE_ACCESS_TOKEN: Get from https://supabase.com/dashboard/account/tokens
 *   - PROJECT_REF: Your Supabase project reference (whtwuisrljgjtpzbyhfp)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_REF = 'whtwuisrljgjtpzbyhfp';
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!SUPABASE_ACCESS_TOKEN) {
  console.error('❌ Error: SUPABASE_ACCESS_TOKEN environment variable is required');
  console.log('\n📝 To get your access token:');
  console.log('   1. Go to https://supabase.com/dashboard/account/tokens');
  console.log('   2. Create a new token or copy an existing one');
  console.log('   3. Run: export SUPABASE_ACCESS_TOKEN="your-token-here"');
  console.log('   4. Then run this script again\n');
  process.exit(1);
}

// Template mappings
const templates = {
  'confirmation.html': {
    subject_key: 'mailer_subjects_confirmation',
    content_key: 'mailer_templates_confirmation_content',
    subject: 'Welcome to Centner Academy PTO - Confirm Your Email',
    description: 'Email confirmation for new signups'
  },
  'recovery.html': {
    subject_key: 'mailer_subjects_recovery',
    content_key: 'mailer_templates_recovery_content',
    subject: 'Reset Your Centner Academy PTO Password',
    description: 'Password recovery email'
  },
  'magic-link.html': {
    subject_key: 'mailer_subjects_magic_link',
    content_key: 'mailer_templates_magic_link_content',
    subject: 'Your Magic Link to Centner Academy PTO',
    description: 'Passwordless login magic link'
  },
  'invite.html': {
    subject_key: 'mailer_subjects_invite',
    content_key: 'mailer_templates_invite_content',
    subject: "You're Invited to Join Centner Academy PTO!",
    description: 'User invitation email'
  },
  'email-change.html': {
    subject_key: 'mailer_subjects_email_change',
    content_key: 'mailer_templates_email_change_content',
    subject: 'Confirm Your Email Change - Centner Academy PTO',
    description: 'Email address change confirmation'
  },
  'reauthentication.html': {
    subject_key: 'mailer_subjects_reauthentication',
    content_key: 'mailer_templates_reauthentication_content',
    subject: 'Verify Your Identity - Centner Academy PTO',
    description: 'Reauthentication verification code'
  }
};

async function updateEmailTemplates() {
  console.log('🚀 Starting email template update...\n');
  console.log(`📦 Project: ${PROJECT_REF}\n`);

  const templatesDir = path.join(__dirname, '../supabase/email-templates');
  const updatePayload = {};

  // Read all template files
  console.log('📖 Reading template files...');
  for (const [filename, config] of Object.entries(templates)) {
    const filePath = path.join(templatesDir, filename);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      updatePayload[config.subject_key] = config.subject;
      updatePayload[config.content_key] = content;
      console.log(`   ✓ ${filename} - ${config.description}`);
    } catch (error) {
      console.error(`   ✗ Failed to read ${filename}: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('\n📤 Updating templates in Supabase...');

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    console.log('\n✅ All email templates updated successfully!\n');
    console.log('📋 Updated templates:');
    for (const [filename, config] of Object.entries(templates)) {
      console.log(`   • ${config.description}`);
      console.log(`     Subject: "${config.subject}"`);
    }

    console.log('\n🎉 Done! Your email templates are now live.\n');
    console.log('💡 Next steps:');
    console.log('   1. Test the templates by signing up a new user');
    console.log('   2. Check your email for the confirmation message');
    console.log('   3. Verify all email flows work correctly\n');

  } catch (error) {
    console.error('\n❌ Failed to update email templates:');
    console.error(`   ${error.message}\n`);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('🔑 Authentication issue detected. Please check:');
      console.log('   1. Your access token is valid');
      console.log('   2. The token has the required permissions');
      console.log('   3. Generate a new token at https://supabase.com/dashboard/account/tokens\n');
    }

    process.exit(1);
  }
}

// Run the script
updateEmailTemplates().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
