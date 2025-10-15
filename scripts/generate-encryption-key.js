#!/usr/bin/env node

/**
 * Generate Encryption Key for Social Media Token Storage
 *
 * This script generates a secure 256-bit (32-byte) encryption key
 * for encrypting OAuth tokens before storing them in the database.
 *
 * Usage:
 *   node scripts/generate-encryption-key.js
 *
 * Output:
 *   A 64-character hexadecimal string
 *
 * Add the output to your .env.local file:
 *   ENCRYPTION_KEY=<generated-key>
 */

const crypto = require('crypto');

console.log('\n🔐 Generating Encryption Key for Social Media Integration\n');
console.log('━'.repeat(60));

// Generate 32-byte (256-bit) random key
const key = crypto.randomBytes(32).toString('hex');

console.log('\nGenerated Encryption Key:');
console.log(key);
console.log('\n' + '━'.repeat(60));
console.log('\n✅ Add this to your .env.local file:');
console.log(`\nENCRYPTION_KEY=${key}\n`);
console.log('⚠️  Keep this key secure and never commit it to version control!');
console.log('⚠️  If you lose this key, you will need to reconnect all social media accounts.\n');
