# Social Media Integration - Files Reference

Complete reference of all files created for the social media integration feature.

## Database

### Migration
- `supabase/migrations/20251015210000_create_social_media_connections.sql`
  - Creates `social_media_connections` table
  - Creates `social_media_imports` table
  - Adds indexes for performance
  - Includes helper functions
  - Implements RLS policies

## Type Definitions

- `src/types/social-media.types.ts`
  - SocialMediaConnection type
  - SocialMediaImport type
  - Platform types
  - Form data interfaces
  - Import result types

## Library Functions

### Encryption
- `src/lib/encryption.ts`
  - Token encryption (AES-256-GCM)
  - Token decryption
  - Key validation
  - Key generation utility

### Social Media API
- `src/lib/social-media-api.ts`
  - Instagram Graph API client
  - Facebook Graph API client
  - OAuth flow functions
  - Post/photo fetching
  - Image download utilities

## API Routes

### Instagram Routes
- `src/app/api/social-media/instagram/auth/route.ts`
  - OAuth initiation
  - Redirects to Instagram authorization

- `src/app/api/social-media/instagram/callback/route.ts`
  - OAuth callback handler
  - Token exchange
  - Store encrypted token
  - Fetch account info

- `src/app/api/social-media/instagram/posts/route.ts`
  - Fetch recent posts
  - Mark imported posts
  - Update sync time

### Facebook Routes
- `src/app/api/social-media/facebook/auth/route.ts`
  - OAuth initiation
  - Redirects to Facebook authorization

- `src/app/api/social-media/facebook/callback/route.ts`
  - OAuth callback handler
  - Token exchange
  - Store encrypted token
  - Fetch page info

- `src/app/api/social-media/facebook/posts/route.ts`
  - Fetch recent photos
  - Mark imported photos
  - Update sync time

## Server Actions

- `src/app/actions/social-media-actions.ts`
  - `getConnections()` - List connected accounts
  - `disconnectAccount()` - Remove connection
  - `syncAccount()` - Manual sync
  - `importPosts()` - Import photos to gallery
  - `getRecentImports()` - Import history

## Admin Pages

### Main Page
- `src/app/admin/social-media/page.tsx`
  - Server component
  - Admin authentication check
  - Fetch initial data
  - Render client component

### Client Component
- `src/app/admin/social-media/social-media-client.tsx`
  - Tabbed interface
  - Connection management UI
  - OAuth initiation
  - Error/success messages
  - Connection status display

## UI Components

### Instagram Import
- `src/components/admin/InstagramImport.tsx`
  - Account selector
  - Album selector
  - Fetch posts button
  - Post grid display
  - Batch selection
  - Import progress
  - Success/error handling

### Facebook Import
- `src/components/admin/FacebookImport.tsx`
  - Page selector
  - Album selector
  - Fetch photos button
  - Photo grid display
  - Batch selection
  - Import progress
  - Success/error handling

### Post Selector
- `src/components/admin/PostSelector.tsx`
  - Reusable post grid
  - Selection checkboxes
  - Imported badge
  - Engagement stats
  - Caption overlay
  - Date formatting

## Configuration

### Environment Variables
- `.env.example` (updated)
  - INSTAGRAM_APP_ID
  - INSTAGRAM_APP_SECRET
  - FACEBOOK_APP_ID
  - FACEBOOK_APP_SECRET
  - ENCRYPTION_KEY

## Scripts

- `scripts/generate-encryption-key.js`
  - Generates secure 256-bit encryption key
  - Outputs formatted for .env file
  - Instructions included

## Documentation

### Complete Guide
- `SOCIAL_MEDIA_INTEGRATION.md`
  - Setup instructions
  - Usage guide
  - API reference
  - Database schema
  - Security details
  - Troubleshooting
  - Best practices

### Quick Start
- `SOCIAL_MEDIA_QUICKSTART.md`
  - 5-step setup
  - 3-step usage
  - File structure
  - Common tasks
  - Production checklist

### File Reference
- `SOCIAL_MEDIA_FILES.md` (this file)
  - Complete file listing
  - File purposes
  - Directory structure

## Directory Structure

```
/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/

├── supabase/
│   └── migrations/
│       └── 20251015210000_create_social_media_connections.sql
│
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── social-media-actions.ts
│   │   ├── admin/
│   │   │   └── social-media/
│   │   │       ├── page.tsx
│   │   │       └── social-media-client.tsx
│   │   └── api/
│   │       └── social-media/
│   │           ├── instagram/
│   │           │   ├── auth/
│   │           │   │   └── route.ts
│   │           │   ├── callback/
│   │           │   │   └── route.ts
│   │           │   └── posts/
│   │           │       └── route.ts
│   │           └── facebook/
│   │               ├── auth/
│   │               │   └── route.ts
│   │               ├── callback/
│   │               │   └── route.ts
│   │               └── posts/
│   │                   └── route.ts
│   ├── components/
│   │   └── admin/
│   │       ├── InstagramImport.tsx
│   │       ├── FacebookImport.tsx
│   │       └── PostSelector.tsx
│   ├── lib/
│   │   ├── encryption.ts
│   │   └── social-media-api.ts
│   └── types/
│       └── social-media.types.ts
│
├── scripts/
│   └── generate-encryption-key.js
│
├── .env.example (updated)
├── SOCIAL_MEDIA_INTEGRATION.md
├── SOCIAL_MEDIA_QUICKSTART.md
└── SOCIAL_MEDIA_FILES.md
```

## File Sizes (Approximate)

- Total TypeScript/JavaScript: ~8,500 lines
- SQL Migration: ~800 lines
- Documentation: ~1,500 lines
- Total: ~10,800 lines

## Dependencies

### Required npm packages (already installed):
- `next` - Framework
- `react` - UI library
- `crypto` - Encryption (Node.js built-in)
- `zod` - Validation

### UI Components (from shadcn/ui):
- Button
- Card
- Select
- Alert
- Checkbox
- Badge
- Progress
- Tabs

## Integration Points

### Existing Systems
1. **Authentication System**
   - Uses existing Supabase auth
   - Checks admin role from profiles table

2. **Photo Gallery**
   - Imports to existing photo_albums table
   - Creates records in photos table
   - Uploads to event-photos bucket

3. **Storage**
   - Uses existing Supabase Storage
   - Same bucket as manual uploads
   - Same RLS policies apply

4. **Database**
   - Extends existing schema
   - Foreign key relationships
   - Same RLS pattern

## Testing Checklist

### Unit Tests Needed
- [ ] Token encryption/decryption
- [ ] API client functions
- [ ] Server actions validation
- [ ] Duplicate detection

### Integration Tests Needed
- [ ] OAuth flow (Instagram)
- [ ] OAuth flow (Facebook)
- [ ] Post fetching
- [ ] Photo import process
- [ ] Token expiration handling

### E2E Tests Needed
- [ ] Complete connection flow
- [ ] Complete import flow
- [ ] Disconnect and reconnect
- [ ] Error handling scenarios

## Performance Considerations

### Optimization Opportunities
1. **Batch Processing**: Import in parallel (limit 5 concurrent)
2. **Image Optimization**: Compress before upload
3. **Caching**: Cache API responses (5 minutes)
4. **Lazy Loading**: Load images on scroll
5. **Pagination**: Fetch posts in pages

### Monitoring Points
- API rate limit usage
- Import success/failure rate
- Token expiration frequency
- Average import time
- Storage usage growth

## Security Audit Checklist

- [x] Token encryption implemented
- [x] Admin-only access enforced
- [x] RLS policies applied
- [x] Input validation with Zod
- [x] CSRF protection
- [x] No tokens in responses
- [x] Secure error messages
- [ ] Rate limiting (future)
- [ ] Audit logging (future)

## Future Enhancements

### Planned Features
1. Auto-import (scheduled jobs)
2. Hashtag filtering
3. Date range filtering
4. Bulk edit captions
5. Preview before import
6. Import from Instagram Stories
7. Video support
8. Multi-account management
9. Import analytics
10. Webhook notifications

### Nice-to-Have
- Import scheduling UI
- Automatic captioning with AI
- Duplicate photo detection (image similarity)
- Import from other platforms (Twitter, TikTok)
- Export to social media
- Social media post preview

## Maintenance

### Regular Tasks
- Monitor token expiration
- Check API rate limits
- Review import errors
- Clean up old imports
- Update Meta API version
- Rotate encryption keys (annually)

### Breaking Changes Watch
- Meta Graph API versions
- Next.js updates
- Supabase client updates
- React updates

## Support Resources

### Internal Documentation
- SOCIAL_MEDIA_INTEGRATION.md - Complete guide
- SOCIAL_MEDIA_QUICKSTART.md - Quick reference
- SOCIAL_MEDIA_FILES.md - This file

### External Resources
- [Meta for Developers](https://developers.facebook.com/)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api)
- [OAuth 2.0 Spec](https://oauth.net/2/)

## License & Attribution

This integration was developed for Centner Academy PTO website.
Uses Meta Graph API under Meta Platform Terms of Service.
