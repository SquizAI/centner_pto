# News Components - Quick Start Guide

## What Was Built

3 primary + 2 supporting UI components for the Centner PTO news/blog feature, fully responsive and accessible.

## File Locations

```
src/
├── components/news/
│   ├── NewsCard.tsx              (5.2KB)  - News post card
│   ├── BlogPostContent.tsx       (11KB)   - Full post display
│   ├── NewsFeatured.tsx         (7.1KB)  - Hero section
│   ├── NewsGrid.tsx             (1.7KB)  - Grid container
│   ├── NewsFilter.tsx           (5.2KB)  - Filter/search UI
│   ├── index.ts                 (360B)   - Export barrel
│   ├── README.md                (11KB)   - Full documentation
│   └── COMPONENT_GUIDE.md       (13KB)   - Visual guide
│
├── types/
│   └── news.types.ts            (1.1KB)  - TypeScript types
│
└── lib/
    └── sanitize.ts              (2.3KB)  - HTML sanitization

Root:
└── HANDOFF_NEWS_COMPONENTS.md   (17KB)   - Complete handoff doc
```

## Import & Use

```tsx
import {
  NewsCard,
  BlogPostContent,
  NewsFeatured,
  NewsGrid,
  NewsFilter,
  // Skeletons
  NewsCardSkeleton,
  BlogPostContentSkeleton,
  NewsFeaturedSkeleton,
  NewsGridSkeleton,
} from '@/components/news';
```

## Quick Examples

### News List Page
```tsx
const posts = await fetchPosts();
const [featured, ...rest] = posts;

return (
  <>
    <NewsFeatured post={featured} />
    <NewsGrid posts={rest} columns={3} />
  </>
);
```

### Single Post Page
```tsx
const post = await fetchPost(slug);
return <BlogPostContent post={post} />;
```

### With Filtering
```tsx
const [campus, setCampus] = useState(null);
const [search, setSearch] = useState('');

return (
  <>
    <NewsFilter
      selectedCampus={campus}
      onCampusChange={setCampus}
      searchQuery={search}
      onSearchChange={setSearch}
    />
    <NewsGrid posts={filteredPosts} />
  </>
);
```

## Features Included

- ✅ Responsive design (mobile-first)
- ✅ WCAG 2.1 AA accessible
- ✅ Campus color coding (Pink/Blue/Orange)
- ✅ Framer Motion animations
- ✅ Loading skeletons
- ✅ Next.js Image optimization
- ✅ TypeScript fully typed
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Social sharing (Facebook, Twitter, Email)
- ✅ Search & filter UI
- ✅ Comprehensive documentation

## Next Steps

1. **Install DOMPurify** (for HTML sanitization):
   ```bash
   npm install isomorphic-dompurify
   ```

2. **Create page routes**:
   - `/app/news/page.tsx` - List page
   - `/app/news/[slug]/page.tsx` - Single post
   - Loading and error states

3. **Add data fetching**:
   ```tsx
   const { data: posts } = await supabase
     .from('news_posts')
     .select('*')
     .eq('published', true)
     .order('publish_date', { ascending: false });
   ```

4. **Add SEO metadata**:
   ```tsx
   export const metadata = {
     title: 'News | Centner PTO',
     description: 'Latest news and updates',
   };
   ```

## Component Props Quick Ref

```typescript
// NewsCard
<NewsCard post={NewsPost} priority={boolean} />

// BlogPostContent
<BlogPostContent post={NewsPost} authorName="string" />

// NewsFeatured
<NewsFeatured post={NewsPost} />

// NewsGrid
<NewsGrid posts={NewsPost[]} columns={1|2|3} />

// NewsFilter
<NewsFilter
  selectedCampus={Campus|null}
  onCampusChange={(campus) => void}
  searchQuery={string}
  onSearchChange={(query) => void}
/>
```

## Campus Colors

- **Preschool**: Pink `#EC4E88`
- **Elementary**: Light Blue `#57BAEB`
- **Middle-High**: Orange `#FC6F24`
- **All**: Primary Blue `#23ABE3`

## Documentation Files

1. **HANDOFF_NEWS_COMPONENTS.md** - Complete handoff documentation
2. **src/components/news/README.md** - Detailed component documentation
3. **src/components/news/COMPONENT_GUIDE.md** - Visual guide and examples
4. **NEWS_QUICK_START.md** - This file

## Support

All components are production-ready. Refer to documentation files for:
- Detailed usage examples
- Accessibility features
- Performance optimization
- Security considerations
- Testing checklists

---

**Ready for nextjs-expert agent to create pages and integrate with Supabase!**
