# 🚀 Quick Start - Complete Donation Platform Setup

Your donation platform is 95% complete! Just need to add 2 API keys.

## Step 1: Get Stripe Webhook Secret (2 minutes)

### Option A: Local Development (Recommended for Testing)

1. **Install Stripe CLI** (if not already installed):
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```
   This will open your browser to authenticate.

3. **Start webhook listener**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook secret** from the output:
   ```
   Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
   ```

5. **Add to .env.local** on line 14:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Keep this terminal running** while testing donations!

### Option B: Production Setup (For Live Site)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
   - `invoice.paid`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Click "Reveal" under "Signing secret"
7. Copy the secret and add to `.env.local`

---

## Step 2: Get Resend API Key (2 minutes)

1. **Sign up for Resend**:
   - Visit: https://resend.com
   - Click "Sign Up" (free account)
   - Verify your email

2. **Get API Key**:
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"
   - Name it: `Centner PTO Website`
   - Permission: "Sending access"
   - Click "Add"
   - **Copy the key immediately** (starts with `re_`)

3. **Add to .env.local** on line 23:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Step 3: Update Email Template (1 minute)

Update the organization EIN for tax receipts:

1. Open: `src/lib/email/resend.ts`
2. Find line ~180: `EIN: [TO BE ADDED]`
3. Replace with your organization's EIN:
   ```
   EIN: 12-3456789
   ```

---

## Step 4: Test the System (3 minutes)

1. **Restart your development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **In a separate terminal, start Stripe webhook listener**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Open the donation page**:
   - Navigate to: http://localhost:3000/donate

4. **Make a test donation**:
   - Amount: $25
   - Type: General Fund
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
   - Fill in your email (you'll receive the receipt!)

5. **Verify success**:
   - ✅ Check: Redirected to success page
   - ✅ Check: Email receipt in inbox
   - ✅ Check: Stripe CLI shows webhook events
   - ✅ Check: Database record created

---

## Your .env.local Should Look Like:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # ← ADD THIS

# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx  # ← ADD THIS
```

---

## Test Cards Reference

| Card Number | Purpose |
|-------------|---------|
| `4242 4242 4242 4242` | ✅ Successful payment |
| `4000 0000 0000 0002` | ❌ Card declined |
| `4000 0025 0000 3155` | 🔐 3D Secure required |
| `4000 0000 0000 9995` | 💰 Insufficient funds |

---

## Troubleshooting

### "No signature found" error
- **Solution**: Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### No email received
- **Solution**: Check that `RESEND_API_KEY` is added and server restarted
- **Note**: First email in Resend free tier goes to your verified Resend account email

### "STRIPE_WEBHOOK_SECRET is not configured"
- **Solution**: Add the webhook secret to `.env.local` and restart server

---

## Production Deployment

When ready to go live:

1. ✅ Get production Stripe keys from: https://dashboard.stripe.com/apikeys
2. ✅ Create production webhook endpoint
3. ✅ Verify Resend domain (optional but recommended)
4. ✅ Update environment variables in hosting platform
5. ✅ Test with real payment (small amount)

---

## Support

- **Stripe Docs**: https://stripe.com/docs/testing
- **Resend Docs**: https://resend.com/docs
- **Full Documentation**: See `DONATION_PLATFORM_COMPLETION_CHECKLIST.md`

---

**Estimated Setup Time**: 5-10 minutes
**Next Step**: Add those 2 API keys to `.env.local` and test! 🎉
