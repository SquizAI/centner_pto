# Resend Email Service Setup Guide

## Overview

Resend is used to send donation receipt emails to donors automatically after successful donations.

## Step 1: Create a Resend Account

1. **Sign up for Resend**:
   - Visit: https://resend.com
   - Click "Sign Up" or "Get Started"
   - Create an account using your email or GitHub

2. **Verify your email address**
   - Check your inbox for verification email
   - Click the verification link

## Step 2: Get Your API Key

1. **Navigate to API Keys**:
   - Go to: https://resend.com/api-keys
   - Click "Create API Key"

2. **Configure the API Key**:
   - **Name**: `Centner PTO Website` (or any descriptive name)
   - **Permission**: Select "Sending access"
   - Click "Add"

3. **Copy the API Key**:
   - The key will be displayed once (starts with `re_`)
   - Copy it immediately (you won't be able to see it again)

4. **Add to .env.local**:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Step 3: Configure Domain (Optional for Production)

For production use, you should verify your sending domain:

1. **Add Domain**:
   - Go to: https://resend.com/domains
   - Click "Add Domain"
   - Enter your domain (e.g., `centnerpto.org`)

2. **Verify Domain**:
   - Add the provided DNS records to your domain
   - Wait for DNS propagation (can take up to 48 hours)
   - Click "Verify" once records are added

3. **Update Email From Address**:
   - Once domain is verified, update the `from` field in:
     - `src/lib/email/resend.ts` (line 48)
   - Change from: `donations@centnerpto.org`
   - To your verified domain email

## Step 4: Test Email Sending

### For Development (No Domain Verification Required)

Resend allows testing without domain verification:

1. **Use test mode**:
   - Emails will be sent to your verified Resend account email
   - Perfect for testing the email templates

2. **Run a test donation**:
   ```bash
   npm run dev
   ```
   - Navigate to: http://localhost:3000/donate
   - Complete a test donation with Stripe test card: `4242 4242 4242 4242`
   - Check your email inbox

### For Production

1. **Verify your domain** (see Step 3)
2. **Switch to production API key**
3. **Test with real payment** (use small amount)

## Resend Pricing

- **Free Tier**: 100 emails/day, 3,000 emails/month
- **Pro Plan**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

For PTO use case, the free tier should be sufficient initially.

## Email Template Customization

The email template is located in:
```
src/lib/email/resend.ts
```

You can customize:
- Email styling (HTML/CSS)
- Content and messaging
- Logo and branding
- Footer information

### Key areas to update:

1. **Organization EIN** (line ~180):
   ```html
   EIN: [TO BE ADDED]
   ```
   Replace with actual EIN for tax purposes.

2. **From Email** (line 48):
   ```typescript
   from: 'Centner Academy PTO <donations@centnerpto.org>'
   ```
   Update to your verified domain.

3. **Contact Email** (line ~190):
   ```html
   <a href="mailto:info@centnerpto.org">
   ```
   Update to your PTO contact email.

## Monitoring Email Delivery

1. **Resend Dashboard**:
   - View sent emails: https://resend.com/emails
   - Check delivery status
   - View email opens/clicks (if enabled)

2. **Logs**:
   - Check your application logs for:
     - `✅ Donation receipt sent: [email_id]`
     - Error messages if sending fails

## Troubleshooting

### Issue: "Email service not configured"

**Solution**: Check that `RESEND_API_KEY` is set in `.env.local`

### Issue: "Domain not verified"

**Solution**:
- Use your Resend account email for testing
- Or verify your domain (Step 3)

### Issue: Emails not being sent

**Check**:
1. API key is correct in `.env.local`
2. Server is restarted after adding API key
3. Webhook is properly configured and receiving events
4. Check Resend dashboard for errors

### Issue: Email in spam folder

**Solution**:
- Verify your sending domain (reduces spam score)
- Set up SPF, DKIM, and DMARC records
- Use consistent "from" address

## Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all API keys
3. **Rotate keys periodically** (every 90 days)
4. **Use different keys** for development and production
5. **Monitor usage** in Resend dashboard for unusual activity

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add to `.env.local`
3. ✅ Restart development server
4. ✅ Test with sample donation
5. ⬜ Verify domain for production
6. ⬜ Customize email template
7. ⬜ Add organization EIN

## Support

- **Resend Documentation**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **Status Page**: https://status.resend.com
