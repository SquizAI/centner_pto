# OAuth Setup Guide

This guide explains how to configure social login (OAuth) providers for the Centner Academy PTO website.

## Overview

The website now supports social login with **Google** and **Facebook**. Users can sign up or log in using their existing social media accounts.

## What's Been Implemented

✅ OAuth login buttons on Login and Signup pages
✅ OAuth callback route handler (`/auth/callback`)
✅ Automatic profile creation for OAuth users
✅ Server action for OAuth sign-in
✅ React Icons package for social media icons

## Setup Instructions

### 1. Configure Google OAuth

#### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application** as the application type
6. Add your authorized redirect URIs:
   - Development: `http://localhost:54321/auth/v1/callback`
   - Production: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
7. Click **Create** and save your **Client ID** and **Client Secret**

#### Step 2: Configure in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and toggle it **ON**
5. Enter your **Client ID** and **Client Secret**
6. Click **Save**

### 2. Configure Facebook OAuth

#### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as the app type
4. Fill in your app details and create the app
5. In the left sidebar, click **Add Product** and select **Facebook Login**
6. Click **Settings** under Facebook Login
7. Add your valid OAuth redirect URIs:
   - Development: `http://localhost:54321/auth/v1/callback`
   - Production: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
8. Click **Save Changes**

#### Step 2: Set Up Email Permissions

1. Go to **Use Cases** in the left sidebar
2. Click **Edit** on **Authentication and Account Creation**
3. Ensure `email` permission is **Ready for testing**
4. If not, click **Add** to request it

#### Step 3: Get App Credentials

1. Go to **Settings** → **Basic** in the left sidebar
2. Copy your **App ID** (this is your Client ID)
3. Click **Show** next to **App Secret** and copy it

#### Step 4: Configure in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Facebook** and toggle it **ON**
5. Enter your **Facebook Client ID** (App ID) and **Facebook Client Secret** (App Secret)
6. Click **Save**

## Environment Variables

Ensure the following environment variable is set in your `.env.local` file:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:5001  # For development
# or
NEXT_PUBLIC_SITE_URL=https://your-domain.com  # For production
```

This is used for OAuth callback redirects.

## About Instagram and TikTok

### Instagram
Instagram OAuth is **not available** as a direct login provider through Supabase. Instagram's authentication is managed through Facebook's platform. Users can:
- Log in with Facebook (which is linked to their Instagram account)
- Or use the existing social media import features to fetch Instagram content

### TikTok
TikTok OAuth is **not currently supported** by Supabase as a social login provider. TikTok's API access requires:
- Special approval from TikTok
- Business account verification
- Limited access to authentication endpoints

**Alternative**: You can implement TikTok content importing (similar to the existing Facebook/Instagram import features) using TikTok's Content Posting API, but direct user authentication via TikTok is not available.

## Testing OAuth Locally

### For Local Development:

1. Make sure your Supabase project is configured with the local callback URL:
   ```
   http://localhost:54321/auth/v1/callback
   ```

2. Add this to your OAuth provider settings (Google/Facebook)

3. Start your development server:
   ```bash
   npm run dev
   ```

4. Navigate to `/login` or `/signup` and click on the Google or Facebook button

## Available OAuth Providers

Supabase supports many OAuth providers. In addition to Google and Facebook, you can also configure:

- GitHub
- Twitter
- Azure
- LinkedIn
- Discord
- And many more

To add more providers, follow the same pattern:
1. Update `signInWithOAuth` function in `auth-actions.ts` to include the provider
2. Add the provider button to LoginForm and SignupForm
3. Configure the provider in Supabase Dashboard
4. Obtain credentials from the provider's developer portal

## Troubleshooting

### OAuth callback fails
- Check that your callback URL is correctly configured in both the OAuth provider and Supabase
- Verify that environment variables are set correctly
- Ensure the OAuth provider credentials are correct

### Profile not created
- The OAuth callback route automatically creates profiles for OAuth users
- Check Supabase logs for any errors
- Verify RLS policies on the profiles table allow inserts

### Redirects to wrong URL
- Check `NEXT_PUBLIC_SITE_URL` environment variable
- Verify the `redirectTo` parameter in the `signInWithOAuth` function

## Security Notes

1. **Never commit OAuth secrets** to version control
2. Use environment variables for all sensitive credentials
3. OAuth tokens are automatically managed by Supabase
4. Provider tokens are not stored in the database for security
5. RLS policies protect user data

## Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Facebook OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Next.js Server-Side Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
