# Centner Academy PTO - Email Templates

This directory contains all the custom email templates used by Supabase Auth for the Centner Academy PTO application.

## 📧 Available Templates

### 1. **confirmation.html** - Email Confirmation
- **Subject**: "Welcome to Centner Academy PTO - Confirm Your Email"
- **When sent**: After a user signs up with email/password
- **Purpose**: Verify the user's email address
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`

### 2. **recovery.html** - Password Reset
- **Subject**: "Reset Your Centner Academy PTO Password"
- **When sent**: When a user requests a password reset
- **Purpose**: Allow users to securely reset their password
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`

### 3. **magic-link.html** - Magic Link Login
- **Subject**: "Your Magic Link to Centner Academy PTO"
- **When sent**: When a user requests passwordless login
- **Purpose**: Enable one-click login without password
- **Variables**: `{{ .ConfirmationURL }}`

### 4. **invite.html** - User Invitation
- **Subject**: "You're Invited to Join Centner Academy PTO!"
- **When sent**: When an admin invites a new user
- **Purpose**: Welcome new members to the community
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`

### 5. **email-change.html** - Email Address Change
- **Subject**: "Confirm Your Email Change - Centner Academy PTO"
- **When sent**: When a user requests to change their email
- **Purpose**: Verify email address changes
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`

### 6. **reauthentication.html** - Identity Verification
- **Subject**: "Verify Your Identity - Centner Academy PTO"
- **When sent**: When sensitive operations require re-authentication
- **Purpose**: Additional security for sensitive actions
- **Variables**: `{{ .Token }}`, `{{ .Email }}`

## 🎨 Design Features

All templates include:
- **Centner Academy branding** with bee logo and brand colors
- **Responsive design** that works on all devices
- **Accessible HTML** with proper semantic markup
- **Professional gradient headers** using brand colors (#00b4d8, #0077b6)
- **Clear call-to-action buttons**
- **Alternative text links** for email clients that don't support buttons
- **Security notices** where appropriate
- **Consistent footer** with contact information

## 🔧 Template Variables

Supabase provides these variables for use in email templates:

| Variable | Description | Available In |
|----------|-------------|--------------|
| `{{ .ConfirmationURL }}` | Complete confirmation/action URL | All templates |
| `{{ .Token }}` | 6-digit OTP code | confirmation, magic-link, reauthentication |
| `{{ .TokenHash }}` | Hashed token for custom URLs | All templates |
| `{{ .Email }}` | User's current email address | All templates |
| `{{ .NewEmail }}` | User's new email (for changes) | email-change only |
| `{{ .SiteURL }}` | Your application's site URL | All templates |
| `{{ .RedirectTo }}` | Custom redirect URL if provided | All templates |
| `{{ .Data }}` | User metadata from auth.users.user_metadata | All templates |

## 🚀 Updating Templates in Supabase

### Method 1: Using the Update Script (Recommended)

1. **Get your Supabase Access Token**
   ```bash
   # Visit https://supabase.com/dashboard/account/tokens
   # Create a new token or copy an existing one
   ```

2. **Set the environment variable**
   ```bash
   export SUPABASE_ACCESS_TOKEN="your-token-here"
   ```

3. **Run the update script**
   ```bash
   node scripts/update-email-templates.js
   ```

The script will automatically update all templates in your Supabase project!

### Method 2: Manual Update via Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/whtwuisrljgjtpzbyhfp/auth/templates)
2. Navigate to **Authentication** → **Email Templates**
3. For each template:
   - Click on the template name
   - Copy the HTML content from the corresponding file in this directory
   - Paste it into the template editor
   - Update the subject line (see subjects below)
   - Click **Save**

### Method 3: Using the Supabase Management API

```bash
# Get your access token
export SUPABASE_ACCESS_TOKEN="your-token-here"
export PROJECT_REF="whtwuisrljgjtpzbyhfp"

# Update a specific template
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_subjects_confirmation": "Welcome to Centner Academy PTO - Confirm Your Email",
    "mailer_templates_confirmation_content": "<html>...your template content...</html>"
  }'
```

## 📝 Email Subject Lines

When updating templates manually, use these subject lines:

- **Confirmation**: "Welcome to Centner Academy PTO - Confirm Your Email"
- **Recovery**: "Reset Your Centner Academy PTO Password"
- **Magic Link**: "Your Magic Link to Centner Academy PTO"
- **Invite**: "You're Invited to Join Centner Academy PTO!"
- **Email Change**: "Confirm Your Email Change - Centner Academy PTO"
- **Reauthentication**: "Verify Your Identity - Centner Academy PTO"

## 🧪 Testing Email Templates

After updating templates, test each flow:

1. **Confirmation Email**
   ```bash
   # Sign up a new test user
   # Check email inbox for confirmation
   ```

2. **Password Reset**
   ```bash
   # Go to /forgot-password
   # Request password reset
   # Check email for reset link
   ```

3. **Magic Link**
   ```bash
   # Use magic link login (if implemented)
   # Check email for magic link
   ```

4. **Invite**
   ```bash
   # As admin, invite a new user
   # Check invitee's email
   ```

5. **Email Change**
   ```bash
   # Update email in profile settings
   # Check both old and new email inboxes
   ```

## 🎨 Customization Guide

To customize the templates:

1. **Update Brand Colors**
   - Primary: `#00b4d8` (Centner blue)
   - Secondary: `#0077b6` (Darker blue)
   - Accent: `#FFD700` (Bee yellow)
   - Update these in the `<style>` section of each template

2. **Update Logo**
   - The bee logo is currently SVG inline
   - Replace with `<img src="your-logo-url">` if you prefer an image

3. **Update Contact Information**
   - Footer email: `support@centneracademy.com`
   - Update in all template footers

4. **Update Site URL**
   - Uses `{{ .SiteURL }}` variable automatically
   - Can be configured in Supabase Auth settings

## 📚 Additional Resources

- [Supabase Email Templates Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customizing Email Templates Guide](https://supabase.com/docs/guides/local-development/customizing-email-templates)
- [Supabase Management API](https://supabase.com/docs/reference/api)

## 🐛 Troubleshooting

### Templates not updating
- Verify your access token is valid and has proper permissions
- Check that you're using the correct project reference
- Try updating through the dashboard as a fallback

### Emails not being sent
- Check Supabase Auth email provider settings
- Verify email rate limits haven't been exceeded
- Check spam folders
- Review Supabase logs for errors

### Links not working
- Ensure Site URL is configured correctly in Auth settings
- Check Redirect URLs whitelist includes your domains
- Verify email tracking is disabled (see limitations below)

### Styling issues
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Use inline styles for better compatibility
- Avoid advanced CSS (flexbox, grid) as support varies

## ⚠️ Limitations

1. **Email Tracking**: Some email providers (Microsoft Defender, etc.) may prefetch links, consuming tokens instantly. Consider using OTP codes (`{{ .Token }}`) for critical flows.

2. **Email Client Support**: Not all email clients support modern CSS. Templates use table-based layouts and inline styles for maximum compatibility.

3. **Image Hosting**: If you replace SVG logos with images, ensure they're hosted on a public, reliable server.

## 📞 Support

For questions or issues with email templates:
- Technical Support: [GitHub Issues](https://github.com/your-repo/issues)
- Email: support@centneracademy.com
- Supabase Docs: https://supabase.com/docs

---

**Last Updated**: 2025-10-16
**Version**: 1.0.0
**Maintained by**: Centner Academy PTO Development Team
