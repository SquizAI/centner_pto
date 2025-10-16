# Centner Academy PTO - Complete Sitemap & Development Status

**Last Updated**: October 16, 2025
**Version**: 2.0
**Status**: Active Development

---

## Table of Contents
1. [Public Routes](#public-routes)
2. [Authentication Routes](#authentication-routes)
3. [User Dashboard Routes](#user-dashboard-routes)
4. [Admin Routes](#admin-routes)
5. [API Routes](#api-routes)
6. [Development Status Matrix](#development-status-matrix)
7. [Critical UX Issues](#critical-ux-issues)
8. [Navigation Architecture](#navigation-architecture)

---

## Public Routes
Routes accessible to all visitors (authenticated or not)

### 1. Homepage
- **Route**: `/`
- **File**: `src/app/page.tsx`
- **Purpose**: Main landing page, showcases PTO mission, upcoming events, news highlights
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Hero section with mission statement
  - Upcoming events carousel
  - Latest news articles (3 featured)
  - Call-to-action buttons (Join, Donate, Volunteer)
  - Instagram feed integration
  - Footer with links (ONLY page with footer)
- **Auth Required**: No
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

### 2. About Page
- **Route**: `/about`
- **File**: `src/app/about/page.tsx`
- **Purpose**: About PTO, mission, board members, history
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Mission statement
  - Board member profiles with photos
  - PTO history
  - Contact information
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

### 3. Events
- **Route**: `/events`
- **File**: `src/app/events/page.tsx`
- **Purpose**: Browse all upcoming and past events
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Event grid with filters (upcoming, past, all)
  - Search functionality
  - Category filtering
  - Event cards with image, date, title, description
  - RSVP button (requires auth)
- **Auth Required**: No (viewing), Yes (RSVP)
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

#### 3a. Event Detail
- **Route**: `/events/[id]`
- **File**: `src/app/events/[id]/page.tsx`
- **Purpose**: View single event details, RSVP
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Full event details
  - Date, time, location
  - Description with rich text
  - RSVP functionality
  - Share buttons
  - Related events
- **Auth Required**: No (viewing), Yes (RSVP)
- **Role Required**: None
- **Issues**: ⚠️ No breadcrumb navigation, Missing footer
- **Next Steps**: Add breadcrumb, Add footer

### 4. News/Blog
- **Route**: `/news`
- **File**: `src/app/news/page.tsx`
- **Purpose**: Browse all news articles and announcements
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Article grid with filters
  - Search functionality
  - Category filtering (announcements, updates, events)
  - Article cards with featured image
  - Pagination
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

#### 4a. News Article
- **Route**: `/news/[slug]`
- **File**: `src/app/news/[slug]/page.tsx`
- **Purpose**: Read full news article
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Full article with rich text editor content
  - Featured image
  - Author and publish date
  - Share buttons
  - Related articles
  - Comments section (future)
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ No breadcrumb navigation, Missing footer
- **Next Steps**: Add breadcrumb, Add footer

### 5. Photo Gallery
- **Route**: `/gallery`
- **File**: `src/app/gallery/page.tsx`
- **Purpose**: Browse photo albums from events
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Album grid with cover images
  - Filter by year, event type
  - Search functionality
  - Album cards show photo count
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

#### 5a. Album View
- **Route**: `/gallery/[id]`
- **File**: `src/app/gallery/[id]/page.tsx`
- **Purpose**: View all photos in an album
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Photo grid (masonry layout)
  - Lightbox viewer
  - Download original photo
  - Share photo
  - Photo metadata (date, event, photographer)
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ No breadcrumb navigation, Missing footer
- **Next Steps**: Add breadcrumb, Add footer

### 6. Volunteer
- **Route**: `/volunteer`
- **File**: `src/app/volunteer/page.tsx`
- **Purpose**: Browse volunteer opportunities, sign up
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Volunteer opportunity cards
  - Filter by date, type, hours required
  - Sign up button (requires auth)
  - Volunteer hour tracking (for logged-in users)
  - Impact statistics
- **Auth Required**: No (viewing), Yes (sign up)
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

#### 6a. Volunteer Opportunity Detail
- **Route**: `/volunteer/[id]`
- **File**: `src/app/volunteer/[id]/page.tsx`
- **Purpose**: View volunteer opportunity details and sign up
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Full opportunity description
  - Date, time, location
  - Hours required
  - Spots available
  - Sign up form
  - Share buttons
- **Auth Required**: Yes (sign up)
- **Role Required**: None
- **Issues**: ⚠️ No breadcrumb navigation, Missing footer
- **Next Steps**: Add breadcrumb, Add footer

### 7. Donate
- **Route**: `/donate`
- **File**: `src/app/donate/page.tsx`
- **Purpose**: Make donations via Stripe
- **Status**: ⚠️ **In Development** (70%)
- **Features**:
  - Donation amount selection (preset + custom)
  - Stripe payment integration
  - Recurring donation option
  - Donation impact information
  - Tax receipt generation
  - Donor recognition options
- **Auth Required**: No
- **Role Required**: None
- **Issues**:
  - ❌ Stripe integration incomplete
  - ❌ Tax receipt generation not implemented
  - ⚠️ Missing footer
- **Next Steps**: Complete Stripe integration, Test payment flow, Add footer

### 8. Store
- **Route**: `/store`
- **File**: `src/app/store/page.tsx`
- **Purpose**: Browse and purchase PTO merchandise
- **Status**: ⚠️ **Planned** (20%)
- **Features**:
  - Product grid
  - Shopping cart
  - Shopify integration
  - Product categories (apparel, accessories, spirit items)
  - Size selection
  - Checkout flow
- **Auth Required**: No
- **Role Required**: None
- **Issues**:
  - ❌ Shopify integration not started
  - ❌ Product data not populated
  - ❌ Shopping cart not implemented
  - ⚠️ Missing footer
- **Next Steps**: Integrate Shopify, Build cart system, Add footer

#### 8a. Product Detail
- **Route**: `/store/[id]`
- **File**: `src/app/store/[id]/page.tsx`
- **Purpose**: View product details, add to cart
- **Status**: ⚠️ **Planned** (10%)
- **Features**: TBD
- **Auth Required**: No
- **Role Required**: None
- **Issues**: Not yet implemented
- **Next Steps**: Build product detail page

### 9. Contact
- **Route**: `/contact`
- **File**: `src/app/contact/page.tsx`
- **Purpose**: Contact form for inquiries
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Contact form (name, email, subject, message)
  - Email validation
  - Submission success message
  - Contact information display
- **Auth Required**: No
- **Role Required**: None
- **Issues**: ⚠️ Missing footer
- **Next Steps**: Add footer component

---

## Authentication Routes
Routes for login, signup, password management (Route Group: `(auth)`)

### 10. Sign Up
- **Route**: `/signup`
- **File**: `src/app/(auth)/signup/page.tsx`
- **Purpose**: Create new account
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Email/password signup
  - OAuth (Google, Facebook)
  - Real-time password strength indicator ⭐ NEW
  - Full name collection
  - Email verification required
  - Beautiful branded email template ⭐ NEW
- **Auth Required**: No (redirects if logged in)
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

### 11. Login
- **Route**: `/login`
- **File**: `src/app/(auth)/login/page.tsx`
- **Purpose**: User authentication
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Email/password login
  - OAuth (Google, Facebook)
  - Remember me checkbox
  - Forgot password link
  - Role-based redirect (admin → /admin, member → /dashboard)
- **Auth Required**: No (redirects if logged in)
- **Role Required**: None
- **Issues**: ✅ Fixed - Now correctly redirects admins to /admin
- **Next Steps**: None

### 12. Forgot Password
- **Route**: `/forgot-password`
- **File**: `src/app/(auth)/forgot-password/page.tsx`
- **Purpose**: Request password reset
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Email input
  - Password reset email sent via Supabase
  - Beautiful branded recovery email ⭐ NEW
- **Auth Required**: No
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

### 13. Reset Password
- **Route**: `/reset-password`
- **File**: `src/app/(auth)/reset-password/page.tsx`
- **Purpose**: Set new password after reset
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - New password input with confirmation
  - Password strength indicator
  - Success message with redirect
- **Auth Required**: Special (password reset token required)
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

### 14. Success Page
- **Route**: `/success`
- **File**: `src/app/(auth)/success/page.tsx`
- **Purpose**: Success confirmation for various actions
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Dynamic content based on type parameter
  - Types: signup, email-verified, contact, volunteer
  - Countdown timer with auto-redirect
  - Animated confirmation UI
- **Auth Required**: No
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

### 15. Auth Callback
- **Route**: `/auth/callback`
- **File**: `src/app/auth/callback/route.ts`
- **Purpose**: OAuth callback handler
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Code exchange for session
  - Profile creation for OAuth users
  - Type-based redirect (email verification, oauth, etc.)
  - Enhanced with email verification success message ⭐ NEW
- **Auth Required**: Special (OAuth flow)
- **Role Required**: None
- **Issues**: None
- **Next Steps**: None

---

## User Dashboard Routes
Routes for authenticated users (Route Group: `dashboard`)

### 16. Dashboard Home
- **Route**: `/dashboard`
- **File**: `src/app/dashboard/page.tsx`
- **Purpose**: User's personal dashboard
- **Status**: ✅ **Production Ready** (90%)
- **Features**:
  - Welcome message with user name
  - Quick stats (events RSVP'd, volunteer hours, donations)
  - Upcoming events
  - Recent news
  - Volunteer opportunities
- **Auth Required**: Yes
- **Role Required**: None (all authenticated users)
- **Issues**:
  - ⚠️ No sidebar navigation
  - ⚠️ Stats not fully connected to real data
- **Next Steps**: Add dashboard sidebar, Connect real-time stats

### 17. Profile/Settings
- **Route**: `/dashboard/profile`
- **File**: `src/app/dashboard/profile/page.tsx`
- **Purpose**: Edit user profile and settings
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Edit full name, phone
  - Select campus (preschool, elementary, middle_high)
  - Student grades selection
  - Avatar upload
  - Email change (with verification)
  - Password change
- **Auth Required**: Yes
- **Role Required**: None
- **Issues**: ⚠️ No sidebar navigation
- **Next Steps**: Add dashboard sidebar

### 18. My Events
- **Route**: `/dashboard/events`
- **File**: `src/app/dashboard/events/page.tsx`
- **Purpose**: View user's RSVP'd events
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - List of RSVP'd events
  - Filter by upcoming/past
  - Cancel RSVP functionality
  - Add to calendar export
- **Auth Required**: Yes
- **Role Required**: None
- **Issues**: ⚠️ No sidebar navigation
- **Next Steps**: Add dashboard sidebar

### 19. My Volunteer Hours
- **Route**: `/dashboard/volunteer`
- **File**: `src/app/dashboard/volunteer/page.tsx`
- **Purpose**: Track volunteer hours and commitments
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Total hours tracked
  - Upcoming volunteer shifts
  - Past volunteer history
  - Hour verification status
  - Download volunteer report
- **Auth Required**: Yes
- **Role Required**: None
- **Issues**: ⚠️ No sidebar navigation
- **Next Steps**: Add dashboard sidebar

### 20. Donation History
- **Route**: `/dashboard/donations`
- **File**: `src/app/dashboard/donations/page.tsx`
- **Purpose**: View donation history and receipts
- **Status**: ⚠️ **Planned** (30%)
- **Features**:
  - Donation history table
  - Download tax receipts
  - Recurring donation management
  - Donation impact statistics
- **Auth Required**: Yes
- **Role Required**: None
- **Issues**:
  - ❌ Not fully implemented
  - ⚠️ No sidebar navigation
- **Next Steps**: Complete donation history integration, Add dashboard sidebar

---

## Admin Routes
Routes for administrators (Route Group: `admin`)

### 21. Admin Dashboard
- **Route**: `/admin`
- **File**: `src/app/admin/page.tsx`
- **Purpose**: Admin overview and quick actions
- **Status**: ✅ **Production Ready** (90%)
- **Features**:
  - Site statistics (users, events, donations, etc.)
  - Recent activity feed
  - Quick action buttons
  - Charts and graphs
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**:
  - ⚠️ No admin sidebar
  - ⚠️ Charts not fully implemented
- **Next Steps**: Add admin sidebar, Implement analytics charts

### 22. Admin - Manage Events
- **Route**: `/admin/events`
- **File**: `src/app/admin/events/page.tsx`
- **Purpose**: View and manage all events
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Events table with filters
  - Search functionality
  - Create new event button
  - Edit/Delete actions
  - Publish/Draft status toggle
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 22a. Create Event
- **Route**: `/admin/events/new`
- **File**: `src/app/admin/events/new/page.tsx`
- **Purpose**: Create new event
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Rich text editor for description
  - Date/time picker
  - Location input
  - Category selection
  - Image upload
  - RSVP settings (max attendees, deadline)
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 22b. Edit Event
- **Route**: `/admin/events/[id]/edit`
- **File**: `src/app/admin/events/[id]/edit/page.tsx`
- **Purpose**: Edit existing event
- **Status**: ✅ **Production Ready** (95%)
- **Features**: Same as Create Event
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

### 23. Admin - Manage News
- **Route**: `/admin/news`
- **File**: `src/app/admin/news/page.tsx`
- **Purpose**: View and manage all news articles
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Articles table with filters
  - Search functionality
  - Create new article button
  - Edit/Delete actions
  - Publish/Draft status toggle
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 23a. Create News Article
- **Route**: `/admin/news/new`
- **File**: `src/app/admin/news/new/page.tsx`
- **Purpose**: Create new news article
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Rich text editor
  - Featured image upload
  - Category selection
  - Slug auto-generation
  - SEO metadata
  - Publish date scheduling
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 23b. Edit News Article
- **Route**: `/admin/news/[id]/edit`
- **File**: `src/app/admin/news/[id]/edit/page.tsx`
- **Purpose**: Edit existing news article
- **Status**: ✅ **Production Ready** (95%)
- **Features**: Same as Create Article
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

### 24. Admin - Manage Gallery
- **Route**: `/admin/gallery`
- **File**: `src/app/gallery/admin/page.tsx`
- **Purpose**: View and manage photo albums
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Albums table
  - Create new album
  - Edit/Delete albums
  - Upload photos
  - Photo management
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 24a. Create Album
- **Route**: `/admin/gallery/new`
- **File**: `src/app/gallery/admin/new/page.tsx`
- **Purpose**: Create new photo album
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Album title and description
  - Event association
  - Cover photo selection
  - Bulk photo upload
  - Photo ordering
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

#### 24b. Edit Album
- **Route**: `/admin/gallery/[id]/edit`
- **File**: `src/app/gallery/admin/[id]/edit/page.tsx`
- **Purpose**: Edit album and manage photos
- **Status**: ✅ **Production Ready** (95%)
- **Features**: Same as Create Album + delete photos
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

### 25. Admin - Manage Volunteers
- **Route**: `/admin/volunteer`
- **File**: `src/app/volunteer/admin/page.tsx`
- **Purpose**: Manage volunteer opportunities and signups
- **Status**: ✅ **Production Ready** (95%)
- **Features**:
  - Volunteer opportunities table
  - Create/Edit/Delete opportunities
  - View signups
  - Approve/verify volunteer hours
  - Export volunteer reports
- **Auth Required**: Yes
- **Role Required**: admin, super_admin
- **Issues**: ⚠️ No breadcrumb navigation
- **Next Steps**: Add breadcrumb

### 26. Admin - Manage Users
- **Route**: `/admin/users`
- **File**: `src/app/admin/users/page.tsx`
- **Purpose**: View and manage all users
- **Status**: ⚠️ **In Development** (60%)
- **Features**:
  - Users table with filters
  - Search by name, email
  - Edit user roles
  - Deactivate/activate users
  - Send invitations
- **Auth Required**: Yes
- **Role Required**: super_admin (role management)
- **Issues**:
  - ❌ Role editing not fully implemented
  - ❌ Invitation system incomplete
  - ⚠️ No breadcrumb navigation
- **Next Steps**: Complete role management, Add breadcrumb

### 27. Admin - Settings
- **Route**: `/admin/settings`
- **File**: `src/app/admin/settings/page.tsx`
- **Purpose**: Site-wide settings and configuration
- **Status**: ⚠️ **Planned** (30%)
- **Features**:
  - General settings (site name, logo, etc.)
  - Email settings
  - Payment settings (Stripe keys)
  - Social media links
  - Analytics configuration
- **Auth Required**: Yes
- **Role Required**: super_admin
- **Issues**:
  - ❌ Most settings not implemented
  - ⚠️ No breadcrumb navigation
- **Next Steps**: Build settings interface, Add breadcrumb

---

## API Routes
Server-side API endpoints

### 28. Stripe Webhook
- **Route**: `/api/webhooks/stripe`
- **File**: `src/app/api/webhooks/stripe/route.ts`
- **Purpose**: Handle Stripe payment webhooks
- **Status**: ⚠️ **In Development** (50%)
- **Features**:
  - Payment intent succeeded
  - Payment intent failed
  - Subscription created/updated/canceled
- **Issues**: ❌ Not fully tested
- **Next Steps**: Complete webhook handlers, Add logging

### 29. Shopify Webhook
- **Route**: `/api/webhooks/shopify`
- **File**: `src/app/api/webhooks/shopify/route.ts`
- **Purpose**: Handle Shopify order webhooks
- **Status**: ⚠️ **Planned** (10%)
- **Features**: TBD
- **Issues**: ❌ Not yet implemented
- **Next Steps**: Set up Shopify integration

### 30. Calendar Export
- **Route**: `/api/calendar/export`
- **File**: `src/app/api/calendar/export/route.ts`
- **Purpose**: Export events to .ics format
- **Status**: ⚠️ **Planned** (0%)
- **Features**: Generate .ics file for calendar apps
- **Issues**: ❌ Not yet implemented
- **Next Steps**: Implement iCal generation

### 31. Contact Form Submission
- **Route**: `/api/contact`
- **File**: `src/app/api/contact/route.ts`
- **Purpose**: Handle contact form submissions
- **Status**: ✅ **Production Ready** (100%)
- **Features**:
  - Email validation
  - Rate limiting
  - Send notification email
- **Issues**: None
- **Next Steps**: None

---

## Development Status Matrix

### Overall Completion by Section

| Section | Routes | Complete | In Progress | Planned | Overall % |
|---------|--------|----------|-------------|---------|-----------|
| **Public Routes** | 9 | 8 | 1 | 1 | 85% |
| **Authentication** | 6 | 6 | 0 | 0 | 100% |
| **User Dashboard** | 5 | 4 | 1 | 0 | 90% |
| **Admin Routes** | 10 | 8 | 1 | 1 | 80% |
| **API Routes** | 4 | 1 | 1 | 2 | 40% |
| **TOTAL** | **34** | **27** | **4** | **4** | **82%** |

### Feature Completion Status

| Feature Area | Status | Completion % | Critical Issues |
|--------------|--------|--------------|-----------------|
| **Authentication & Authorization** | ✅ Complete | 100% | None |
| **Events Management** | ✅ Complete | 95% | Missing footer on public pages |
| **News/Blog System** | ✅ Complete | 95% | Missing footer on public pages |
| **Photo Gallery** | ✅ Complete | 95% | Missing footer on public pages |
| **Volunteer System** | ✅ Complete | 95% | Missing footer on public pages |
| **User Dashboard** | ✅ Complete | 90% | No sidebar navigation |
| **Admin Panel** | ⚠️ In Progress | 80% | Missing sidebar, breadcrumbs |
| **Donations** | ⚠️ In Progress | 70% | Stripe integration incomplete |
| **Store/Shop** | ❌ Planned | 20% | Shopify integration not started |
| **Email Templates** | ✅ Complete | 100% | None |

---

## Critical UX Issues

### 🔴 HIGH PRIORITY

#### 1. **Tablet Navigation Gap (768px - 1024px)**
- **Severity**: Critical
- **Impact**: Users on tablets have NO navigation
- **Location**: All pages
- **Solution**: Extend mobile nav to lg: breakpoint OR show desktop nav at md: breakpoint
- **Files**: `src/components/layout/header.tsx`, `src/components/layout/mobile-nav.tsx`

#### 2. **Mobile Nav Not Authentication-Aware**
- **Severity**: High
- **Impact**: Logged-in users can't access Dashboard/Admin from mobile
- **Location**: Mobile navigation
- **Solution**: Add conditional Dashboard/Admin links to mobile nav based on auth state
- **Files**: `src/components/layout/mobile-nav.tsx`

#### 3. **No Footer on Most Pages**
- **Severity**: High
- **Impact**: Users can't access legal links, contact info on 8+ pages
- **Location**: All pages except homepage
- **Solution**: Create reusable Footer component, add to root layout
- **Files**: Extract from `src/app/page.tsx`, create `src/components/layout/footer.tsx`

#### 4. **No Logout Button Visible**
- **Severity**: High
- **Impact**: Users struggle to find logout
- **Location**: User menu (desktop only, hidden on mobile)
- **Solution**: Make UserMenu more prominent, add to mobile nav
- **Files**: `src/components/auth/UserMenu.tsx`, `src/components/layout/mobile-nav.tsx`

### 🟡 MEDIUM PRIORITY

#### 5. **No Breadcrumb Navigation**
- **Severity**: Medium
- **Impact**: Users get lost in nested admin routes
- **Location**: Admin pages, detail pages
- **Solution**: Create Breadcrumb component
- **Files**: Create `src/components/layout/breadcrumb.tsx`

#### 6. **No Dashboard/Admin Sidebar**
- **Severity**: Medium
- **Impact**: Inconsistent navigation in protected areas
- **Location**: Dashboard and admin pages
- **Solution**: Create sidebar navigation for dashboard/admin
- **Files**: Create `src/components/layout/dashboard-sidebar.tsx`, `src/components/layout/admin-sidebar.tsx`

#### 7. **Incomplete Settings/Profile Access**
- **Severity**: Medium
- **Impact**: Users don't know where to edit profile
- **Location**: Mobile navigation
- **Solution**: Add Settings link to mobile nav, improve desktop menu
- **Files**: `src/components/layout/mobile-nav.tsx`, `src/components/auth/UserMenu.tsx`

---

## Navigation Architecture

### Desktop Navigation (≥1024px)
```
┌─────────────────────────────────────────────────────────────┐
│ Header (Sticky)                                             │
│ [Logo] [Home] [About] [Events] [News] [Volunteer] [Gallery]│
│                                          [Donate] [UserMenu▼]│
└─────────────────────────────────────────────────────────────┘

UserMenu Dropdown:
├── [Profile Icon + Name]
├── Dashboard
├── Admin Panel (if admin)
├── Settings
└── Sign Out
```

### Mobile Navigation (<768px)
```
┌─────────────────────────────────────────────────────────────┐
│ Header (Sticky - UserMenu only)                            │
│                                             [UserMenu▼]     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Bottom Navigation (Fixed)                                   │
│ [🏠 Home] [📅 Events] [📰 News] [🙋 Volunteer] [📷 Gallery]│
└─────────────────────────────────────────────────────────────┘
```

### Tablet Navigation (768px - 1024px) ⚠️ BROKEN
```
❌ NO NAVIGATION VISIBLE - Critical Bug!
```

### Recommended Mobile Nav (Authentication-Aware)
```
Logged Out:
[🏠 Home] [📅 Events] [📰 News] [🙋 Volunteer] [🔑 Login]

Logged In (Member):
[🏠 Home] [📅 Events] [📰 News] [🎯 Dashboard] [👤 Profile]

Logged In (Admin):
[🏠 Home] [⚙️ Admin] [📅 Events] [🎯 Dashboard] [👤 Profile]
```

---

## Page Purpose & Section Breakdown

### Homepage (/)
**Purpose**: Welcome visitors, showcase PTO mission and activities

**Sections**:
1. **Hero Section** - Mission statement, CTA buttons
2. **Upcoming Events** - 3-4 featured events
3. **Latest News** - 3 recent articles
4. **Impact Stats** - Donations raised, volunteer hours, events held
5. **Instagram Feed** - Latest 6 posts
6. **Call to Action** - Join PTO, Donate, Volunteer
7. **Footer** - Links, contact, social media, legal

**Expected Behavior**:
- Scroll-triggered animations on sections
- Auto-rotating event carousel
- Responsive grid layouts
- All CTAs link to appropriate pages
- Footer persists on scroll

**Current Issues**: None - working as expected

---

### About Page (/about)
**Purpose**: Explain PTO mission, introduce board members

**Sections**:
1. **Hero** - Mission statement
2. **Our Story** - PTO history
3. **Board Members** - Grid with photos, names, titles
4. **Contact Info** - Email, phone, address
5. **FAQ** - Common questions

**Expected Behavior**:
- Board member cards flip on hover (desktop)
- Smooth scroll to sections
- Responsive grid layouts

**Current Issues**: Missing footer

---

### Events Page (/events)
**Purpose**: Browse and RSVP to events

**Sections**:
1. **Hero** - Page title, filter buttons
2. **Search Bar** - Search by keyword
3. **Filter Options** - Upcoming, Past, All, Category filters
4. **Event Grid** - Cards with image, date, title, description, RSVP button
5. **Pagination** - Load more / page numbers

**Expected Behavior**:
- Filter updates grid without full page reload
- Search debounced (500ms)
- RSVP button shows login modal if not authenticated
- Upcoming events sorted by date (ascending)
- Past events sorted by date (descending)

**Current Issues**: Missing footer

---

### Event Detail (/events/[id])
**Purpose**: View single event, RSVP

**Sections**:
1. **Hero Image** - Featured event photo
2. **Event Details** - Date, time, location, description
3. **RSVP Form** - Name, email, number of attendees
4. **Share Buttons** - Facebook, Twitter, Email, Copy Link
5. **Related Events** - 3 similar events

**Expected Behavior**:
- RSVP requires authentication
- RSVP button disabled if event full
- Add to Calendar button generates .ics file
- Share buttons open in new window
- Related events dynamically loaded

**Current Issues**: No breadcrumb, Missing footer

---

### Dashboard Home (/dashboard)
**Purpose**: Personal hub for logged-in users

**Sections**:
1. **Welcome Banner** - Greeting with user name
2. **Quick Stats** - Cards showing RSVP'd events, volunteer hours, donations
3. **Upcoming Events** - User's RSVP'd events
4. **Recent Activity** - Timeline of user actions
5. **Quick Actions** - Buttons to RSVP, volunteer, donate

**Expected Behavior**:
- Stats update in real-time
- Quick action buttons open relevant pages
- Activity timeline paginated
- Responsive card layouts

**Current Issues**: No sidebar navigation, Stats not fully connected

---

### Admin Dashboard (/admin)
**Purpose**: Site management overview for admins

**Sections**:
1. **Welcome Banner** - Admin greeting
2. **Site Stats** - Total users, events, donations, etc.
3. **Recent Activity** - Latest user signups, RSVPs, donations
4. **Quick Actions** - Create event, create news, manage users
5. **Charts** - Analytics graphs (users over time, donation trends)

**Expected Behavior**:
- Stats update daily (cached)
- Charts interactive (hover for details)
- Recent activity real-time updates
- Quick actions open create forms

**Current Issues**: No sidebar, Charts not implemented

---

## Recommended Improvements

### Phase 1: Critical UX Fixes (Week 1)
1. ✅ Fix tablet navigation gap
2. ✅ Create reusable Footer component
3. ✅ Add footer to all public pages
4. ✅ Make mobile nav authentication-aware
5. ✅ Add logout button to mobile nav

### Phase 2: Navigation Enhancements (Week 2)
6. ⏳ Create Breadcrumb component
7. ⏳ Add breadcrumbs to admin pages
8. ⏳ Create Dashboard sidebar
9. ⏳ Create Admin sidebar
10. ⏳ Add profile link to mobile nav

### Phase 3: Complete Missing Features (Week 3-4)
11. ⏳ Complete Stripe donation integration
12. ⏳ Build Shopify store integration
13. ⏳ Implement user management (admin)
14. ⏳ Add analytics dashboard
15. ⏳ Complete settings page

### Phase 4: Polish & Testing (Week 5)
16. ⏳ Cross-browser testing
17. ⏳ Mobile device testing
18. ⏳ Accessibility audit
19. ⏳ Performance optimization
20. ⏳ SEO optimization

---

**Document Status**: ✅ Complete and Current
**Next Review Date**: October 23, 2025
**Owner**: Development Team
