# Stripe Webhook Setup Guide

## Step 1: Configure Webhook Secret for Local Development

### Option A: Using Stripe CLI (Recommended for Testing)

1. **Install Stripe CLI** (if not already installed):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Start webhook forwarding**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from the output (starts with `whsec_`):
   ```
   Ready! You are using Stripe API Version [2025-02-24.acacia]. Your webhook signing secret is whsec_xxxxx
   ```

5. **Add to .env.local**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

### Option B: Using Stripe Dashboard (For Production)

1. **Go to Stripe Dashboard**:
   - Visit: https://dashboard.stripe.com/test/webhooks
   - Click "Add endpoint"

2. **Configure endpoint**:
   - **Endpoint URL**: `https://yourdomain.com/api/webhooks/stripe`
   - **Events to listen to**: Select these events:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `charge.refunded`
     - `invoice.paid`
     - `customer.subscription.deleted`

3. **Copy the signing secret**:
   - After creating the endpoint, click on it
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

4. **Add to .env.local**:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

## Step 2: Test the Webhook

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **In another terminal, run Stripe CLI listener**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Trigger a test webhook**:
   ```bash
   stripe trigger checkout.session.completed
   ```

4. **Check your server logs** for webhook processing messages

## Step 3: Verify Configuration

Run the configuration test script:
```bash
npx tsx scripts/test-stripe-config.ts
```

## Important Notes

- **Test Mode**: Use test webhook secret for development (`whsec_test_...`)
- **Production**: Create a separate webhook endpoint with production secret
- **Security**: Never commit webhook secrets to version control
- **Restart**: Restart your Next.js server after adding the webhook secret
