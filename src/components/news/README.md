# News Components

Responsive, accessible UI components for the Centner PTO news/blog feature.

## Components

### 1. NewsCard

A card component for displaying news post previews in grid layouts.

**File**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/components/news/NewsCard.tsx`

**Features**:
- Featured image with hover effects
- Campus color-coded badge
- Title, excerpt, and publish date
- Tag pills (limited to 3 with overflow indicator)
- Smooth animations with Framer Motion
- Mobile-responsive
- WCAG 2.1 AA compliant

**Props**:
```typescript
interface NewsCardProps {
  post: NewsPost;        // News post data from database
  className?: string;    // Optional additional classes
  priority?: boolean;    // Image loading priority (default: false)
}
```

**Usage**:
```tsx
import { NewsCard } from '@/components/news';

<NewsCard
  post={newsPost}
  priority={true}  // For above-the-fold images
/>
```

**Loading State**:
```tsx
import { NewsCardSkeleton } from '@/components/news';

<NewsCardSkeleton />
```

---

### 2. BlogPostContent

Full blog post display component with hero image, content, and metadata.

**File**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/components/news/BlogPostContent.tsx`

**Features**:
- Breadcrumb navigation
- Hero image with animation
- Campus badge
- Author and date information
- Social share buttons (Facebook, Twitter, Email)
- Rich text HTML content rendering with styled typography
- Tag display
- "Back to News" navigation
- Mobile-first responsive design
- Accessible markup with ARIA labels

**Props**:
```typescript
interface BlogPostContentProps {
  post: NewsPost;         // News post data
  authorName?: string;    // Author display name (default: 'Centner PTO')
  className?: string;     // Optional additional classes
}
```

**Usage**:
```tsx
import { BlogPostContent } from '@/components/news';

<BlogPostContent
  post={fullPost}
  authorName="John Smith"
/>
```

**Loading State**:
```tsx
import { BlogPostContentSkeleton } from '@/components/news';

<BlogPostContentSkeleton />
```

**Important**: The content HTML is rendered using `dangerouslySetInnerHTML`. In production, sanitize HTML content using a library like DOMPurify before rendering.

---

### 3. NewsFeatured

Large hero section for featured/highlighted news posts.

**File**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/components/news/NewsFeatured.tsx`

**Features**:
- Full-width hero section
- Background image with gradient overlay
- Large typography for impact
- Campus badge and featured indicator
- Animated "Read More" button
- Tag display
- Decorative gradient orbs
- Responsive padding and text sizing
- High contrast for readability

**Props**:
```typescript
interface NewsFeaturedProps {
  post: NewsPost;      // Featured news post
  className?: string;  // Optional additional classes
}
```

**Usage**:
```tsx
import { NewsFeatured } from '@/components/news';

<NewsFeatured post={featuredPost} />
```

**Loading State**:
```tsx
import { NewsFeaturedSkeleton } from '@/components/news';

<NewsFeaturedSkeleton />
```

---

### 4. NewsGrid

Container component for displaying multiple news cards in a responsive grid.

**File**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/components/news/NewsGrid.tsx`

**Features**:
- Responsive grid layout (1, 2, or 3 columns)
- Empty state handling
- Automatic image priority for first 3 posts
- Smooth entrance animation

**Props**:
```typescript
interface NewsGridProps {
  posts: NewsPost[];     // Array of news posts
  className?: string;    // Optional additional classes
  columns?: 1 | 2 | 3;  // Number of columns (default: 3)
}
```

**Usage**:
```tsx
import { NewsGrid } from '@/components/news';

<NewsGrid
  posts={newsPosts}
  columns={3}
/>
```

**Loading State**:
```tsx
import { NewsGridSkeleton } from '@/components/news';

<NewsGridSkeleton count={6} columns={3} />
```

---

## Types

### NewsPost Type

**File**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/types/news.types.ts`

```typescript
export type NewsPost = Tables<'news_posts'>;

// From database schema
interface NewsPost {
  id: string;
  title: string;
  slug: string;
  content: string;              // HTML content
  excerpt: string | null;
  featured_image_url: string | null;
  author_id: string;
  publish_date: string | null;
  published: boolean | null;
  campus: 'all' | 'preschool' | 'elementary' | 'middle-high';
  tags: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}
```

### Campus Configuration

Pre-configured campus colors and labels:

```typescript
export const CAMPUS_CONFIG: Record<Campus, {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}> = {
  all: {
    label: 'All Campuses',
    color: 'hsl(var(--primary))',
    bgColor: 'bg-primary/10',
    textColor: 'text-primary',
  },
  preschool: {
    label: 'Preschool',
    color: 'hsl(var(--preschool))',    // Pink #EC4E88
    bgColor: 'bg-[hsl(var(--preschool))]/10',
    textColor: 'text-[hsl(var(--preschool))]',
  },
  elementary: {
    label: 'Elementary',
    color: 'hsl(var(--elementary))',   // Light Blue #57BAEB
    bgColor: 'bg-[hsl(var(--elementary))]/10',
    textColor: 'text-[hsl(var(--elementary))]',
  },
  'middle-high': {
    label: 'Middle & High School',
    color: 'hsl(var(--middle-high))',  // Orange #FC6F24
    bgColor: 'bg-[hsl(var(--middle-high))]/10',
    textColor: 'text-[hsl(var(--middle-high))]',
  },
};
```

---

## Complete Page Examples

### News List Page

```tsx
// app/news/page.tsx
import { createClient } from '@/lib/supabase/server';
import { NewsFeatured, NewsGrid } from '@/components/news';

export default async function NewsPage() {
  const supabase = await createClient();

  // Fetch published posts
  const { data: posts } = await supabase
    .from('news_posts')
    .select('*')
    .eq('published', true)
    .order('publish_date', { ascending: false });

  const featuredPost = posts?.[0];
  const remainingPosts = posts?.slice(1) || [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Latest News</h1>

      {/* Featured post */}
      {featuredPost && (
        <div className="mb-12">
          <NewsFeatured post={featuredPost} />
        </div>
      )}

      {/* News grid */}
      <NewsGrid posts={remainingPosts} columns={3} />
    </div>
  );
}
```

### Single Post Page

```tsx
// app/news/[slug]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { BlogPostContent } from '@/components/news';
import { notFound } from 'next/navigation';

export default async function NewsPostPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();

  // Fetch post by slug
  const { data: post } = await supabase
    .from('news_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <BlogPostContent post={post} authorName="PTO Admin" />
    </div>
  );
}

// Generate static params for build time
export async function generateStaticParams() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('news_posts')
    .select('slug')
    .eq('published', true);

  return posts?.map((post) => ({
    slug: post.slug,
  })) || [];
}
```

### Loading States

```tsx
// app/news/loading.tsx
import { NewsFeaturedSkeleton, NewsGridSkeleton } from '@/components/news';

export default function NewsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="h-10 w-48 bg-muted animate-pulse rounded mb-8" />
      <div className="mb-12">
        <NewsFeaturedSkeleton />
      </div>
      <NewsGridSkeleton count={6} columns={3} />
    </div>
  );
}

// app/news/[slug]/loading.tsx
import { BlogPostContentSkeleton } from '@/components/news';

export default function PostLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <BlogPostContentSkeleton />
    </div>
  );
}
```

---

## Accessibility Features

All components include:

- Semantic HTML (article, nav, header, footer, time)
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels and roles where appropriate
- Alt text for images
- Keyboard navigation support
- Focus visible indicators
- Screen reader friendly markup
- Sufficient color contrast ratios (WCAG AA)
- Responsive touch targets (min 44x44px)

---

## Styling & Customization

### Campus Colors

Campus colors are defined in `globals.css`:

```css
:root {
  --preschool: 339 80% 61%;    /* Pink #EC4E88 */
  --elementary: 197 79% 63%;   /* Light Blue #57BAEB */
  --middle-high: 20 98% 57%;   /* Orange #FC6F24 */
}
```

### Customizing Components

All components accept a `className` prop for additional styling:

```tsx
<NewsCard
  post={post}
  className="shadow-2xl border-2 border-primary"
/>
```

### Typography Customization

The BlogPostContent component uses Tailwind's typography classes. To customize, modify the class names in the content rendering div.

---

## Dependencies

Required packages (already in package.json):

- `next`: Next.js framework
- `react`: React library
- `framer-motion`: Animation library
- `lucide-react`: Icon library
- `date-fns`: Date formatting
- `class-variance-authority`: Variant utilities
- `tailwind-merge`: Tailwind class merging
- `@radix-ui/react-slot`: Polymorphic component utility

---

## Performance Considerations

1. **Image Optimization**: Uses Next.js `Image` component with proper sizing
2. **Priority Loading**: First 3 images in grid use `priority` prop
3. **Lazy Loading**: Images below fold load lazily
4. **Animation Performance**: Framer Motion animations use GPU-accelerated transforms
5. **Skeleton Loading**: Provides visual feedback during data fetching

---

## Security Note

**Important**: The `BlogPostContent` component renders HTML using `dangerouslySetInnerHTML`. In production:

1. Sanitize all HTML content before storing in database
2. Use a library like DOMPurify to sanitize on render
3. Implement Content Security Policy (CSP) headers
4. Validate and sanitize user input on the backend

Example with DOMPurify:

```tsx
import DOMPurify from 'isomorphic-dompurify';

const sanitizedContent = DOMPurify.sanitize(post.content);

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

---

## Next Steps for nextjs-expert Agent

1. Create news listing page at `/app/news/page.tsx`
2. Create single post page at `/app/news/[slug]/page.tsx`
3. Add loading states with skeleton components
4. Implement campus filtering functionality
5. Add search/filter UI components
6. Create admin pages for creating/editing posts
7. Set up proper image upload with Supabase Storage
8. Implement pagination or infinite scroll
9. Add metadata and OpenGraph tags for SEO
10. Install and configure DOMPurify for HTML sanitization

---

## File Locations

- **Components**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/components/news/`
- **Types**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/types/news.types.ts`
- **Database Types**: `/Users/mattysquarzoni/Library/Mobile Documents/com~apple~CloudDocs/Centner_PTO/centner-pto-website/src/types/database.types.ts`

