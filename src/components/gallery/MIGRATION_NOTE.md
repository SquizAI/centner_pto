# Photo Gallery Migration Note

## Important: Database Schema Mismatch

The gallery components were built based on the comprehensive photo gallery migration file:
`/supabase/migrations/20251015100000_create_photo_gallery.sql`

However, the current `database.types.ts` shows a different, older schema for photo_albums and photos tables.

## Current Schema (Existing)

###photo_albums:
```typescript
{
  id: string;
  title: string;
  description: string | null;
  campus: string[] | null;  // ARRAY
  cover_image_url: string | null;
  event_id: string | null;
  is_featured: boolean | null;
  status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### photos:
```typescript
{
  id: string;
  album_id: string | null;
  file_name: string;
  storage_path: string;
  caption: string | null;
  photographer: string | null;
  display_order: number | null;
  uploaded_by: string | null;
  created_at: string | null;
}
```

## New Schema (From Migration)

### photo_albums:
```typescript
{
  id: string;
  title: string;
  slug: string;  // NEW
  description: string | null;
  event_date: string | null;  // NEW
  location: string | null;  // NEW
  campus: string;  // SINGLE STRING, not array
  cover_photo_url: string | null;  // Different name
  published: boolean;  // NEW
  publish_date: string | null;  // NEW
  sort_order: number;  // NEW
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

### photos:
```typescript
{
  id: string;
  album_id: string;
  storage_path: string;
  storage_bucket: string;  // NEW
  url: string;  // NEW
  thumbnail_url: string | null;  // NEW
  title: string | null;  // NEW
  caption: string | null;
  alt_text: string | null;  // NEW
  file_name: string;
  file_size: number | null;  // NEW
  mime_type: string | null;  // NEW
  width: number | null;  // NEW
  height: number | null;  // NEW
  sort_order: number;  // NEW (different from display_order)
  featured: boolean;  // NEW
  uploaded_by: string;
  uploaded_at: string;  // NEW
  created_at: string;
  updated_at: string;
}
```

## Required Actions

### Option 1: Run the New Migration (Recommended)

1. **Backup existing data** (if any):
```sql
-- Export existing photo_albums and photos
SELECT * FROM photo_albums;
SELECT * FROM photos;
```

2. **Run the new migration**:
```bash
cd supabase
supabase migration up --file 20251015100000_create_photo_gallery.sql
```

3. **Regenerate TypeScript types**:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

4. Components should now work correctly!

### Option 2: Update Components to Match Existing Schema

If you cannot run the migration, you'll need to update the gallery components to work with the existing schema:

**Changes needed:**
1. `gallery.types.ts` - Update `GalleryCampus` type to handle arrays
2. `AlbumCard.tsx` - Remove references to slug, event_date, location
3. `AlbumFilter.tsx` - Update to handle campus as array
4. `PhotoGallery.tsx` - Remove references to url, thumbnail_url, title, alt_text, width, height
5. `PhotoLightbox.tsx` - Update to work with limited photo metadata
6. Update `AlbumWithStats` interface

### Option 3: Migration Path

If you have existing data and want to migrate:

1. Create a migration that adds new fields:
```sql
-- Add new fields to photo_albums
ALTER TABLE photo_albums
  ADD COLUMN slug TEXT,
  ADD COLUMN event_date DATE,
  ADD COLUMN location TEXT,
  ADD COLUMN published BOOLEAN DEFAULT TRUE,
  ADD COLUMN publish_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN sort_order INTEGER DEFAULT 0,
  ALTER COLUMN campus TYPE TEXT;  -- Convert array to single value

-- Add new fields to photos
ALTER TABLE photos
  ADD COLUMN storage_bucket TEXT DEFAULT 'event-photos',
  ADD COLUMN url TEXT,
  ADD COLUMN thumbnail_url TEXT,
  ADD COLUMN title TEXT,
  ADD COLUMN alt_text TEXT,
  ADD COLUMN file_size BIGINT,
  ADD COLUMN mime_type TEXT,
  ADD COLUMN width INTEGER,
  ADD COLUMN height INTEGER,
  ADD COLUMN sort_order INTEGER DEFAULT display_order,
  ADD COLUMN featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN uploaded_at TIMESTAMPTZ DEFAULT created_at;
```

2. Migrate existing data
3. Regenerate types
4. Components should work

## Recommendation

**I strongly recommend Option 1** - running the new migration. The new schema is:
- More complete and feature-rich
- Better organized
- Includes essential fields for the components
- Has proper indexing and helper functions
- Follows best practices

The components are built for this schema and will work immediately after migration.

## Type Safety Note

Until the migration is run, you will see TypeScript errors because the components expect fields that don't exist in the current schema. This is expected and will be resolved once the migration is applied and types are regenerated.

## Testing After Migration

After running the migration and regenerating types:

1. Check types compile:
```bash
npm run type-check
```

2. Test components import correctly:
```typescript
import { AlbumGrid } from '@/components/gallery';
// Should have no errors
```

3. Test with sample data:
- Create a test album
- Upload a test photo
- View in the gallery

## Support

If you encounter issues:
1. Check the migration file for schema details
2. Review USAGE_GUIDE.md for implementation patterns
3. Ensure RLS policies are applied
4. Verify storage bucket exists

---

**Status**: ⚠️ Migration Required
**Action**: Run migration file before using components
**File**: `/supabase/migrations/20251015100000_create_photo_gallery.sql`
