# News Components Visual Guide

## Component Hierarchy

```
News Feature
│
├── NewsFeatured (Hero Section)
│   ├── Campus Badge
│   ├── Featured Indicator
│   ├── Title
│   ├── Date
│   ├── Excerpt
│   ├── CTA Button
│   └── Tags
│
├── NewsGrid (Layout Container)
│   └── NewsCard[] (Multiple Cards)
│       ├── Featured Image
│       ├── Campus Badge (overlay)
│       ├── Date
│       ├── Title
│       ├── Excerpt
│       ├── Tags (max 3)
│       └── Read More Link
│
├── BlogPostContent (Full Post)
│   ├── Breadcrumb Navigation
│   ├── Hero Image
│   ├── Header Section
│   │   ├── Campus Badge
│   │   ├── Title
│   │   ├── Author & Date
│   │   └── Share Buttons
│   ├── Article Content (HTML)
│   ├── Tags
│   └── Back to News Link
│
└── NewsFilter (Filtering UI)
    ├── Search Input
    ├── Campus Filter Badges
    └── Active Filters Summary
```

## Layout Examples

### News List Page Layout

```
┌─────────────────────────────────────────────────────┐
│  Page Header (Your implementation)                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                       │
│           NewsFeatured Component                     │
│         (Large Hero with Background)                 │
│                                                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  NewsFilter Component                                │
│  [Search Bar] [Campus Badges...]                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  NewsGrid Component (3 columns on desktop)          │
│                                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐                      │
│  │ Card │  │ Card │  │ Card │                      │
│  └──────┘  └──────┘  └──────┘                      │
│                                                       │
│  ┌──────┐  ┌──────┐  ┌──────┐                      │
│  │ Card │  │ Card │  │ Card │                      │
│  └──────┘  └──────┘  └──────┘                      │
└─────────────────────────────────────────────────────┘
```

### Single Post Page Layout

```
┌─────────────────────────────────────────────────────┐
│  BlogPostContent Component                          │
│                                                       │
│  Home > News > Article Title                         │
│                                                       │
│  ╔═══════════════════════════════════════════════╗  │
│  ║                                                ║  │
│  ║         Hero Image (Full Width)                ║  │
│  ║                                                ║  │
│  ╚═══════════════════════════════════════════════╝  │
│                                                       │
│  [Campus Badge]                                      │
│                                                       │
│  Title of the Blog Post                              │
│  By Author Name | October 15, 2025 | [Share]        │
│  ─────────────────────────────────────────────       │
│                                                       │
│  Article content with rich formatting...             │
│  Paragraphs, headings, lists, etc.                   │
│                                                       │
│  ─────────────────────────────────────────────       │
│  Tags: [Tag1] [Tag2] [Tag3]                         │
│                                                       │
│  ← Back to all news                                  │
└─────────────────────────────────────────────────────┘
```

## Responsive Behavior

### Desktop (≥1024px)
- NewsGrid: 3 columns
- NewsFeatured: Full hero with large text
- BlogPostContent: Max width 1200px, centered
- NewsFilter: Inline layout

### Tablet (768px - 1023px)
- NewsGrid: 2 columns
- NewsFeatured: Medium text sizing
- BlogPostContent: Adjusted padding
- NewsFilter: Stacked layout

### Mobile (<768px)
- NewsGrid: 1 column
- NewsFeatured: Compact padding, smaller text
- BlogPostContent: Full width, compact spacing
- NewsFilter: Vertical stacking

## Color Coding by Campus

### Visual Indicators

```
Preschool (Pink #EC4E88)
┌─────────────────┐
│ [Preschool]     │  ← Pink badge
│ Article Title   │
│ Content...      │
└─────────────────┘

Elementary (Light Blue #57BAEB)
┌─────────────────┐
│ [Elementary]    │  ← Blue badge
│ Article Title   │
│ Content...      │
└─────────────────┘

Middle-High (Orange #FC6F24)
┌─────────────────┐
│ [Middle & High] │  ← Orange badge
│ Article Title   │
│ Content...      │
└─────────────────┘

All Campuses (Primary Blue #23ABE3)
┌─────────────────┐
│ [All Campuses]  │  ← Primary blue badge
│ Article Title   │
│ Content...      │
└─────────────────┘
```

## Interactive States

### NewsCard States

**Default**
- Border: subtle
- Shadow: small
- Transform: none

**Hover**
- Border: unchanged
- Shadow: larger (hover:shadow-lg)
- Transform: translateY(-4px)
- Image: scale(1.05)

**Focus**
- Ring: 2px focus ring
- Ring color: primary

### Badge States (in NewsFilter)

**Unselected**
- Background: muted
- Text: muted-foreground
- Border: subtle

**Selected**
- Background: campus color (10% opacity)
- Text: campus color
- Border: 2px current color
- Scale: slightly larger

**Hover**
- Scale: 1.05
- Background: slightly darker

## Animation Timing

```
Component Entry Animations (Framer Motion):
- Initial: opacity 0, y offset
- Animate: opacity 1, y 0
- Duration: 300-800ms
- Easing: default ease

Hover Animations:
- Transform: 200-300ms
- Shadow: 300ms
- Colors: 200ms

Loading Skeletons:
- Pulse animation: infinite
- Background: muted color
```

## Accessibility Features

### Keyboard Navigation

```
Tab Order:
1. Breadcrumb links
2. Main content link (skip link)
3. Campus filter badges
4. Search input
5. Clear buttons
6. News card links
7. Share buttons
8. Back to news link
```

### Screen Reader Announcements

```
NewsCard:
- <article> semantic element
- Heading hierarchy (h3 for title)
- <time> element with datetime attribute
- Role="list" for tags

BlogPostContent:
- <nav> for breadcrumb
- <article> for main content
- <header> for post metadata
- <footer> for tags

NewsFilter:
- aria-label for search input
- aria-pressed for filter badges
- aria-expanded for active filters
- Clear instructions for active filters
```

## Common Use Cases

### 1. Homepage News Section

```tsx
// Show latest 3 posts in a row
const latestPosts = await fetchLatestPosts(3);

<section className="py-16">
  <h2 className="text-3xl font-bold mb-8">Latest Updates</h2>
  <NewsGrid posts={latestPosts} columns={3} />
  <div className="text-center mt-8">
    <Button asChild>
      <Link href="/news">View All News</Link>
    </Button>
  </div>
</section>
```

### 2. Campus-Specific News Page

```tsx
// Show only preschool news
const preschoolPosts = await fetchPostsByCampus('preschool');

<div className="container mx-auto px-4 py-12">
  <h1 className="text-4xl font-bold mb-8">
    Preschool News
  </h1>
  <NewsGrid posts={preschoolPosts} columns={2} />
</div>
```

### 3. Search Results

```tsx
// Show filtered results
const results = await searchPosts(query);

<div className="container mx-auto px-4 py-12">
  <h1 className="text-2xl font-bold mb-4">
    Search Results for "{query}"
  </h1>
  <p className="text-muted-foreground mb-8">
    Found {results.length} posts
  </p>
  {results.length > 0 ? (
    <NewsGrid posts={results} columns={3} />
  ) : (
    <div className="text-center py-12">
      <p>No results found. Try different keywords.</p>
    </div>
  )}
</div>
```

### 4. Related Posts Section

```tsx
// Show related posts on single post page
const relatedPosts = await fetchRelatedPosts(currentPost.id, currentPost.tags);

<section className="mt-16 pt-16 border-t">
  <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
  <NewsGrid posts={relatedPosts} columns={3} />
</section>
```

## Error States

### No Posts Available

```tsx
<div className="text-center py-12">
  <p className="text-muted-foreground text-lg">
    No news posts available at this time.
  </p>
</div>
```

### Post Not Found

```tsx
// app/news/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
      <p className="text-muted-foreground mb-8">
        The post you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/news">Back to News</Link>
      </Button>
    </div>
  );
}
```

### Loading Error

```tsx
// app/news/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">
        {error.message}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
```

## Performance Tips

### Image Optimization

```tsx
// Priority loading for above-fold images
<NewsCard post={post} priority={index < 3} />

// Proper sizing hints
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

### Data Fetching

```tsx
// Server Components (recommended)
export default async function NewsPage() {
  const posts = await fetchPosts(); // Server-side
  return <NewsGrid posts={posts} />;
}

// With revalidation (ISR)
export const revalidate = 3600; // 1 hour
```

### Code Splitting

```tsx
// Lazy load components not immediately visible
import dynamic from 'next/dynamic';

const NewsFilter = dynamic(() =>
  import('@/components/news').then(mod => mod.NewsFilter),
  { loading: () => <div>Loading filters...</div> }
);
```

## Testing Checklist

- [ ] Mobile (iPhone, Android)
- [ ] Tablet (iPad)
- [ ] Desktop (various sizes)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader (VoiceOver, NVDA)
- [ ] Color contrast (WCAG AA)
- [ ] Image loading (priority, lazy)
- [ ] Loading skeletons
- [ ] Empty states
- [ ] Error states
- [ ] Long titles/content
- [ ] Missing images
- [ ] Missing tags/dates
- [ ] Campus filtering
- [ ] Search functionality
- [ ] Share buttons
- [ ] Animation performance

