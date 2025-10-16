# Donation System Setup Guide

Complete guide for setting up and testing the Stripe-powered donation system for Centner Academy PTO.

## Features

- One-time and recurring donations (monthly, quarterly, annual)
- Multiple donation types (General PTO, Playground, STEM, Arts, etc.)
- Secure payment processing via Stripe
- Anonymous donation option
- Donor information collection
- Tax-deductible receipts via email
- Donation history tracking
- Admin dashboard for donation management

## Prerequisites

1. Stripe Account (create at https://stripe.com)
2. Supabase Project (already configured: whtwuisrljgjtpzbyhfp)
3. Node.js 18.18.0 or higher

## Setup Instructions

### 1. Stripe Account Setup

#### Create Stripe Account
1. Go to https://dashboard.stripe.com/register
2. Complete account registration
3. Verify your email address

#### Get API Keys
1. Navigate to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

#### Configure Environment Variables
Add to your `.env.local` file:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx
STRIPE_SECRET_KEY=sk_test_51xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # We'll get this in step 2
```

### 2. Webhook Configuration

Webhooks allow Stripe to notify your application about payment events.

#### Option A: Production Setup (Recommended for deployment)

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `invoice.paid`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

#### Option B: Local Development Setup

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server (run in separate terminal)
stripe listen --forward-to localhost:5001/api/webhooks/stripe

# Copy the webhook signing secret displayed and add to .env.local
```

### 3. Database Migration

Run the migration to add Stripe fields to your database:

```bash
# Navigate to project directory
cd /path/to/centner-pto-website

# Run migration (via Supabase CLI or Dashboard)
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Using Supabase Dashboard
# 1. Go to https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp/sql
# 2. Copy contents of supabase/migrations/20251016100000_add_stripe_donation_fields.sql
# 3. Paste and run the SQL
```

### 4. Start Development Server

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The donation page will be available at: http://localhost:5001/donate

## Testing

### Test Cards

Stripe provides test cards for different scenarios:

#### Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

#### Failed Payment
```
Card Number: 4000 0000 0000 0002
```

#### 3D Secure Authentication Required
```
Card Number: 4000 0025 0000 3155
```

#### Declined Card
```
Card Number: 4000 0000 0000 9995
```

### Testing Workflow

1. **One-Time Donation**:
   - Go to http://localhost:5001/donate
   - Select amount ($25, $50, $100, or custom)
   - Choose "One-Time Donation"
   - Fill in donor information
   - Click "Continue to Payment"
   - Complete Stripe Checkout with test card
   - Verify redirect to success page
   - Check database for donation record

2. **Recurring Donation**:
   - Select amount and frequency (Monthly/Quarterly/Annual)
   - Complete checkout process
   - Subscription created in Stripe
   - First payment recorded immediately

3. **Test Webhooks**:
   ```bash
   # Trigger test webhook
   stripe trigger checkout.session.completed

   # Check server logs for webhook processing
   # Check database for donation record
   ```

4. **Verify Database**:
   ```sql
   -- Check recent donations
   SELECT * FROM donations ORDER BY created_at DESC LIMIT 10;

   -- Check donation statistics
   SELECT
     COUNT(*) as total_donations,
     SUM(amount) as total_amount,
     AVG(amount) as avg_amount,
     donation_type,
     is_recurring
   FROM donations
   WHERE status = 'succeeded'
   GROUP BY donation_type, is_recurring;
   ```

## File Structure

```
src/
├── app/
│   ├── actions/
│   │   └── donation-actions.ts          # Server actions for donations
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts             # Webhook handler
│   └── donate/
│       ├── page.tsx                     # Main donation page
│       └── success/
│           └── page.tsx                 # Success page
├── components/
│   └── donations/
│       └── DonationForm.tsx             # Donation form component
└── lib/
    └── stripe/
        └── config.ts                    # Stripe configuration

supabase/
└── migrations/
    └── 20251016100000_add_stripe_donation_fields.sql
```

## Troubleshooting

### Webhook Issues

**Problem**: Webhooks not being received

**Solutions**:
1. Verify webhook URL is correct
2. Check webhook signing secret matches `.env.local`
3. Ensure server is running and accessible
4. Check Stripe Dashboard → Webhooks → Logs for errors
5. Use `stripe listen` for local testing

### Payment Failures

**Problem**: Payments failing in test mode

**Solutions**:
1. Use correct test card numbers
2. Check Stripe Dashboard logs
3. Verify API keys are correct
4. Ensure webhook secret is set

### Database Errors

**Problem**: Donation not recorded in database

**Solutions**:
1. Check webhook handler logs
2. Verify database migration ran successfully
3. Check Supabase service role key is correct
4. Review donation record structure matches schema

### Environment Variables

**Problem**: Missing or incorrect environment variables

**Solutions**:
1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Restart development server after changes
4. Verify no typos in variable names

## Production Deployment

### Pre-Deployment Checklist

- [ ] Switch to Stripe live mode keys
- [ ] Configure production webhook endpoint
- [ ] Test with real payment methods (in test mode)
- [ ] Set up email notifications for donations
- [ ] Configure tax receipt generation
- [ ] Test all donation flows
- [ ] Set up monitoring and alerts
- [ ] Review Stripe security settings

### Environment Variables for Production

Update `.env.production` with live keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # From production webhook
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### Post-Deployment

1. Test donations in production with live mode test cards
2. Monitor webhook deliveries in Stripe Dashboard
3. Verify donation records are created correctly
4. Test email receipt delivery
5. Set up recurring donation management
6. Train PTO admin on donation dashboard

## Admin Features

### View Donations

Admins can view donation history and statistics:

```typescript
// In admin dashboard component
const result = await getAllDonations({
  status: 'succeeded',
  limit: 50
})

const stats = await getDonationStats()
```

### Cancel Recurring Donations

Users can cancel their own recurring donations:

```typescript
await cancelRecurringDonation(subscriptionId)
```

## Security Best Practices

1. **Never expose secret keys**: Only use `NEXT_PUBLIC_` prefix for publishable keys
2. **Always verify webhook signatures**: Prevents fake webhook attacks
3. **Use HTTPS in production**: Required for Stripe webhooks
4. **Implement rate limiting**: Prevent donation form abuse
5. **Validate amounts**: Enforce min/max donation amounts
6. **Log all transactions**: For audit trail and debugging
7. **Use idempotency keys**: Prevent duplicate charges

## Support and Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe Webhooks**: https://stripe.com/docs/webhooks
- **Supabase Documentation**: https://supabase.com/docs

## Next Steps

1. **Email Receipts**: Integrate with Resend/SendGrid for automated receipts
2. **Donation Tiers**: Create recognition levels (Bronze, Silver, Gold)
3. **Donor Dashboard**: Allow donors to view their history
4. **Matching Donations**: Support corporate matching
5. **Donation Goals**: Display progress toward fundraising goals
6. **PDF Receipts**: Generate downloadable tax receipts
7. **Donor Wall**: Public recognition page (with permission)

## Questions?

Contact the development team or refer to:
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp
