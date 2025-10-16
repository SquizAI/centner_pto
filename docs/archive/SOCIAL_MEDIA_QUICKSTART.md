# Social Media Integration - Quick Start Guide

Fast setup guide for connecting Instagram and Facebook to import photos into the gallery.

## Prerequisites

- Admin access to the PTO website
- Instagram Business account (linked to a Facebook Page)
- Facebook Page with admin access
- Meta (Facebook) Developer account

## Quick Setup (5 Steps)

### Step 1: Create Meta App (5 minutes)

1. Go to https://developers.facebook.com/
2. Click "My Apps" → "Create App" → "Business"
3. Name: "Centner PTO Photo Gallery"
4. Add products: "Instagram Graph API" and "Facebook Login"

### Step 2: Configure OAuth Redirect URIs (2 minutes)

In your Meta app settings, add these redirect URIs:

**Production:**
```
https://your-domain.com/api/social-media/instagram/callback
https://your-domain.com/api/social-media/facebook/callback
```

**Development:**
```
http://localhost:3000/api/social-media/instagram/callback
http://localhost:3000/api/social-media/facebook/callback
```

### Step 3: Get API Credentials (1 minute)

1. Go to Settings → Basic in your Meta app
2. Copy "App ID" and "App Secret"

### Step 4: Configure Environment Variables (2 minutes)

Add to `.env.local`:

```env
# Meta API Credentials (same for Instagram and Facebook)
INSTAGRAM_APP_ID=your-app-id-here
INSTAGRAM_APP_SECRET=your-app-secret-here
FACEBOOK_APP_ID=your-app-id-here
FACEBOOK_APP_SECRET=your-app-secret-here

# Generate encryption key with: node scripts/generate-encryption-key.js
ENCRYPTION_KEY=your-64-character-hex-key-here

# Your website URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Generate encryption key:
```bash
node scripts/generate-encryption-key.js
```

### Step 5: Run Database Migration (1 minute)

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard
# Run SQL from: supabase/migrations/20251015210000_create_social_media_connections.sql
```

## Usage (3 Steps)

### Step 1: Connect Account

1. Visit `/admin/social-media`
2. Click "Connect Instagram" or "Connect Facebook"
3. Authorize the app

### Step 2: Fetch Posts

1. Go to "Instagram Import" or "Facebook Import" tab
2. Select your connected account
3. Select target album
4. Click "Fetch Posts"

### Step 3: Import Photos

1. Select photos to import (checkboxes)
2. Click "Import X Photo(s)"
3. Wait for completion

## File Structure

```
/src/app/api/social-media/
  instagram/
    auth/route.ts              # OAuth initiation
    callback/route.ts          # OAuth callback
    posts/route.ts             # Fetch posts
  facebook/
    auth/route.ts              # OAuth initiation
    callback/route.ts          # OAuth callback
    posts/route.ts             # Fetch photos

/src/app/actions/
  social-media-actions.ts      # Server actions

/src/app/admin/social-media/
  page.tsx                     # Admin page
  social-media-client.tsx      # Client component

/src/components/admin/
  InstagramImport.tsx          # Instagram import UI
  FacebookImport.tsx           # Facebook import UI

/src/lib/
  social-media-api.ts          # Meta API client
  encryption.ts                # Token encryption

/supabase/migrations/
  20251015210000_create_social_media_connections.sql
```

## Troubleshooting

### Token Expired Error
**Fix**: Disconnect and reconnect the account

### No Instagram Business Account Found
**Fix**: Convert Instagram to Business and link to Facebook Page

### Import Fails
**Check**:
- Storage bucket permissions
- Network connectivity
- Server logs for errors

## Common Tasks

### Reconnect Expired Account
```
1. Go to /admin/social-media
2. Click "Disconnect"
3. Click "Connect Instagram/Facebook"
4. Re-authorize
```

### Import from Hashtag
```
Currently not supported
Use the standard import flow
```

### Delete Imported Photo
```
1. Go to gallery admin
2. Find the photo
3. Click delete
Note: Import record remains to prevent re-import
```

## API Rate Limits

- **Instagram**: 200 calls/hour
- **Facebook**: 200 calls/hour
- **Import**: ~1-2 seconds per photo

## Security Features

- ✅ Encrypted token storage (AES-256-GCM)
- ✅ Admin-only access
- ✅ Row-level security policies
- ✅ CSRF protection
- ✅ Token expiration handling
- ✅ Duplicate prevention

## Support

- **Full Documentation**: See SOCIAL_MEDIA_INTEGRATION.md
- **Meta API Docs**: https://developers.facebook.com/docs/graph-api
- **Instagram API**: https://developers.facebook.com/docs/instagram-api

## Production Checklist

Before going live:

- [ ] Meta app reviewed and approved (if needed)
- [ ] Production redirect URIs configured
- [ ] Environment variables set in production
- [ ] Encryption key generated and secured
- [ ] Database migration applied
- [ ] Storage bucket permissions verified
- [ ] Test Instagram connection
- [ ] Test Facebook connection
- [ ] Test photo import flow
- [ ] Monitor error logs
