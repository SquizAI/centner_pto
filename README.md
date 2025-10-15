# Centner Academy PTO Website

Official website for the Centner Academy Parent Teacher Organization, supporting students across all three campuses in Miami, Florida.

**Status**: Planning Phase
**Version**: 1.0.0
**Last Updated**: October 14, 2025

---

## Project Overview

This repository contains the planning, documentation, and (future) source code for the Centner Academy PTO website. The website will serve as the central digital hub for parent engagement, event coordination, fundraising, and community building.

### Mission

The Centner Academy Parent Teacher Organization (PTO) is a nonprofit organization dedicated to supporting the school's mission of providing a high-quality education to its students. The PTO's work is centered on enhancing the student experience and strengthening the school community through events, fundraising, and parent engagement across all three campuses.

### Key Features

- **About Section**: Mission, vision, board members, and FAQ
- **Dynamic Calendar**: Interactive event calendar with RSVP functionality
- **Photo Gallery**: Event photos organized by albums and years
- **Online Store**: Spirit wear and Academy merchandise
- **Donation System**: Secure online donations (one-time and recurring)
- **News & Announcements**: Blog-style updates and spotlights
- **Volunteer Management**: Opportunities and sign-ups

---

## Technology Stack

### Frontend
- **Next.js 15+**: React framework with App Router
- **React 19+**: Server Components & Client Components
- **TypeScript**: Type-safe development
- **Tailwind CSS 4.x**: Utility-first styling
- **shadcn/ui**: Accessible component library

### Backend
- **Supabase**: PostgreSQL database, authentication, storage, realtime
- **Next.js Server Actions**: Server-side mutations
- **API Routes**: Webhook handlers

### E-Commerce & Payments
- **Shopify**: E-commerce platform (primary option)
- **Stripe**: Payment processing for donations and store (alternative)

### Deployment
- **Vercel**: Hosting and deployment
- **Vercel Edge Network**: CDN for global performance

### Additional Services
- **Resend**: Transactional email delivery
- **Google Analytics**: Usage analytics

---

## Project Structure

```
centner-pto-website/
├── docs/                      # All project documentation
│   ├── prd/                   # Product Requirements Document
│   │   └── PRD.md            # Comprehensive PRD
│   ├── architecture/          # Technical documentation
│   │   └── TECHNICAL_ARCHITECTURE.md
│   ├── budget/                # Cost and budget planning
│   │   └── COST_BREAKDOWN.md
│   ├── design/                # Design documentation
│   │   └── BRAND_GUIDELINES.md
│   └── meeting-notes/         # Meeting notes and decisions
│
├── assets/                    # Project assets
│   ├── inspiration/           # Design inspiration screenshots
│   └── logos/                 # Logo files
│
├── src/                       # Source code (future)
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── lib/                   # Utilities and helpers
│   └── styles/                # Global styles
│
├── config/                    # Configuration files
│   ├── supabase/              # Database schemas and migrations
│   └── env.example            # Environment variable template
│
└── README.md                  # This file
```

---

## Documentation

### Core Documents

1. **[Product Requirements Document (PRD)](./docs/prd/PRD.md)**
   - Complete feature specifications
   - User stories and acceptance criteria
   - Success metrics
   - Project timeline

2. **[Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md)**
   - System architecture and design
   - Database schema
   - API specifications
   - Security considerations

3. **[Brand Guidelines](./docs/design/BRAND_GUIDELINES.md)**
   - Visual identity standards
   - Logo usage
   - Color palette
   - Typography
   - Component design patterns

4. **[Cost Breakdown](./docs/budget/COST_BREAKDOWN.md)**
   - Development costs
   - Infrastructure costs
   - Transaction fees
   - Maintenance estimates
   - ROI analysis

---

## Getting Started

### Phase 1: Planning (Current)

**Status**: ✅ Complete

**Deliverables**:
- [x] Product Requirements Document
- [x] Technical Architecture
- [x] Brand Guidelines
- [x] Cost Breakdown
- [ ] Content Strategy
- [ ] Asset Collection (logos, photos)

**Next Steps**:
1. Review and approve documentation
2. Finalize budget and funding
3. Select development partner
4. Kick off design phase

---

### Phase 2: Design (Upcoming)

**Duration**: 2-3 weeks
**Status**: Not Started

**Deliverables**:
- Homepage design (desktop + mobile)
- Inner page templates
- Component library
- Design system in Figma
- Style guide

**Prerequisites**:
- Approved PRD
- Budget allocation
- Development team selected
- Brand assets collected

---

### Phase 3: Development (Future)

**Duration**: 8-10 weeks
**Status**: Not Started

**Milestone 1: Core Setup**
- Next.js application scaffold
- Supabase integration
- Authentication system
- Basic pages and navigation

**Milestone 2: Content Features**
- Event calendar
- News/announcements
- Photo gallery
- Contact forms

**Milestone 3: Commerce & Donations**
- Shopify/Stripe integration
- Donation system
- Shopping cart and checkout
- Payment webhooks

**Milestone 4: Testing & Launch**
- QA testing
- Performance optimization
- Content population
- Go-live

---

## Development Setup (Future)

When development begins, this section will contain instructions for local setup.

### Prerequisites
```bash
- Node.js 20.x or later
- npm or pnpm
- Git
- Supabase account
- Stripe account (test mode)
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd centner-pto-website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Shopify (if using)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=...

# Email
RESEND_API_KEY=re_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Design Inspiration

The website design is inspired by:
- [Centner Academy](https://centneracademy.com/) - Brand consistency
- [Khan Lab School](https://khanlabschool.org/) - Clean, modern aesthetic
- [Vista Charter Public Schools](https://vistacharterpublicschools.org/) - Vibrant, engaging layout
- [Trees.org](https://trees.org/) - Donation-focused design

### Design Principles
- Clean and professional
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA compliance)
- Fast loading times
- Clear calls-to-action
- Centner Academy brand alignment

---

## Key Stakeholders

### PTO Board
- Primary decision makers
- Content approval authority
- Budget owners

### School Administration
- Final approval authority
- Communication coordination
- Brand governance

### Parents & Community
- Primary users
- Donors and customers
- Volunteers

### Development Team
- Technical implementation
- Ongoing maintenance
- Support and updates

---

## Timeline & Milestones

### Q4 2025 (Oct - Dec)
- [x] Planning and documentation (Week 1-2)
- [ ] Budget approval (Week 3)
- [ ] Vendor selection (Week 4)
- [ ] Design phase (Week 5-7)
- [ ] Development kickoff (Week 8)

### Q1 2026 (Jan - Mar)
- [ ] Core development (Week 1-5)
- [ ] Feature development (Week 6-10)
- [ ] Testing and QA (Week 11-12)

### Q2 2026 (Apr - Jun)
- [ ] Content migration (Week 1-2)
- [ ] User acceptance testing (Week 3)
- [ ] Launch preparation (Week 4)
- [ ] Go-live (Week 5)
- [ ] Post-launch support (Week 6-8)

**Estimated Launch**: May 2026

---

## Budget Summary

### Year 1 Costs

| Category | Amount |
|----------|--------|
| **Development** (one-time) | $18,000 - $22,000 |
| **Infrastructure** (annual) | $1,260 |
| **Maintenance** (annual) | $3,000 - $4,000 |
| **Transaction Fees** (variable) | ~$1,000 - $2,000 |
| **Year 1 Total** | $23,260 - $29,260 |

### Year 2+ Costs

| Category | Amount |
|----------|--------|
| **Infrastructure** (annual) | $1,260 |
| **Maintenance** (annual) | $3,000 - $4,000 |
| **Transaction Fees** (variable) | ~$1,000 - $2,000 |
| **Annual Total** | $5,260 - $7,260 |

See [Cost Breakdown](./docs/budget/COST_BREAKDOWN.md) for detailed analysis.

---

## Success Metrics

### Engagement
- Monthly active users: 500+
- Average session duration: 3+ minutes
- Return visitor rate: 40%+

### Conversions
- Donation conversion rate: 5-10%
- Event RSVP rate: 30%+
- Newsletter signup rate: 15-20%

### Revenue
- Year-over-year donation increase: 20-40%
- Merchandise sales: Track growth
- Recurring donors: 15% of total donors

### Technical
- Page load time: < 3 seconds
- Uptime: 99.9%
- Lighthouse score: 90+
- Mobile traffic: 60%+

---

## Contributing

### For PTO Board Members
- Review and provide feedback on documentation
- Collect and provide content (photos, text, bios)
- Test the website during development
- Share with parents and community

### For Developers (Future)
- Follow coding standards and guidelines
- Write tests for new features
- Submit pull requests for review
- Update documentation

### For Community Members
- Report bugs or issues
- Suggest features or improvements
- Participate in user testing
- Share feedback

---

## Support & Contact

### Project Management
**Email**: [To be assigned]
**Meeting Schedule**: Bi-weekly during development

### Technical Support (Future)
**Email**: [To be assigned]
**Response Time**: 24-48 hours
**Emergency**: [To be assigned]

### PTO General Inquiries
**Website**: [centneracademy.com](https://centneracademy.com/)
**Email**: [PTO contact]
**Phone**: (305) 576-6070

---

## License

This project is proprietary and confidential. All rights reserved by Centner Academy Parent Teacher Organization.

**Restrictions**:
- Source code may not be copied or reused
- Documentation may not be shared publicly
- Designs and branding are protected
- Development for Centner Academy PTO use only

---

## Acknowledgments

### Design Inspiration
- Centner Academy brand team
- Reference websites: Khan Lab School, Vista Charter, Trees.org

### Technology Partners
- **Vercel**: Next.js hosting and deployment
- **Supabase**: Backend infrastructure
- **Stripe**: Payment processing
- **Shopify**: E-commerce platform

### Development Team
- [To be determined]

---

## Changelog

### Version 1.0.0 (October 14, 2025)
- Initial project documentation
- Product Requirements Document
- Technical Architecture
- Brand Guidelines
- Cost Breakdown
- Project structure and setup

---

## Next Steps

1. **Review Documentation**
   - PTO board reviews all documents
   - Provide feedback and approval
   - Finalize requirements

2. **Budget Approval**
   - Present cost breakdown to board
   - Determine funding strategy
   - Approve budget allocation

3. **Vendor Selection**
   - RFP to development agencies (if applicable)
   - Interview and select partner
   - Sign contract and SOW

4. **Design Kickoff**
   - Provide brand assets and content
   - Participate in discovery workshops
   - Review and approve designs

5. **Development Begins**
   - Attend regular status meetings
   - Provide timely feedback
   - Prepare content for migration

---

## Questions?

For questions about this project, please contact:
- **PTO Board**: [Contact information]
- **Project Lead**: [To be assigned]
- **Technical Lead**: [To be assigned]

---

**Built with ❤️ for the Centner Academy community**

**Motto**: *Cultivating Leaders with Heart*
