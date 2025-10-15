/**
 * Token Encryption/Decryption Utility
 *
 * Uses AES-256-GCM encryption to securely store OAuth tokens in the database.
 * Requires ENCRYPTION_KEY environment variable (32-byte hex string).
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Get encryption key from environment variable
 * Must be a 32-byte (256-bit) key in hex format
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  // Validate key format (should be 64 hex characters for 32 bytes)
  if (!/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Generate a new encryption key (for initial setup)
 * Run this once to generate a key for your .env file
 *
 * Example: node -e "console.log(require('./lib/encryption').generateEncryptionKey())"
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Encrypt a token string
 * Returns encrypted data in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function encryptToken(token: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine iv, authTag, and encrypted data
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting token:', error);
    throw new Error('Failed to encrypt token');
  }
}

/**
 * Decrypt a token string
 * Expects data in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const key = getEncryptionKey();

    // Split the encrypted token into its components
    const parts = encryptedToken.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }

    const [ivHex, authTagHex, encryptedData] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting token:', error);
    throw new Error('Failed to decrypt token');
  }
}

/**
 * Validate encryption key format
 */
export function isValidEncryptionKey(key: string): boolean {
  return /^[0-9a-f]{64}$/i.test(key);
}

/**
 * Check if encryption is properly configured
 */
export function isEncryptionConfigured(): boolean {
  try {
    const key = process.env.ENCRYPTION_KEY;
    return !!key && isValidEncryptionKey(key);
  } catch {
    return false;
  }
}
