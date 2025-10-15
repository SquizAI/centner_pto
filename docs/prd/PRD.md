# Product Requirements Document (PRD)
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** Draft
**Owner:** Centner Academy PTO

---

## Executive Summary

The Centner Academy Parent Teacher Organization (PTO) requires a modern, user-friendly website to serve as the central hub for parent engagement, event coordination, fundraising, and community building across all three campuses. This website will replace or enhance existing communication channels and provide a seamless experience for donations, merchandise sales, event management, and photo sharing.

---

## Project Overview

### Mission Statement
The Centner Academy Parent Teacher Organization (PTO) is a nonprofit organization dedicated to supporting the school's mission of providing a high-quality education to its students. The PTO's work is centered on enhancing the student experience and strengthening the school community.

PTO supports various events and initiatives throughout the year that benefit students and foster a sense of community across all three campuses. They are a group of parents committed to the health, well-being, and learning of the "whole child," helping to provide students with the experiences and skills they need to become lifelong learners and critical thinkers.

### Project Goals
1. Create a centralized digital platform for PTO communications and activities
2. Streamline donation and fundraising processes
3. Facilitate merchandise sales (spirit wear, Academy apparel)
4. Improve event visibility and parent engagement
5. Build community through shared photos and experiences
6. Provide transparency in PTO operations and costs

---

## Target Audience

### Primary Users
- **Current Parents**: Parents of students across all three Centner Academy campuses
- **PTO Board Members**: Administrators who manage content and events
- **Faculty & Staff**: School staff who coordinate with PTO

### Secondary Users
- **Prospective Parents**: Families considering Centner Academy
- **Community Members**: Local supporters and donors
- **Alumni Parents**: Past families who wish to stay connected

---

## Technical Stack

### Frontend
- **Framework**: Next.js 14+ (React)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui or Radix UI
- **State Management**: React Context / Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for photos/media)
- **API**: Next.js API Routes / Server Actions

### E-Commerce
- **Primary Option**: Shopify (embedded via Shopify Buy SDK)
- **Alternative**: Stripe Payment Links or Stripe Checkout
- **Inventory**: Shopify inventory management

### Payments & Donations
- **Processor**: Stripe
- **Features**: One-time and recurring donations
- **Reporting**: Stripe Dashboard + custom analytics

### Hosting & Infrastructure
- **Hosting**: Vercel (Next.js optimized)
- **Domain**: Custom domain (centnerpto.org or similar)
- **SSL**: Automatic via Vercel
- **CDN**: Vercel Edge Network

### Third-Party Integrations
- **Calendar**: Google Calendar API or custom calendar with iCal export
- **Email**: SendGrid or Resend for transactional emails
- **Analytics**: Google Analytics 4 + Vercel Analytics
- **CMS**: Supabase + custom admin panel

---

## Feature Requirements

## 1. About Centner PTO

### 1.1 Overview Section
**Priority**: High
**Description**: Comprehensive introduction to the PTO

**Requirements**:
- Mission and vision statements prominently displayed
- Overview of PTO role across all three campuses
- Emphasis on "whole child" approach
- Clear value proposition for parent involvement

**Content Elements**:
- Hero section with compelling imagery
- Mission statement (200-300 words)
- Vision statement
- Core values and principles
- Impact metrics (funds raised, events hosted, volunteers engaged)

### 1.2 Leadership & Board
**Priority**: Medium
**Description**: Showcase PTO leadership and board members

**Requirements**:
- Board member profiles with photos
- Position titles and responsibilities
- Contact information for key roles
- Term lengths and election information

**Optional Features**:
- Committee structure
- Meeting schedules
- Board meeting minutes archive

### 1.3 FAQ Section
**Priority**: Medium
**Description**: Answer common questions about PTO participation

**Topics to Cover**:
- How to join/participate in PTO
- Membership benefits
- Volunteer opportunities
- How funds are used
- Meeting schedules
- Campus-specific information

---

## 2. Dynamic Calendar

### 2.1 Calendar Views
**Priority**: High
**Description**: Interactive event calendar with multiple view options

**Required Views**:
- Monthly view (default)
- Weekly view
- List view (upcoming events)
- Daily agenda view

**Features**:
- Color-coded by event type
- Campus filter (all campuses, Campus A, Campus B, Campus C)
- Grade level filter
- Event type filter (fundraising, meetings, student events, volunteer opportunities)
- Search functionality

### 2.2 Event Details
**Priority**: High

**Required Information**:
- Event title and description
- Date, time, and duration
- Location (campus, room, or virtual link)
- Target audience (grade levels, all parents)
- RSVP/registration if required
- Contact person
- Related documents or links

### 2.3 Calendar Integration
**Priority**: High

**Export Options**:
- Add to Google Calendar
- Add to Apple Calendar (iCal)
- Add to Outlook
- Download .ics file
- Subscribe to calendar feed

### 2.4 Admin Features
**Priority**: High

**Management Tools**:
- Add/edit/delete events
- Recurring event setup
- Bulk import from CSV
- Event templates
- Notification settings
- Approval workflow

---

## 3. Photo Gallery

### 3.1 Gallery Organization
**Priority**: High
**Description**: Visual archive of PTO and school events

**Structure**:
- Albums organized by:
  - School year (2024-2025, 2025-2026)
  - Event type (fundraisers, assemblies, campus events)
  - Campus
  - Month
- Nested album structure support
- Featured albums on homepage

### 3.2 Display Options
**Priority**: Medium

**View Modes**:
- Grid view (masonry or standard grid)
- Slideshow mode
- Lightbox for full-screen viewing
- Image metadata (date, event, photographer)
- Social sharing buttons

### 3.3 Upload & Management
**Priority**: High

**Admin Features**:
- Bulk upload (drag-and-drop)
- Image optimization and compression
- Tagging system (events, people, locations)
- Privacy settings (public/private albums)
- Download options (original, web-sized)
- Album cover image selection
- Sort by date, name, or custom order

**Technical Requirements**:
- Image optimization (WebP, responsive images)
- Lazy loading
- CDN delivery via Supabase Storage
- Maximum file size: 10MB per image
- Supported formats: JPG, PNG, WebP

---

## 4. Online Store

### 4.1 Product Catalog
**Priority**: High
**Description**: E-commerce section for spirit wear and merchandise

**Product Types**:
- Spirit wear (t-shirts, hoodies, hats)
- Academy-branded apparel
- Accessories (water bottles, bags, stickers)
- Seasonal items
- Limited edition releases

**Product Information**:
- Multiple product images (gallery)
- Size charts
- Color options
- Available sizes with inventory counts
- Product descriptions
- Pricing (including any bulk discounts)
- Care instructions

### 4.2 Shopping Experience
**Priority**: High

**Features**:
- Product grid with filtering and sorting
- Quick view modal
- Size and color selectors
- Add to cart functionality
- Shopping cart sidebar/page
- Save for later
- Wishlist (optional)

**Filters & Search**:
- Filter by category
- Filter by size
- Filter by price range
- Search by product name
- Sort by: newest, price (low-high), price (high-low), popularity

### 4.3 Checkout Process
**Priority**: High

**Requirements**:
- Secure checkout flow (Shopify or Stripe)
- Guest checkout option
- Account creation option
- Shipping information collection
- Shipping method selection (if applicable)
- Order notes field
- Promo code entry
- Order summary
- Payment processing (credit/debit cards)

**Order Fulfillment**:
- Order confirmation email
- Shipping tracking (if applicable)
- Campus pickup option (by campus, with date selection)
- Order status updates

### 4.4 Inventory Management
**Priority**: High

**Admin Features**:
- Stock tracking by size/color
- Low stock alerts
- Out of stock notifications to customers
- Bulk inventory updates
- Pre-order capability
- Product archive (discontinued items)

**Integration**:
- Shopify admin dashboard access
- Inventory sync across platforms
- Sales reporting

---

## 5. Donation System

### 5.1 Donation Interface
**Priority**: High
**Description**: Prominent, user-friendly donation feature

**Placement**:
- Persistent "Donate" button in header
- Homepage hero CTA
- Footer donation link
- Donation page (dedicated)
- In-context donation prompts (event pages, about page)

### 5.2 Donation Options
**Priority**: High

**Donation Types**:
- General PTO support
- Specific causes (dropdown or selection)
  - Playground fund
  - STEM programs
  - Arts & music
  - Field trips
  - Scholarships
  - Campus-specific projects
  - Teacher appreciation
- Event sponsorship
- In honor/memory of someone

**Donation Amounts**:
- Preset amounts ($25, $50, $100, $250, $500)
- Custom amount entry
- Suggested donation amount based on grade level (optional)

**Frequency**:
- One-time donation
- Monthly recurring
- Quarterly recurring
- Annual recurring

### 5.3 Donor Information
**Priority**: High

**Required Fields**:
- Full name
- Email address
- Phone number (optional)
- Student's name (optional)
- Student's grade (dropdown: PreK-12)
- Campus affiliation (dropdown)
- Anonymous donation checkbox

**Optional Fields**:
- Comments/special instructions
- Company name (for matching gifts)
- Tax receipt email

### 5.4 Payment Processing
**Priority**: High

**Requirements**:
- Stripe payment integration
- PCI compliance (handled by Stripe)
- Support for all major credit cards
- Digital wallet support (Apple Pay, Google Pay)
- Secure payment confirmation page
- Email receipt (instant)
- Donation tax receipt (annual summary option)

### 5.5 Donor Experience
**Priority**: Medium

**Features**:
- Real-time donation tracker/thermometer (optional)
- Donor recognition wall (if permission granted)
- Donation impact statements
- Thank you message after donation
- Follow-up email with PTO updates
- Donation history for logged-in users

**Reporting for PTO**:
- Donation dashboard
- Export donor data (CSV)
- Financial reports by:
  - Date range
  - Donation type
  - Campus
  - Grade level
- Recurring donation management
- Failed payment notifications

---

## 6. Additional Features

### 6.1 News & Announcements
**Priority**: Medium

**Features**:
- Blog-style news feed
- Categorized posts (news, announcements, spotlights)
- Featured posts on homepage
- Search and filter
- Email newsletter integration
- RSS feed

### 6.2 Volunteer Management
**Priority**: Medium

**Features**:
- Volunteer opportunity listings
- Sign-up forms with slots
- Volunteer hour tracking
- Committee sign-ups
- Event coordinator assignments
- Volunteer recognition

### 6.3 Membership Portal (Future Phase)
**Priority**: Low

**Features**:
- User accounts (parent login)
- Member directory (opt-in)
- Private document library
- Member-only events
- Communication preferences
- Saved payment methods

### 6.4 Contact & Communication
**Priority**: High

**Features**:
- Contact form (general inquiries)
- Board member email links
- Social media links
- Newsletter signup
- Office hours/contact information
- Campus-specific contacts

---

## Design & User Experience

### Design Inspiration
Reference websites for design direction:
- https://khanlabschool.org/ - Clean, modern, community-focused
- https://vistacharterpublicschools.org/ - Vibrant, engaging
- https://trees.org/ - Clear donation focus, impactful imagery

### Design Principles
- **Clean & Professional**: Modern design that reflects educational values
- **Welcoming**: Warm, inviting color palette
- **Accessible**: WCAG 2.1 AA compliance
- **Mobile-First**: Optimized for all devices
- **Fast**: Performance optimized (Core Web Vitals)
- **Intuitive**: Clear navigation and CTAs

### Brand Guidelines
**Logo**:
- Source: https://centneracademy.com/wp-content/uploads/2021/02/logo-centner.png
- PTO will use adapted version of Centner Academy logo

**Design Philosophy**:
- Clean, modern, professional aesthetic
- Warm and welcoming tone
- Educational and mission-focused
- Emphasis on community and values

**Visual Style** (inspired by Centner Academy):
- Clean white backgrounds
- Professional photography of students, events, and community
- Values-driven messaging
- Strong, clear calls-to-action
- Mission statement: "Cultivating Leaders with Heart"

**Color Palette** (to be extracted from Centner Academy brand):
- Primary: To be determined from official brand guidelines
- Secondary: Complementary colors that align with school branding
- Accent: Colors for CTAs and important elements

**Typography**:
- Clean, highly readable font families
- Professional sans-serif for headings
- Readable serif or sans-serif for body text
- Consistent hierarchy throughout

**Photography Style**:
- Authentic photos of PTO events and activities
- Students engaged in learning and community
- Diverse representation across all three campuses
- Natural lighting, candid moments
- Professional quality

### Key Pages Layout
1. **Homepage**
   - Hero with mission statement and donate CTA
   - Upcoming events preview
   - Latest news/announcements
   - Featured photo album
   - Quick links (calendar, store, volunteer)

2. **About Page**
   - Mission & vision
   - Board members
   - FAQ
   - How to get involved

3. **Calendar Page**
   - Interactive calendar
   - Upcoming events list
   - Filter/search controls

4. **Gallery Page**
   - Album grid
   - Featured photos
   - Event highlights

5. **Store Page**
   - Product grid
   - Featured products
   - Shopping cart

6. **Donation Page**
   - Donation form
   - Impact statements
   - Donor recognition (optional)

---

## Technical Requirements

### Performance
- **Page Load**: < 3 seconds (LCP)
- **Time to Interactive**: < 5 seconds
- **Core Web Vitals**: Pass all metrics
- **Lighthouse Score**: 90+ across all categories

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

### Accessibility
- **WCAG 2.1 Level AA** compliance
- Keyboard navigation support
- Screen reader compatible
- Proper heading hierarchy
- Alt text for all images
- Color contrast ratios
- Focus indicators
- Skip to main content link

### Security
- **SSL/TLS**: HTTPS everywhere
- **PCI Compliance**: Via Stripe/Shopify
- **Data Protection**: GDPR-ready, CCPA compliant
- **Authentication**: Secure admin access
- **Rate Limiting**: API protection
- **SQL Injection**: Prevented via Supabase
- **XSS Protection**: Input sanitization
- **CSRF Tokens**: Form protection

### SEO
- **Meta Tags**: Title, description, OG tags
- **Structured Data**: Schema.org markup
- **Sitemap**: XML sitemap
- **Robots.txt**: Proper indexing rules
- **Canonical URLs**: Prevent duplicate content
- **Performance**: Fast loading times
- **Mobile-Friendly**: Responsive design

### Analytics & Monitoring
- **Google Analytics 4**: User behavior tracking
- **Vercel Analytics**: Performance monitoring
- **Error Tracking**: Sentry or similar
- **Uptime Monitoring**: Vercel or external service
- **Form Analytics**: Conversion tracking

---

## User Roles & Permissions

### Public User (Not Logged In)
- View all public content
- Browse calendar, gallery, store
- Make donations
- Make purchases
- Submit contact forms
- Subscribe to newsletter

### Registered Parent (Future Phase)
- All public user permissions
- Access member-only content
- Save payment methods
- View donation history
- Manage communication preferences
- Volunteer sign-up history

### PTO Volunteer
- All parent permissions
- View volunteer schedules
- Access volunteer resources
- Edit limited content

### PTO Admin
- All volunteer permissions
- Manage all content (pages, news, events)
- Upload photos
- Manage calendar
- Manage store products (if not Shopify)
- View donation reports
- Manage user accounts
- Access analytics

### Super Admin / Developer
- Full system access
- Database access
- Deployment controls
- Integration management

---

## Success Metrics

### Engagement Metrics
- **Monthly Active Users**: Target 500+ (based on parent population)
- **Page Views**: 2,000+ per month
- **Average Session Duration**: 3+ minutes
- **Bounce Rate**: < 50%
- **Return Visitor Rate**: 40%+

### Conversion Metrics
- **Donation Conversion Rate**: 5-10% of visitors
- **Average Donation Amount**: $50-100
- **Store Conversion Rate**: 2-5%
- **Newsletter Signup Rate**: 15-20%
- **Event RSVP Rate**: 30%+ of page views

### Business Metrics
- **Monthly Donations**: Track growth month-over-month
- **Store Revenue**: Track sales by product category
- **Volunteer Sign-ups**: Track engagement trends
- **Email Open Rates**: 25%+ for newsletters

### Technical Metrics
- **Page Load Time**: < 3 seconds
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%
- **Mobile Traffic**: 60%+ of total traffic

---

## Project Timeline

### Phase 1: Discovery & Planning (2 weeks)
- Finalize requirements
- Content gathering
- Design mockups
- Technical architecture
- Stakeholder approval

### Phase 2: Design (2-3 weeks)
- Homepage design
- Inner page templates
- Mobile responsive designs
- Component library
- Brand guidelines application

### Phase 3: Development - Core (4-5 weeks)
- Next.js setup
- Supabase configuration
- About section
- News/announcements
- Contact forms
- Basic admin panel

### Phase 4: Development - Features (4-5 weeks)
- Dynamic calendar
- Photo gallery
- Store integration (Shopify/Stripe)
- Donation system
- Email integrations

### Phase 5: Testing & QA (2 weeks)
- Cross-browser testing
- Mobile testing
- Accessibility audit
- Performance optimization
- Security testing
- User acceptance testing

### Phase 6: Content Migration & Launch Prep (1-2 weeks)
- Content population
- Photo uploads
- Product setup
- Admin training
- Final review

### Phase 7: Launch (1 week)
- DNS setup
- SSL configuration
- Go-live
- Monitoring setup
- Post-launch support

### Phase 8: Post-Launch (Ongoing)
- Bug fixes
- Performance monitoring
- Feature enhancements
- Content updates
- Regular maintenance

**Total Estimated Timeline**: 16-20 weeks (4-5 months)

---

## Stakeholders

### Primary Stakeholders
- **PTO Board Members**: Decision makers, content managers
- **School Administration**: Approval authority, communication coordination
- **Parents**: Primary users, donors, customers

### Secondary Stakeholders
- **Web Development Team**: Builders and maintainers
- **Graphic Designer**: Brand and visual design
- **Payment Processors**: Stripe, Shopify support
- **Hosting Providers**: Vercel, Supabase

### Communication Plan
- **Weekly Status Meetings**: During development phases
- **Milestone Reviews**: After each phase
- **Demo Sessions**: At key deliverable points
- **Launch Communications**: Email, social media, school announcements

---

## Risks & Mitigation

### Technical Risks
1. **Payment Integration Issues**
   - Mitigation: Early testing, use established platforms (Stripe, Shopify)

2. **Performance Issues with Large Photo Gallery**
   - Mitigation: Image optimization, lazy loading, CDN

3. **Calendar Sync Problems**
   - Mitigation: Standard iCal format, thorough testing

### Business Risks
1. **Low User Adoption**
   - Mitigation: Training sessions, communication campaign, intuitive design

2. **Content Management Burden**
   - Mitigation: Easy-to-use admin panel, training, documentation

3. **Budget Overruns**
   - Mitigation: Clear scope, phased approach, regular budget reviews

### Compliance Risks
1. **PCI Compliance**
   - Mitigation: Use Stripe/Shopify (PCI-compliant by design)

2. **Privacy Regulations**
   - Mitigation: Privacy policy, opt-in controls, secure data handling

3. **Accessibility Compliance**
   - Mitigation: WCAG guidelines, accessibility audit

---

## Dependencies

### Content Dependencies
- PTO mission, vision, and about content
- Board member bios and photos
- Product photos and descriptions
- Historical event photos
- Brand guidelines and logo files

### Technical Dependencies
- Supabase account and project setup
- Stripe account for donations
- Shopify account for store (if chosen)
- Domain name registration
- Vercel account for hosting
- Google Analytics account
- Email service provider account (SendGrid/Resend)

### Third-Party Services
- Payment processing (Stripe)
- E-commerce (Shopify, if chosen)
- Database & storage (Supabase)
- Hosting & CDN (Vercel)
- Email delivery (SendGrid/Resend)
- Analytics (Google Analytics)

---

## Future Enhancements (Post-Launch)

### Phase 2 Features
- Member portal with authentication
- Private document library
- Event RSVP with guest management
- Volunteer hour tracking system
- Email campaign management
- Mobile app (React Native)

### Integration Ideas
- School information system integration
- Parent communication platform (ClassDojo, ParentSquare)
- Social media auto-posting
- Email marketing platform (Mailchimp, Constant Contact)
- Accounting software (QuickBooks) for donations

### Advanced Features
- Matching gift automation
- Peer-to-peer fundraising campaigns
- Grant application portal
- Budget transparency dashboard
- Impact reporting (dollars → outcomes)

---

## Approval

**Prepared By**: [Development Team]
**Review Date**: October 14, 2025
**Approved By**: [PTO Board President]
**Approval Date**: ___________

**Signatures**:

________________________
PTO Board President

________________________
School Principal

________________________
Project Lead

---

## Document Control

**Version History**:

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 14, 2025 | Development Team | Initial draft |

**Related Documents**:
- Technical Architecture Document
- Budget & Cost Breakdown
- Design System Guide
- API Documentation
- Admin User Guide
