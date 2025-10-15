# Photo Gallery Setup Instructions

## Prerequisites

Before using the photo gallery feature, you must apply the database migration and regenerate TypeScript types.

## Step 1: Apply Database Migration

The photo gallery requires the new schema defined in:
```
supabase/migrations/20251015100000_create_photo_gallery.sql
```

This migration:
- Drops existing `photo_albums` and `photos` tables (if they exist)
- Creates new tables with complete schema for gallery feature
- Adds indexes for query optimization
- Creates helper functions for album management
- Sets up triggers for auto-updating timestamps

**To apply the migration:**

```bash
# If using Supabase CLI (local development)
supabase db reset

# Or push specific migration
supabase db push

# If using Supabase Dashboard
# 1. Go to your project dashboard
# 2. Navigate to SQL Editor
# 3. Copy the contents of the migration file
# 4. Execute the SQL
```

## Step 2: Configure RLS Policies

The migration includes documentation for RLS policies but does not apply them. You need to enable RLS and apply the policies manually.

**Enable RLS on tables:**

```sql
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
```

**Apply RLS Policies (documented in migration file):**

See the migration file for the complete set of policies. Key policies:
- Public users can view published albums
- Authenticated users can view all albums
- Admins can create, update, and delete albums
- Admins can upload and delete photos
- Storage bucket policies for `event-photos`

**Apply policies via Supabase Dashboard:**
1. Go to Database > Policies
2. Select `photo_albums` table
3. Click "New Policy"
4. Add each policy from the migration documentation

OR run the SQL commands directly in the SQL Editor.

## Step 3: Verify Storage Bucket

Ensure the `event-photos` storage bucket exists:

**Via Supabase Dashboard:**
1. Go to Storage
2. Check if `event-photos` bucket exists
3. If not, create it with:
   - Public: Yes (for public read access)
   - File size limit: 10MB
   - Allowed MIME types: `image/jpeg,image/jpg,image/png,image/webp,image/gif`

**Storage Policies:**
The bucket needs policies for:
- Public read access (so photos can be viewed)
- Admin write access (for uploading photos)

Reference migration `003_storage_buckets.sql` if it exists, or create policies manually.

## Step 4: Regenerate TypeScript Types

After applying the migration, regenerate TypeScript types from your Supabase schema:

```bash
# Using Supabase CLI
npx supabase gen types typescript --local > src/types/database.types.ts

# Or for remote database
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

This will update `src/types/database.types.ts` with the correct schema for the photo gallery tables.

## Step 5: Verify Types

After regenerating types, verify that the types in `src/types/gallery.types.ts` correctly extend the database types:

```typescript
import { Tables } from './database.types';

export type PhotoAlbum = Tables<'photo_albums'>;
export type Photo = Tables<'photos'>;
```

The database types should now include all fields from the migration:

**photo_albums:**
- id, title, slug, description
- event_date, location, campus
- cover_photo_url
- published, publish_date, sort_order
- created_by, created_at, updated_at

**photos:**
- id, album_id
- storage_path, storage_bucket, url, thumbnail_url
- title, caption, alt_text, file_name
- file_size, mime_type, width, height
- sort_order, featured
- uploaded_by, uploaded_at, created_at, updated_at

## Step 6: Create Test Admin User

To use the admin features, ensure you have a user with admin or super_admin role:

```sql
-- Update a user's role to admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing properties:

1. Verify the migration was applied successfully:
   ```sql
   SELECT * FROM photo_albums LIMIT 1;
   SELECT * FROM photos LIMIT 1;
   ```

2. Regenerate types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### RLS Policy Errors

If you get permission errors when trying to view or upload photos:

1. Check RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('photo_albums', 'photos');
   ```

2. Verify policies exist:
   ```sql
   SELECT * FROM pg_policies
   WHERE tablename IN ('photo_albums', 'photos');
   ```

3. Check your user's role:
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```

### Storage Upload Errors

If photo uploads fail:

1. Verify `event-photos` bucket exists in Storage
2. Check bucket is set to public
3. Verify storage policies allow admin uploads
4. Check file size is under 10MB
5. Verify MIME type is allowed

### Missing Select Component Error

If you see an error about `@/components/ui/select`:

The Select component may not be installed. Install it using shadcn-ui:

```bash
npx shadcn-ui@latest add select
```

## Verification Checklist

Before using the gallery feature, verify:

- [ ] Migration applied successfully
- [ ] RLS enabled on both tables
- [ ] RLS policies created and working
- [ ] Storage bucket `event-photos` exists
- [ ] Storage bucket is public
- [ ] Storage policies configured
- [ ] TypeScript types regenerated
- [ ] No TypeScript compilation errors
- [ ] Test admin user exists
- [ ] Development server running
- [ ] Can access `/gallery` page
- [ ] Can access `/gallery/admin` page (as admin)

## Next Steps

Once setup is complete:

1. Log in as an admin user
2. Navigate to `/gallery/admin`
3. Create your first photo album
4. Upload photos to the album
5. Publish the album
6. View it at `/gallery`

## Support

If you encounter issues:

1. Check the console for error messages
2. Verify all setup steps were completed
3. Review the migration file for any missed steps
4. Check Supabase dashboard for errors
5. Ensure your database schema matches the migration

For detailed feature documentation, see `README.md` in this directory.
