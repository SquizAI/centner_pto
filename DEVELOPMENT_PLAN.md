# Development Plan & Task List
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025
**Developer:** Self-Implementation
**Timeline:** 13 weeks (flexible)

---

## How to Use This Plan

1. **Work through phases sequentially** - Complete Phase 1 before moving to Phase 2
2. **Use Claude Code sub-agents** - Each task specifies which sub-agent to invoke
3. **Check off completed tasks** - Track your progress
4. **Refer to documentation** - Each task links to relevant docs

### Invoking Sub-Agents

To use a sub-agent in Claude Code:
```
Use the [sub-agent-name] sub-agent to [task description]
```

Example:
```
Use the database-architect sub-agent to create the events table with RLS policies
```

---

## Phase 1: Foundation Setup (Week 1)

### 1.1 Project Initialization

- [ ] **Task 1.1.1**: Initialize Next.js 15 project with TypeScript
  - **Sub-Agent**: `nextjs-expert`
  - **Command**: `npx create-next-app@latest centner-pto-website --typescript --tailwind --app --src-dir`
  - **Files**: `package.json`, `next.config.js`, `tsconfig.json`
  - **Time**: 30 minutes

- [ ] **Task 1.1.2**: Install core dependencies
  - **Sub-Agent**: `nextjs-expert`
  - **Dependencies**:
    - `@supabase/supabase-js @supabase/ssr`
    - `stripe @stripe/stripe-js @stripe/react-stripe-js`
    - `zod react-hook-form @hookform/resolvers`
    - `date-fns lucide-react`
  - **Time**: 15 minutes

- [ ] **Task 1.1.3**: Setup shadcn/ui component library
  - **Sub-Agent**: `ui-components`
  - **Command**: `npx shadcn@latest init`
  - **Components**: button, input, label, card, form, select, textarea
  - **Time**: 20 minutes

- [ ] **Task 1.1.4**: Configure project structure
  - **Sub-Agent**: `nextjs-expert`
  - **Create folders**:
    - `src/app/(auth)`, `src/app/(public)`, `src/app/admin`
    - `src/components/ui`, `src/components/layout`, `src/components/features`
    - `src/lib/supabase`, `src/lib/stripe`, `src/lib/utils`
    - `src/types`
  - **Time**: 15 minutes

- [ ] **Task 1.1.5**: Setup environment variables
  - **Sub-Agent**: `nextjs-expert`
  - **Files**: `.env.local`, `.env.example`
  - **Variables**: Supabase URL/keys, Stripe keys, base URL
  - **Time**: 10 minutes

---

### 1.2 Supabase Setup

- [ ] **Task 1.2.1**: Create Supabase project
  - **Sub-Agent**: `supabase-integration`
  - **Action**: Create project at supabase.com
  - **Save**: Project URL, anon key, service role key
  - **Time**: 10 minutes

- [ ] **Task 1.2.2**: Run database schema SQL
  - **Sub-Agent**: `database-architect`
  - **File**: Copy SQL from `docs/architecture/TECHNICAL_ARCHITECTURE.md`
  - **Tables**: profiles, events, donations, photos, albums, news, volunteers
  - **Time**: 30 minutes

- [ ] **Task 1.2.3**: Create RLS policies
  - **Sub-Agent**: `database-architect`
  - **Tables**: All tables need RLS enabled
  - **Policies**: Public read, authenticated write, admin full access
  - **Time**: 45 minutes

- [ ] **Task 1.2.4**: Create storage buckets
  - **Sub-Agent**: `supabase-integration`
  - **Buckets**: `event-photos`, `news-images`, `avatars`
  - **Policies**: Public read, authenticated/admin write
  - **Time**: 20 minutes

- [ ] **Task 1.2.5**: Setup Supabase clients (server & browser)
  - **Sub-Agent**: `supabase-integration`
  - **Files**: `lib/supabase/client.ts`, `lib/supabase/server.ts`
  - **Time**: 30 minutes

---

### 1.3 Authentication System

- [ ] **Task 1.3.1**: Create auth layout
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/(auth)/layout.tsx`
  - **Features**: Centered layout, logo, simple design
  - **Time**: 20 minutes

- [ ] **Task 1.3.2**: Build login page
  - **Sub-Agent**: `ui-components` + `nextjs-expert`
  - **File**: `app/(auth)/login/page.tsx`
  - **Features**: Email/password form, forgot password link
  - **Time**: 45 minutes

- [ ] **Task 1.3.3**: Build signup page
  - **Sub-Agent**: `ui-components` + `nextjs-expert`
  - **File**: `app/(auth)/signup/page.tsx`
  - **Features**: Registration form with validation
  - **Time**: 45 minutes

- [ ] **Task 1.3.4**: Create auth Server Actions
  - **Sub-Agent**: `api-designer`
  - **File**: `app/actions/auth.ts`
  - **Actions**: `signup()`, `login()`, `logout()`, `resetPassword()`
  - **Reference**: `docs/api/SERVER_ACTIONS.md`
  - **Time**: 1 hour

- [ ] **Task 1.3.5**: Create auth middleware
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `middleware.ts`
  - **Features**: Protect admin routes, refresh sessions
  - **Time**: 30 minutes

- [ ] **Task 1.3.6**: Build user profile page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/dashboard/profile/page.tsx`
  - **Features**: Edit name, email, password, campus
  - **Time**: 1 hour

---

### 1.4 Core Layout Components

- [ ] **Task 1.4.1**: Create header component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/layout/header.tsx`
  - **Features**: Logo, navigation, donate button, mobile menu
  - **Time**: 1.5 hours

- [ ] **Task 1.4.2**: Create footer component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/layout/footer.tsx`
  - **Features**: Links, contact info, social media, copyright
  - **Time**: 45 minutes

- [ ] **Task 1.4.3**: Create mobile navigation
  - **Sub-Agent**: `ui-components`
  - **File**: `components/layout/mobile-nav.tsx`
  - **Features**: Hamburger menu, slide-out drawer
  - **Time**: 1 hour

- [ ] **Task 1.4.4**: Setup root layout
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/layout.tsx`
  - **Features**: HTML structure, fonts, metadata, providers
  - **Time**: 30 minutes

---

### 1.5 Homepage

- [ ] **Task 1.5.1**: Create hero section
  - **Sub-Agent**: `ui-components`
  - **File**: `app/page.tsx`
  - **Features**: Mission statement, CTA buttons, background image
  - **Time**: 1 hour

- [ ] **Task 1.5.2**: Add upcoming events section
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/page.tsx`
  - **Features**: Fetch 3 upcoming events, display cards
  - **Time**: 45 minutes

- [ ] **Task 1.5.3**: Add latest news section
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/page.tsx`
  - **Features**: Fetch 3 latest posts, display cards
  - **Time**: 45 minutes

- [ ] **Task 1.5.4**: Add impact/stats section
  - **Sub-Agent**: `ui-components`
  - **Features**: Total donations, events hosted, volunteers
  - **Time**: 30 minutes

**Phase 1 Total Time**: ~20-25 hours

---

## Phase 2: Events & Calendar (Week 2-3)

### 2.1 Event Data Layer

- [ ] **Task 2.1.1**: Create event validation schema
  - **Sub-Agent**: `api-designer`
  - **File**: `lib/validations/events.ts`
  - **Schema**: Zod schema for event creation/update
  - **Time**: 30 minutes

- [ ] **Task 2.1.2**: Create event Server Actions
  - **Sub-Agent**: `api-designer`
  - **File**: `app/actions/events.ts`
  - **Actions**: `createEvent`, `updateEvent`, `deleteEvent`, `createRSVP`, `cancelRSVP`
  - **Time**: 2 hours

- [ ] **Task 2.1.3**: Create event database queries
  - **Sub-Agent**: `database-architect`
  - **File**: `lib/queries/events.ts`
  - **Queries**: Get events, get event by ID, get user RSVPs
  - **Time**: 1 hour

---

### 2.2 Event Display Pages

- [ ] **Task 2.2.1**: Create event list page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/events/page.tsx`
  - **Features**: List all events, filters by campus/type
  - **Time**: 2 hours

- [ ] **Task 2.2.2**: Create event detail page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/events/[id]/page.tsx`
  - **Features**: Event details, RSVP button, attendee count
  - **Time**: 2 hours

- [ ] **Task 2.2.3**: Create EventCard component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/event-card.tsx`
  - **Features**: Responsive card, date display, campus badge
  - **Time**: 1 hour

- [ ] **Task 2.2.4**: Create RSVP form component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/rsvp-form.tsx`
  - **Features**: Guest count, notes field, submit button
  - **Time**: 1 hour

---

### 2.3 Calendar View

- [ ] **Task 2.3.1**: Install calendar library
  - **Sub-Agent**: `nextjs-expert`
  - **Dependency**: `react-big-calendar` or custom solution
  - **Time**: 15 minutes

- [ ] **Task 2.3.2**: Create calendar component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/calendar.tsx`
  - **Features**: Month view, event popups, navigation
  - **Time**: 3 hours

- [ ] **Task 2.3.3**: Add calendar to events page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/events/calendar/page.tsx`
  - **Features**: Toggle between list and calendar view
  - **Time**: 1 hour

- [ ] **Task 2.3.4**: Implement calendar export (iCal)
  - **Sub-Agent**: `api-designer`
  - **File**: `app/api/calendar/export/route.ts`
  - **Features**: Generate .ics file, download link
  - **Reference**: `docs/api/API_ROUTES.md`
  - **Time**: 2 hours

---

### 2.4 Event Filters & Search

- [ ] **Task 2.4.1**: Create filter component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/event-filters.tsx`
  - **Features**: Campus select, event type, date range
  - **Time**: 1.5 hours

- [ ] **Task 2.4.2**: Implement event search
  - **Sub-Agent**: `nextjs-expert`
  - **Features**: Search by title/description, real-time results
  - **Time**: 1.5 hours

**Phase 2 Total Time**: ~20-25 hours

---

## Phase 3: Photo Gallery (Week 4-5)

### 3.1 Album System

- [ ] **Task 3.1.1**: Create album validation schema
  - **Sub-Agent**: `api-designer`
  - **File**: `lib/validations/albums.ts`
  - **Time**: 20 minutes

- [ ] **Task 3.1.2**: Create album Server Actions
  - **Sub-Agent**: `api-designer`
  - **File**: `app/actions/albums.ts`
  - **Actions**: `createAlbum`, `updateAlbum`, `deleteAlbum`
  - **Time**: 1.5 hours

- [ ] **Task 3.1.3**: Create album list page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/gallery/page.tsx`
  - **Features**: Grid of albums, featured albums first
  - **Time**: 2 hours

- [ ] **Task 3.1.4**: Create AlbumCard component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/album-card.tsx`
  - **Features**: Cover image, title, photo count, date
  - **Time**: 1 hour

---

### 3.2 Photo Display

- [ ] **Task 3.2.1**: Create album detail page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/gallery/[albumId]/page.tsx`
  - **Features**: Photo grid, masonry layout
  - **Time**: 2 hours

- [ ] **Task 3.2.2**: Create photo lightbox
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/photo-lightbox.tsx`
  - **Features**: Full-screen view, navigation, captions
  - **Dependency**: `react-photoswipe` or custom
  - **Time**: 2 hours

- [ ] **Task 3.2.3**: Implement image optimization
  - **Sub-Agent**: `nextjs-expert`
  - **Features**: Next.js Image, WebP format, lazy loading
  - **Time**: 1 hour

---

### 3.3 Photo Upload (Admin)

- [ ] **Task 3.3.1**: Create photo upload Server Action
  - **Sub-Agent**: `supabase-integration`
  - **File**: `app/actions/photos.ts`
  - **Actions**: `uploadPhoto`, `deletePhoto`, `updateCaption`
  - **Reference**: `docs/api/SERVER_ACTIONS.md`
  - **Time**: 2 hours

- [ ] **Task 3.3.2**: Create upload form component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/admin/photo-upload.tsx`
  - **Features**: Drag-and-drop, multiple files, progress
  - **Time**: 3 hours

- [ ] **Task 3.3.3**: Add image preview and editing
  - **Sub-Agent**: `ui-components`
  - **Features**: Crop, rotate, add caption before upload
  - **Time**: 2 hours

**Phase 3 Total Time**: ~18-22 hours

---

## Phase 4: News & Content (Week 5-6)

### 4.1 News System

- [ ] **Task 4.1.1**: Create news post validation schema
  - **Sub-Agent**: `api-designer`
  - **File**: `lib/validations/news.ts`
  - **Time**: 20 minutes

- [ ] **Task 4.1.2**: Create news Server Actions
  - **Sub-Agent**: `api-designer`
  - **File**: `app/actions/news.ts`
  - **Actions**: `createPost`, `updatePost`, `deletePost`, `publishPost`
  - **Time**: 1.5 hours

- [ ] **Task 4.1.3**: Create news list page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/news/page.tsx`
  - **Features**: Post grid, featured posts, pagination
  - **Time**: 2 hours

- [ ] **Task 4.1.4**: Create news detail page
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `app/news/[slug]/page.tsx`
  - **Features**: Full post content, related posts, share buttons
  - **Time**: 2 hours

- [ ] **Task 4.1.5**: Create NewsCard component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/news-card.tsx`
  - **Time**: 1 hour

---

### 4.2 Rich Text Editor (Admin)

- [ ] **Task 4.2.1**: Install rich text editor
  - **Sub-Agent**: `ui-components`
  - **Dependency**: `@tiptap/react` or `lexical`
  - **Time**: 30 minutes

- [ ] **Task 4.2.2**: Create editor component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/admin/rich-text-editor.tsx`
  - **Features**: Formatting, images, links, headings
  - **Time**: 3 hours

- [ ] **Task 4.2.3**: Integrate editor in admin
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/news/new/page.tsx`
  - **Time**: 1 hour

---

### 4.3 About Pages

- [ ] **Task 4.3.1**: Create about/mission page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/about/page.tsx`
  - **Content**: Mission, vision, values
  - **Time**: 1.5 hours

- [ ] **Task 4.3.2**: Create board members page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/about/board/page.tsx`
  - **Features**: Board member profiles with photos
  - **Time**: 2 hours

- [ ] **Task 4.3.3**: Create FAQ page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/about/faq/page.tsx`
  - **Features**: Accordion-style Q&A
  - **Time**: 1.5 hours

**Phase 4 Total Time**: ~17-20 hours

---

## Phase 5: Donations (Week 6-7)

### 5.1 Stripe Setup

- [ ] **Task 5.1.1**: Create Stripe account
  - **Sub-Agent**: `stripe-payment`
  - **Action**: Sign up at stripe.com, get API keys
  - **Time**: 15 minutes

- [ ] **Task 5.1.2**: Setup Stripe client wrapper
  - **Sub-Agent**: `stripe-payment`
  - **File**: `lib/stripe/client.ts`, `lib/stripe/server.ts`
  - **Time**: 30 minutes

- [ ] **Task 5.1.3**: Install Stripe dependencies
  - **Sub-Agent**: `stripe-payment`
  - **Dependencies**: `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`
  - **Time**: 10 minutes

---

### 5.2 Donation Flow

- [ ] **Task 5.2.1**: Create donation validation schema
  - **Sub-Agent**: `api-designer`
  - **File**: `lib/validations/donations.ts`
  - **Time**: 30 minutes

- [ ] **Task 5.2.2**: Create donation Server Actions
  - **Sub-Agent**: `stripe-payment`
  - **File**: `app/actions/donations.ts`
  - **Actions**: `createDonation`, `getDonationHistory`
  - **Reference**: `docs/api/SERVER_ACTIONS.md`
  - **Time**: 2 hours

- [ ] **Task 5.2.3**: Create donation page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/donate/page.tsx`
  - **Features**: Hero, form, impact statements
  - **Time**: 2 hours

- [ ] **Task 5.2.4**: Create donation form component
  - **Sub-Agent**: `stripe-payment` + `ui-components`
  - **File**: `components/features/donation-form.tsx`
  - **Features**: Amount selection, donation type, donor info, Stripe Elements
  - **Time**: 3 hours

- [ ] **Task 5.2.5**: Create donation success page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/donate/success/page.tsx`
  - **Features**: Thank you message, receipt, social share
  - **Time**: 1 hour

---

### 5.3 Stripe Webhook

- [ ] **Task 5.3.1**: Create Stripe webhook handler
  - **Sub-Agent**: `stripe-payment`
  - **File**: `app/api/webhooks/stripe/route.ts`
  - **Events**: payment_intent.succeeded, payment_intent.failed
  - **Reference**: `docs/api/API_ROUTES.md`
  - **Time**: 2 hours

- [ ] **Task 5.3.2**: Setup webhook in Stripe Dashboard
  - **Sub-Agent**: `stripe-payment`
  - **Action**: Add webhook URL, get signing secret
  - **Time**: 15 minutes

- [ ] **Task 5.3.3**: Test webhook locally
  - **Sub-Agent**: `stripe-payment`
  - **Tool**: Stripe CLI for forwarding
  - **Time**: 30 minutes

---

### 5.4 Recurring Donations

- [ ] **Task 5.4.1**: Add subscription support
  - **Sub-Agent**: `stripe-payment`
  - **Features**: Monthly/quarterly/annual options
  - **Time**: 2 hours

- [ ] **Task 5.4.2**: Create subscription management page
  - **Sub-Agent**: `stripe-payment` + `ui-components`
  - **File**: `app/dashboard/donations/page.tsx`
  - **Features**: View subscriptions, cancel, update payment method
  - **Time**: 2 hours

**Phase 5 Total Time**: ~17-20 hours

---

## Phase 6: Store (Week 7-8)

### 6.1 Store Setup (Choose One)

**Option A: Shopify Integration**

- [ ] **Task 6.1.A.1**: Create Shopify store
  - **Sub-Agent**: `shopify-integration`
  - **Action**: Sign up, configure store settings
  - **Time**: 1 hour

- [ ] **Task 6.1.A.2**: Setup Shopify Storefront API client
  - **Sub-Agent**: `shopify-integration`
  - **File**: `lib/shopify/client.ts`
  - **Time**: 1 hour

- [ ] **Task 6.1.A.3**: Create product fetching queries
  - **Sub-Agent**: `shopify-integration`
  - **File**: `lib/shopify/queries.ts`
  - **Queries**: Get products, get product by ID, get collections
  - **Time**: 2 hours

**Option B: Stripe Products**

- [ ] **Task 6.1.B.1**: Create products in Stripe Dashboard
  - **Sub-Agent**: `stripe-payment`
  - **Products**: T-shirts, hoodies, spirit wear
  - **Time**: 1 hour

- [ ] **Task 6.1.B.2**: Create product fetching functions
  - **Sub-Agent**: `stripe-payment`
  - **File**: `lib/stripe/products.ts`
  - **Time**: 1 hour

---

### 6.2 Store Pages

- [ ] **Task 6.2.1**: Create store homepage
  - **Sub-Agent**: `ui-components`
  - **File**: `app/store/page.tsx`
  - **Features**: Product grid, categories, search
  - **Time**: 2 hours

- [ ] **Task 6.2.2**: Create product detail page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/store/products/[id]/page.tsx`
  - **Features**: Images, variants, size chart, add to cart
  - **Time**: 3 hours

- [ ] **Task 6.2.3**: Create ProductCard component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/product-card.tsx`
  - **Time**: 1 hour

---

### 6.3 Shopping Cart

- [ ] **Task 6.3.1**: Create cart state management
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `lib/store/cart.ts`
  - **Features**: Add, remove, update quantity
  - **Time**: 2 hours

- [ ] **Task 6.3.2**: Create cart component
  - **Sub-Agent**: `ui-components`
  - **File**: `components/features/cart.tsx`
  - **Features**: Drawer/sidebar, item list, total, checkout button
  - **Time**: 2 hours

- [ ] **Task 6.3.3**: Create checkout page
  - **Sub-Agent**: `shopify-integration` or `stripe-payment`
  - **File**: `app/store/checkout/page.tsx`
  - **Features**: Shipping info, payment, order summary
  - **Time**: 3 hours

**Phase 6 Total Time**: ~17-20 hours

---

## Phase 7: Admin Panel (Week 9-10)

### 7.1 Admin Layout

- [ ] **Task 7.1.1**: Create admin layout
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/layout.tsx`
  - **Features**: Sidebar navigation, header, breadcrumbs
  - **Time**: 2 hours

- [ ] **Task 7.1.2**: Create admin dashboard
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/page.tsx`
  - **Features**: Stats cards, recent activity, quick actions
  - **Time**: 2 hours

- [ ] **Task 7.1.3**: Add admin middleware protection
  - **Sub-Agent**: `nextjs-expert`
  - **File**: `middleware.ts` (update)
  - **Features**: Check admin role, redirect non-admins
  - **Time**: 30 minutes

---

### 7.2 Event Management

- [ ] **Task 7.2.1**: Create event list admin page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/events/page.tsx`
  - **Features**: Table with edit/delete actions
  - **Time**: 2 hours

- [ ] **Task 7.2.2**: Create event create/edit form
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/events/[id]/page.tsx`
  - **Features**: Form with all event fields, validation
  - **Time**: 3 hours

---

### 7.3 Content Management

- [ ] **Task 7.3.1**: Create news management page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/news/page.tsx`
  - **Time**: 2 hours

- [ ] **Task 7.3.2**: Create album management page
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/gallery/page.tsx`
  - **Time**: 2 hours

---

### 7.4 Donation Reports

- [ ] **Task 7.4.1**: Create donations dashboard
  - **Sub-Agent**: `ui-components`
  - **File**: `app/admin/donations/page.tsx`
  - **Features**: Charts, filters, export CSV
  - **Time**: 3 hours

- [ ] **Task 7.4.2**: Add donation export functionality
  - **Sub-Agent**: `api-designer`
  - **File**: `app/api/admin/donations/export/route.ts`
  - **Features**: Generate CSV, date filters
  - **Time**: 1.5 hours

**Phase 7 Total Time**: ~20-24 hours

---

## Phase 8: Polish & Testing (Week 11-12)

### 8.1 Performance Optimization

- [ ] **Task 8.1.1**: Run Lighthouse audit
  - **Sub-Agent**: `code-reviewer`
  - **Action**: Test all major pages
  - **Time**: 1 hour

- [ ] **Task 8.1.2**: Optimize images
  - **Sub-Agent**: `nextjs-expert`
  - **Features**: WebP format, proper sizing, lazy loading
  - **Time**: 2 hours

- [ ] **Task 8.1.3**: Implement caching strategy
  - **Sub-Agent**: `nextjs-expert`
  - **Features**: ISR for static pages, cache tags
  - **Time**: 2 hours

- [ ] **Task 8.1.4**: Add loading states
  - **Sub-Agent**: `ui-components`
  - **Features**: Skeletons, spinners, Suspense boundaries
  - **Time**: 2 hours

---

### 8.2 Accessibility

- [ ] **Task 8.2.1**: Run accessibility audit
  - **Sub-Agent**: `code-reviewer`
  - **Tool**: axe DevTools
  - **Time**: 1 hour

- [ ] **Task 8.2.2**: Fix accessibility issues
  - **Sub-Agent**: `ui-components`
  - **Focus**: ARIA labels, keyboard navigation, focus indicators
  - **Time**: 3 hours

- [ ] **Task 8.2.3**: Add skip links and landmarks
  - **Sub-Agent**: `ui-components`
  - **Time**: 1 hour

---

### 8.3 Testing

- [ ] **Task 8.3.1**: Test authentication flows
  - **Action**: Signup, login, logout, password reset
  - **Time**: 1 hour

- [ ] **Task 8.3.2**: Test donation process
  - **Action**: One-time and recurring donations
  - **Time**: 1 hour

- [ ] **Task 8.3.3**: Test store checkout
  - **Action**: Add to cart, checkout, order confirmation
  - **Time**: 1 hour

- [ ] **Task 8.3.4**: Test admin functionality
  - **Action**: Create/edit/delete content
  - **Time**: 2 hours

- [ ] **Task 8.3.5**: Test mobile responsiveness
  - **Action**: Test on iOS and Android
  - **Time**: 2 hours

- [ ] **Task 8.3.6**: Cross-browser testing
  - **Browsers**: Chrome, Firefox, Safari, Edge
  - **Time**: 2 hours

---

### 8.4 Security Review

- [ ] **Task 8.4.1**: Review RLS policies
  - **Sub-Agent**: `database-architect`
  - **Time**: 1 hour

- [ ] **Task 8.4.2**: Audit Server Actions
  - **Sub-Agent**: `code-reviewer`
  - **Focus**: Input validation, authorization
  - **Time**: 2 hours

- [ ] **Task 8.4.3**: Review webhook security
  - **Sub-Agent**: `code-reviewer`
  - **Focus**: Signature verification, rate limiting
  - **Time**: 1 hour

**Phase 8 Total Time**: ~23-27 hours

---

## Phase 9: Deployment (Week 13)

### 9.1 Vercel Setup

- [ ] **Task 9.1.1**: Create Vercel account and project
  - **Sub-Agent**: `nextjs-expert`
  - **Action**: Connect GitHub repo
  - **Time**: 30 minutes

- [ ] **Task 9.1.2**: Configure environment variables
  - **Sub-Agent**: `nextjs-expert`
  - **Action**: Add all env vars in Vercel dashboard
  - **Time**: 20 minutes

- [ ] **Task 9.1.3**: Setup custom domain
  - **Sub-Agent**: `nextjs-expert`
  - **Action**: Configure DNS, add domain in Vercel
  - **Time**: 30 minutes

---

### 9.2 Webhook Configuration

- [ ] **Task 9.2.1**: Configure Stripe webhook
  - **Sub-Agent**: `stripe-payment`
  - **Action**: Add production webhook URL in Stripe
  - **Time**: 15 minutes

- [ ] **Task 9.2.2**: Configure Shopify webhook (if using)
  - **Sub-Agent**: `shopify-integration`
  - **Action**: Add webhook URLs in Shopify
  - **Time**: 15 minutes

---

### 9.3 Final Checks

- [ ] **Task 9.3.1**: Test production deployment
  - **Action**: Verify all features work in production
  - **Time**: 2 hours

- [ ] **Task 9.3.2**: Setup monitoring
  - **Action**: Configure Vercel Analytics, error tracking
  - **Time**: 30 minutes

- [ ] **Task 9.3.3**: Create admin user accounts
  - **Action**: Setup initial PTO board member accounts
  - **Time**: 30 minutes

- [ ] **Task 9.3.4**: Populate initial content
  - **Action**: Add first events, news posts, photos
  - **Time**: 2 hours

**Phase 9 Total Time**: ~7-10 hours

---

## Post-Launch Tasks

### Maintenance & Monitoring

- [ ] Monitor error logs daily (first week)
- [ ] Track analytics and user feedback
- [ ] Fix bugs as reported
- [ ] Optimize based on real usage data
- [ ] Plan feature enhancements
- [ ] Regular security updates

### Future Enhancements

- [ ] Email newsletter integration
- [ ] Member directory
- [ ] Volunteer hour tracking
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Calendar sync with school calendar

---

## Total Estimated Time

| Phase | Hours |
|-------|-------|
| Phase 1: Foundation | 20-25 |
| Phase 2: Events & Calendar | 20-25 |
| Phase 3: Photo Gallery | 18-22 |
| Phase 4: News & Content | 17-20 |
| Phase 5: Donations | 17-20 |
| Phase 6: Store | 17-20 |
| Phase 7: Admin Panel | 20-24 |
| Phase 8: Polish & Testing | 23-27 |
| Phase 9: Deployment | 7-10 |
| **TOTAL** | **159-193 hours** |

**At 15 hours/week**: 11-13 weeks
**At 20 hours/week**: 8-10 weeks
**At 30 hours/week**: 5-7 weeks

---

## How to Track Progress

### Using This Document

1. Check off tasks as you complete them: `- [x]`
2. Add notes below tasks if needed
3. Update time estimates based on actuals
4. Commit changes to track progress over time

### Using Claude Code

When working on a task:
```
Use the [sub-agent-name] sub-agent to complete Task X.X.X: [task description]
```

Claude will automatically invoke the appropriate sub-agent with the necessary context and tools.

---

## Tips for Success

1. **Work sequentially** - Don't skip ahead, build solid foundations
2. **Test as you go** - Don't wait until the end to test
3. **Commit often** - Small, frequent commits are better
4. **Ask for help** - Use sub-agents for specific expertise
5. **Take breaks** - Don't burn out, pace yourself
6. **Document changes** - Update docs as you build
7. **Celebrate wins** - Check off completed tasks!

---

## Questions or Stuck?

When you get stuck:
1. Review the relevant documentation
2. Use the appropriate sub-agent
3. Check the implementation examples
4. Test in isolation first
5. Ask Claude for clarification

---

**You've got this! Start with Phase 1, Task 1.1.1 and work your way through. Good luck!** 🚀
