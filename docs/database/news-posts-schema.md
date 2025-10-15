# News Posts Database Schema Documentation

## Overview
This document describes the `news_posts` table schema designed for the Centner Academy PTO website's blog/news feature.

## Migration File
**Location:** `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/supabase/migrations/20251015083819_create_news_posts.sql`

**Migration ID:** `20251015083819_create_news_posts`

## Table Schema

### news_posts

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `title` | TEXT | NOT NULL | Post title |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly identifier |
| `content` | TEXT | NOT NULL | Full post content (HTML/Markdown) |
| `excerpt` | TEXT | NULL | Short summary (150-200 chars recommended) |
| `featured_image_url` | TEXT | NULL | URL to featured image |
| `author_id` | UUID | NOT NULL, FK → auth.users(id) ON DELETE CASCADE | Post author |
| `publish_date` | TIMESTAMPTZ | NULL | When post goes live (scheduling support) |
| `published` | BOOLEAN | DEFAULT FALSE | Draft vs published status |
| `campus` | TEXT | NOT NULL, DEFAULT 'all' | Target campus |
| `tags` | TEXT[] | DEFAULT ARRAY[]::TEXT[] | Categorization tags |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last modification timestamp |

### Constraints

1. **slug_format**: Slug must match pattern `^[a-z0-9]+(?:-[a-z0-9]+)*$` (lowercase alphanumeric with hyphens)
2. **published_requires_publish_date**: If `published = TRUE`, then `publish_date` must NOT be NULL
3. **campus_check**: Campus must be one of: `'all'`, `'preschool'`, `'elementary'`, `'middle-high'`

## Indexes

| Index Name | Columns | Type | Purpose |
|------------|---------|------|---------|
| `idx_news_posts_slug` | slug | UNIQUE | URL routing lookups |
| `idx_news_posts_published_date` | published, publish_date DESC | COMPOSITE, PARTIAL | Main query pattern (published posts list) |
| `idx_news_posts_publish_date` | publish_date DESC | PARTIAL | Chronological ordering |
| `idx_news_posts_campus` | campus | BTREE | Campus filtering |
| `idx_news_posts_published` | published | BTREE | Draft/published filtering |
| `idx_news_posts_author` | author_id | BTREE | Author-specific queries |
| `idx_news_posts_tags` | tags | GIN | Tag-based search/filtering |
| `idx_news_posts_created_at` | created_at DESC | BTREE | Admin dashboard sorting |

## Row-Level Security (RLS) Policies

### For Supabase Integration Agent

**Status:** RLS policies are DOCUMENTED in migration but NOT YET APPLIED

Enable RLS first:
```sql
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
```

### Policy 1: Public Read Access
**Name:** "Public users can view published posts"
**Operation:** SELECT
**Target:** Anonymous and authenticated users

```sql
CREATE POLICY "Public users can view published posts"
    ON news_posts
    FOR SELECT
    USING (
        published = TRUE
        AND publish_date IS NOT NULL
        AND publish_date <= NOW()
    );
```

### Policy 2: Admin Full Access
**Name:** "Admins can manage all posts"
**Operation:** ALL (SELECT, INSERT, UPDATE, DELETE)
**Target:** Users with role 'admin' or 'super_admin'

```sql
CREATE POLICY "Admins can manage all posts"
    ON news_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
```

### Policy 3: Author Edit Own Drafts
**Name:** "Authors can edit own drafts"
**Operation:** UPDATE
**Target:** Post authors (only for unpublished posts)

```sql
CREATE POLICY "Authors can edit own drafts"
    ON news_posts
    FOR UPDATE
    USING (
        auth.uid() = author_id
        AND published = FALSE
    )
    WITH CHECK (
        auth.uid() = author_id
        AND published = FALSE
    );
```

### Policy 4: Admin Insert
**Name:** "Admins can create posts"
**Operation:** INSERT
**Target:** Admin users only

```sql
CREATE POLICY "Admins can create posts"
    ON news_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
```

### Policy 5: Admin Delete
**Name:** "Admins can delete posts"
**Operation:** DELETE
**Target:** Admin users only

```sql
CREATE POLICY "Admins can delete posts"
    ON news_posts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
```

## Helper Functions

### generate_slug(title TEXT)
Converts a post title into a URL-safe slug.

**Example:**
```sql
SELECT generate_slug('My Post Title!');
-- Returns: 'my-post-title'
```

### get_published_posts_count(campus_filter TEXT)
Returns count of published posts for a given campus.

**Example:**
```sql
SELECT get_published_posts_count('elementary');
-- Returns: 42
```

## TypeScript Type Definition

For the type-generation agent, the expected TypeScript interface:

```typescript
export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  publish_date: string | null; // ISO 8601 timestamp
  published: boolean;
  campus: 'all' | 'preschool' | 'elementary' | 'middle-high';
  tags: string[];
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

export interface NewsPostInsert {
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  author_id: string;
  publish_date?: string | null;
  published?: boolean;
  campus?: 'all' | 'preschool' | 'elementary' | 'middle-high';
  tags?: string[];
}

export interface NewsPostUpdate {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  featured_image_url?: string | null;
  publish_date?: string | null;
  published?: boolean;
  campus?: 'all' | 'preschool' | 'elementary' | 'middle-high';
  tags?: string[];
}
```

## Query Examples

### Get all published posts (public view)
```sql
SELECT *
FROM news_posts
WHERE published = TRUE
  AND publish_date <= NOW()
ORDER BY publish_date DESC
LIMIT 10;
```

### Get posts by campus
```sql
SELECT *
FROM news_posts
WHERE published = TRUE
  AND publish_date <= NOW()
  AND campus IN ('all', 'elementary')
ORDER BY publish_date DESC;
```

### Get posts by tag
```sql
SELECT *
FROM news_posts
WHERE published = TRUE
  AND publish_date <= NOW()
  AND 'fundraiser' = ANY(tags)
ORDER BY publish_date DESC;
```

### Get draft posts for admin dashboard
```sql
SELECT *
FROM news_posts
WHERE published = FALSE
ORDER BY created_at DESC;
```

### Get scheduled posts (future publish date)
```sql
SELECT *
FROM news_posts
WHERE published = TRUE
  AND publish_date > NOW()
ORDER BY publish_date ASC;
```

## Performance Considerations

1. **Composite Index Usage**: The `idx_news_posts_published_date` index covers the most common query pattern (listing published posts chronologically)

2. **Partial Indexes**: Several indexes use `WHERE` clauses to reduce index size and improve performance

3. **GIN Index for Tags**: The tags array uses a GIN index for efficient tag-based queries

4. **Index-Only Scans**: Common queries can be satisfied using index-only scans without touching the main table

## Security Considerations

1. **RLS Enabled**: All data access is controlled through RLS policies
2. **Author Isolation**: Authors can only edit their own unpublished drafts
3. **Admin Control**: Only admins can publish, delete, or create posts
4. **Public Safety**: Public users can only see published posts that have reached their publish date

## Migration Rollback

If needed, rollback with:
```sql
DROP TABLE IF EXISTS news_posts CASCADE;
DROP FUNCTION IF EXISTS generate_slug(TEXT);
DROP FUNCTION IF EXISTS get_published_posts_count(TEXT);
```

## Next Steps

1. **Apply Migration**: Run migration via Supabase CLI or dashboard
2. **Enable RLS**: Apply the 5 RLS policies documented above
3. **Generate Types**: Create TypeScript types from schema
4. **Build API**: Create CRUD endpoints using Supabase client
5. **Admin UI**: Build post management interface
6. **Public UI**: Build blog listing and detail pages

## Contact
For questions or modifications to this schema, consult the database-architect agent.
