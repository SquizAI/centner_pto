# Social Media Integration Guide

Complete guide for setting up and using social media integration for the Centner Academy PTO photo gallery.

## Overview

The social media integration allows administrators to import photos from Instagram Business accounts and Facebook Pages directly into the photo gallery. This eliminates the need to manually download and upload photos from social media.

## Features

- **Instagram Business Integration**: Import posts from Instagram Business accounts
- **Facebook Page Integration**: Import photos from Facebook Pages
- **Secure Token Storage**: OAuth tokens are encrypted before storage
- **Duplicate Prevention**: Tracks imported posts to prevent duplicates
- **Batch Import**: Select and import multiple posts at once
- **Metadata Preservation**: Imports captions, dates, and engagement stats
- **Token Management**: Automatic token expiration handling and refresh

## Setup Instructions

### 1. Create Facebook/Meta App

Both Instagram and Facebook integrations use the Meta Graph API, so you'll need to create a Meta (Facebook) app.

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Business" as app type
4. Fill in app details:
   - **App Name**: Centner PTO Photo Gallery
   - **App Contact Email**: Your email
5. Click "Create App"

### 2. Configure Instagram Integration

1. In your Meta app, go to "Add Products"
2. Add "Instagram Graph API"
3. Go to "Instagram Graph API" → "Basic Display" → "Settings"
4. Add OAuth Redirect URIs:
   ```
   https://your-domain.com/api/social-media/instagram/callback
   http://localhost:3000/api/social-media/instagram/callback (for development)
   ```
5. Add required permissions:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_read_engagement`

**Requirements**:
- Must have an Instagram Business account
- Instagram Business account must be connected to a Facebook Page
- Facebook Page must be linked to your Meta app

### 3. Configure Facebook Integration

1. In your Meta app, go to "Add Products"
2. Add "Facebook Login"
3. Go to "Facebook Login" → "Settings"
4. Add OAuth Redirect URIs:
   ```
   https://your-domain.com/api/social-media/facebook/callback
   http://localhost:3000/api/social-media/facebook/callback (for development)
   ```
5. Add required permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`

### 4. Get API Credentials

1. In your Meta app, go to "Settings" → "Basic"
2. Copy the **App ID** and **App Secret**
3. Add them to your `.env.local` file:

```env
INSTAGRAM_APP_ID=your-app-id
INSTAGRAM_APP_SECRET=your-app-secret
FACEBOOK_APP_ID=your-app-id (same as Instagram)
FACEBOOK_APP_SECRET=your-app-secret (same as Instagram)
```

### 5. Generate Encryption Key

Generate a secure encryption key for token storage:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the generated key to your `.env.local`:

```env
ENCRYPTION_KEY=your-64-character-hex-key
```

### 6. Run Database Migration

Apply the social media database migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually in Supabase Dashboard
# Run the SQL from: supabase/migrations/20251015210000_create_social_media_connections.sql
```

### 7. Verify Setup

1. Start your development server
2. Log in as an admin
3. Navigate to `/admin/social-media`
4. You should see the social media management page

## Usage Guide

### Connecting Instagram

1. Go to `/admin/social-media`
2. Click "Connect Instagram"
3. Log in with your Facebook account (that owns the Instagram Business account)
4. Grant the requested permissions
5. Select your Facebook Page (linked to your Instagram Business account)
6. You'll be redirected back with a success message

**Troubleshooting**:
- If you see "No Instagram Business account found": Make sure your Instagram account is set to Business mode and linked to a Facebook Page
- If permissions are denied: You may need to request app review from Meta for production use

### Connecting Facebook

1. Go to `/admin/social-media`
2. Click "Connect Facebook"
3. Log in with your Facebook account
4. Grant the requested permissions
5. Select your Facebook Page
6. You'll be redirected back with a success message

### Importing Photos

#### From Instagram:

1. Go to `/admin/social-media`
2. Click the "Instagram Import" tab
3. Select your connected Instagram account
4. Select the target album (or create a new one)
5. Click "Fetch Posts"
6. Review the posts loaded from Instagram
7. Select the posts you want to import (click checkboxes or use "Select All")
8. Click "Import X Photo(s)"
9. Wait for the import to complete

#### From Facebook:

1. Go to `/admin/social-media`
2. Click the "Facebook Import" tab
3. Select your connected Facebook page
4. Select the target album
5. Click "Fetch Photos"
6. Review the photos loaded from Facebook
7. Select the photos you want to import
8. Click "Import X Photo(s)"
9. Wait for the import to complete

### Managing Connections

#### View Connection Status

The Connections tab shows:
- Connected accounts
- Connection status (active/inactive)
- Last sync time
- Token expiration date
- Any error messages

#### Refresh Connection

Click the "Sync" button to manually refresh the connection and update last sync time.

#### Disconnect Account

Click the "Disconnect" button to remove a connection. Note:
- Import history is preserved
- Previously imported photos remain in the gallery
- You can reconnect at any time

## API Endpoints

### Instagram

- `GET /api/social-media/instagram/auth` - Initiate OAuth flow
- `GET /api/social-media/instagram/callback` - OAuth callback handler
- `GET /api/social-media/instagram/posts?connectionId={id}&limit={n}` - Fetch posts

### Facebook

- `GET /api/social-media/facebook/auth` - Initiate OAuth flow
- `GET /api/social-media/facebook/callback` - OAuth callback handler
- `GET /api/social-media/facebook/posts?connectionId={id}&limit={n}` - Fetch photos

## Server Actions

Located in `/src/app/actions/social-media-actions.ts`:

- `getConnections()` - Get all connected accounts
- `disconnectAccount(connectionId)` - Remove a connection
- `syncAccount(connectionId)` - Manually sync account
- `importPosts(data)` - Import selected posts
- `getRecentImports(connectionId, limit)` - Get import history

## Database Schema

### social_media_connections

Stores OAuth connections to social media platforms.

```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- platform: TEXT ('instagram' | 'facebook')
- account_id: TEXT (platform-specific account ID)
- account_name: TEXT (display name)
- account_username: TEXT (username/handle)
- access_token: TEXT (encrypted)
- token_expires_at: TIMESTAMPTZ
- refresh_token: TEXT (encrypted)
- is_active: BOOLEAN
- connected_at: TIMESTAMPTZ
- last_sync_at: TIMESTAMPTZ
- last_error: TEXT
- metadata: JSONB
```

### social_media_imports

Tracks imported posts to prevent duplicates.

```sql
- id: UUID (primary key)
- connection_id: UUID (references social_media_connections)
- album_id: UUID (references photo_albums)
- photo_id: UUID (references photos)
- post_id: TEXT (platform-specific post ID)
- post_url: TEXT (permalink)
- post_date: TIMESTAMPTZ
- imported_at: TIMESTAMPTZ
- imported_by: UUID (references auth.users)
- metadata: JSONB
```

## Security

### Token Encryption

All OAuth tokens are encrypted using AES-256-GCM before storage:
- Encryption key is stored securely in environment variables
- Each token has a unique initialization vector (IV)
- Authentication tags ensure data integrity

### Access Control

- All endpoints require admin authentication
- Row-level security policies enforce user isolation
- Tokens are never exposed in API responses
- CSRF protection on all mutations

### Token Expiration

- Long-lived tokens expire after 60 days
- System automatically detects expired tokens
- Connections are marked inactive when tokens expire
- Users are prompted to reconnect when needed

## Limitations

### Meta API Rate Limits

- **Instagram**: 200 calls per hour per user
- **Facebook**: 200 calls per hour per user
- Batch operations count as multiple calls

### Instagram Requirements

- Must be an Instagram Business account
- Must be connected to a Facebook Page
- Cannot import from personal Instagram accounts

### Facebook Requirements

- Must be a Facebook Page (not personal profile)
- Must have admin access to the page
- Cannot import from groups or events

### Import Limitations

- Maximum 50 posts per fetch (adjustable)
- Only images are supported (videos skipped)
- Carousel posts import as separate images
- Original image quality preserved

## Troubleshooting

### "Token expired" error

**Solution**:
1. Go to Connections tab
2. Click "Disconnect" on the expired connection
3. Click "Connect Instagram/Facebook" again
4. Re-authorize the app

### "No Instagram Business account found"

**Causes**:
- Instagram account is not set to Business mode
- Instagram account not linked to a Facebook Page
- Facebook Page not connected to Meta app

**Solution**:
1. Convert Instagram to Business account
2. Link to a Facebook Page
3. Ensure Facebook Page has admin access

### Import fails silently

**Check**:
1. Network connectivity
2. Supabase storage bucket configuration
3. Browser console for errors
4. Server logs for detailed error messages

### Photos not appearing after import

**Verify**:
1. Album is published
2. Photos were successfully uploaded to storage
3. Database records were created
4. Cache was revalidated (may take a moment)

## Best Practices

### Token Management

- Reconnect accounts before tokens expire (60 days)
- Monitor the "Last Sync" time to ensure connections are active
- Disconnect unused connections

### Import Organization

- Create albums before importing
- Use descriptive album names
- Group imports by event/date
- Review captions before bulk importing

### Performance

- Import in smaller batches (10-20 at a time)
- Import during off-peak hours for large batches
- Wait for each import to complete before starting another

## Development

### Local Testing

1. Create a test Meta app
2. Add `http://localhost:3000` to redirect URIs
3. Use test Instagram/Facebook accounts
4. Generate a test encryption key

### Testing OAuth Flow

```bash
# Start development server
npm run dev

# Visit
http://localhost:3000/admin/social-media

# Click connect buttons to test OAuth
```

### Testing Imports

```bash
# Use test accounts with sample photos
# Monitor server logs for errors
# Check Supabase dashboard for data
```

## Support

For issues with:
- **Meta API**: [Meta Developers Support](https://developers.facebook.com/support)
- **Instagram Graph API**: [Instagram Platform Docs](https://developers.facebook.com/docs/instagram-api)
- **This Integration**: Contact your development team

## References

- [Meta Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/reference/page)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
