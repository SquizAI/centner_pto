-- =====================================================
-- Add Stripe-specific fields for donations
-- Migration: Add stripe_subscription_id if not exists
-- Created: October 16, 2025
-- =====================================================

-- Add stripe_subscription_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'donations'
    AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE donations ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Add stripe_customer_id column to profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- Update donations table to match new schema
ALTER TABLE donations
  ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;

-- Add index for stripe_subscription_id lookups
CREATE INDEX IF NOT EXISTS idx_donations_subscription
  ON donations(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Add index for stripe_customer_id lookups on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Comments for documentation
COMMENT ON COLUMN donations.stripe_subscription_id IS 'Stripe subscription ID for recurring donations';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for user';
