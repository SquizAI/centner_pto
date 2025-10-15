# Cost Breakdown & Budget Estimate
## Centner Academy PTO Website

**Version:** 1.0
**Last Updated:** October 14, 2025
**Currency:** USD
**Billing Cycle:** Monthly (unless noted)

---

## Executive Summary

This document provides a comprehensive breakdown of all costs associated with building, launching, and maintaining the Centner Academy PTO website. Costs are divided into one-time development expenses and recurring operational costs.

### Total Cost Overview

| Category | One-Time Cost | Monthly Cost | Annual Cost |
|----------|---------------|--------------|-------------|
| **Development** | $15,000 - $25,000 | - | - |
| **Infrastructure** | $0 | $45 - $125 | $540 - $1,500 |
| **Transaction Fees** | - | Variable | Variable |
| **Maintenance** | - | $200 - $500 | $2,400 - $6,000 |
| **TOTAL (Year 1)** | $15,000 - $25,000 | $245 - $625 | $2,940 - $7,500 |

**Total First Year**: $17,940 - $32,500
**Ongoing Annual (Year 2+)**: $2,940 - $7,500

---

## 1. Development Costs (One-Time)

### Phase 1: Discovery & Planning
**Duration**: 2 weeks
**Cost**: $2,000 - $3,500

**Deliverables**:
- Requirements gathering and analysis
- Content audit and planning
- Technical architecture document
- Project timeline and milestones
- Stakeholder alignment meetings

**Breakdown**:
- Project management: $500 - $1,000
- Business analysis: $800 - $1,200
- Technical planning: $700 - $1,300

---

### Phase 2: Design
**Duration**: 2-3 weeks
**Cost**: $3,000 - $5,000

**Deliverables**:
- Homepage design (desktop + mobile)
- 5-7 inner page templates
- Component library
- Style guide and brand application
- Design mockups (Figma)

**Breakdown**:
- UI/UX design: $2,000 - $3,500
- Brand integration: $500 - $800
- Design revisions: $500 - $700

---

### Phase 3: Core Development
**Duration**: 4-5 weeks
**Cost**: $6,000 - $9,000

**Deliverables**:
- Next.js application setup
- Supabase integration
- Authentication system
- About/News sections
- Contact forms
- Basic admin panel
- Responsive implementation

**Breakdown**:
- Frontend development: $3,000 - $4,500
- Backend development: $2,000 - $3,000
- Database setup: $500 - $800
- Authentication: $500 - $700

---

### Phase 4: Feature Development
**Duration**: 4-5 weeks
**Cost**: $4,000 - $7,500

**Deliverables**:
- Dynamic calendar system
- Photo gallery with upload
- E-commerce integration (Shopify or Stripe)
- Donation system
- Email integration
- Volunteer management

**Breakdown**:
- Calendar implementation: $800 - $1,200
- Gallery system: $1,000 - $1,500
- E-commerce integration: $1,200 - $2,500
- Donation system: $1,000 - $2,000
- Email integration: $500 - $800

---

### Phase 5: Testing & Launch
**Duration**: 2-3 weeks
**Cost**: $1,000 - $2,000

**Deliverables**:
- Quality assurance testing
- Cross-browser testing
- Mobile testing
- Performance optimization
- Security audit
- Content population
- Admin training
- Launch support

**Breakdown**:
- QA and testing: $500 - $800
- Performance optimization: $300 - $600
- Training and documentation: $200 - $600

---

### Development Cost Summary

| Complexity Level | Total Cost | Timeline |
|-----------------|------------|----------|
| **Basic** (Stripe store, limited features) | $15,000 - $18,000 | 14-16 weeks |
| **Standard** (Shopify store, all features) | $18,000 - $22,000 | 16-18 weeks |
| **Premium** (Custom features, advanced integrations) | $22,000 - $25,000 | 18-20 weeks |

**Payment Terms** (Typical):
- 30% upfront ($4,500 - $7,500)
- 40% at milestone completion ($6,000 - $10,000)
- 30% upon launch ($4,500 - $7,500)

---

## 2. Infrastructure & Hosting Costs (Recurring)

### Core Hosting (Vercel)

**Hobby Plan** - $0/month
- ✅ Suitable for development/staging
- ✅ Unlimited deployments
- ✅ HTTPS/SSL included
- ✅ 100GB bandwidth
- ❌ Limited for production with custom domain

**Pro Plan** - $20/month ($240/year)
- ✅ Recommended for production
- ✅ Custom domains
- ✅ Advanced analytics
- ✅ Team collaboration
- ✅ 1TB bandwidth
- ✅ Edge functions
- ✅ Priority support

**Enterprise Plan** - Custom pricing (typically $100+/month)
- ✅ SLA guarantees
- ✅ Dedicated support
- ✅ Advanced security features
- ❌ Likely overkill for PTO needs

**Recommended**: **Pro Plan** ($20/month)

---

### Database & Backend (Supabase)

**Free Tier** - $0/month
- ✅ Suitable for development
- 500MB database space
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- 500MB Edge Function invocations

**Pro Plan** - $25/month ($300/year)
- ✅ Recommended for production
- 8GB database space
- 100GB file storage
- 250GB bandwidth
- 100,000 monthly active users
- 2GB Edge Function invocations
- Daily backups
- 7-day log retention
- Email support

**Team Plan** - $599/month
- ❌ Overkill for PTO needs

**Recommended**: **Pro Plan** ($25/month)
**Estimated Cost**: $25/month ($300/year)

**Note**: Photo storage may require additional storage ($0.021/GB/month beyond 100GB)

---

### Domain Name

**Cost**: $12 - $20/year

**Options**:
- centnerpto.org (recommended) - ~$12/year
- centneracademypto.org - ~$12/year
- centnerpto.com - ~$15/year

**Includes**:
- Domain registration
- DNS management
- WHOIS privacy

**Provider**: Namecheap, Google Domains, or Cloudflare

---

### Email Service (Resend or SendGrid)

#### Resend

**Free Tier** - $0/month
- 3,000 emails/month
- 100 emails/day
- ✅ Suitable for light use

**Pro Plan** - $20/month ($240/year)
- 50,000 emails/month
- No daily limit
- Dedicated IP (optional)
- ✅ Recommended for regular newsletters

#### SendGrid

**Free Tier** - $0/month
- 100 emails/day
- Limited features

**Essentials Plan** - $19.95/month
- 50,000 emails/month
- Email API
- Email validation

**Recommended**: **Resend Free** initially, upgrade to **Pro** ($20/month) if email volume increases

---

### E-Commerce Platform

#### Option 1: Shopify

**Basic Plan** - $39/month ($468/year)
- ✅ Recommended for full store
- Unlimited products
- 2 staff accounts
- Abandoned cart recovery
- Gift cards
- Discount codes
- Inventory management
- 2.9% + 30¢ per online transaction

**Shopify Plan** - $105/month ($1,260/year)
- 5 staff accounts
- Professional reports
- Lower transaction fees (2.6% + 30¢)
- ❌ Likely unnecessary

**Plus** - $2,000/month
- ❌ Enterprise only

**Recommended**: **Basic Plan** ($39/month) if using Shopify

#### Option 2: Stripe Products Only - $0/month
- No monthly fee
- Transactions fees apply (2.9% + 30¢)
- ✅ Better for simple merchandise
- Less feature-rich than Shopify

**Recommendation**:
- If selling >20 products with variants/inventory = **Shopify** ($39/month)
- If selling <10 simple items = **Stripe only** ($0/month)

---

### SSL Certificate

**Cost**: $0 (Included with Vercel)

Vercel automatically provisions and renews SSL certificates for all domains.

---

### Infrastructure Cost Summary

| Service | Basic Setup | Standard Setup |
|---------|-------------|----------------|
| **Vercel Hosting** | $20/month | $20/month |
| **Supabase Database** | $25/month | $25/month |
| **Domain Name** | $1/month | $1/month |
| **Email Service** | $0/month | $20/month |
| **E-Commerce** | $0/month (Stripe) | $39/month (Shopify) |
| **SSL Certificate** | $0 (included) | $0 (included) |
| **TOTAL Monthly** | **$46/month** | **$105/month** |
| **TOTAL Annual** | **$552/year** | **$1,260/year** |

---

## 3. Transaction Fees (Variable)

### Payment Processing (Stripe)

**Standard Rates**:
- Online payments: **2.9% + $0.30** per transaction
- International cards: Additional **1.5%**
- Currency conversion: **1%**

**Example Donation Costs**:
| Donation Amount | Stripe Fee | Net to PTO |
|-----------------|------------|------------|
| $25 | $1.03 | $23.97 |
| $50 | $1.75 | $48.25 |
| $100 | $3.20 | $96.80 |
| $250 | $7.55 | $242.45 |
| $500 | $14.80 | $485.20 |

**Annual Fee Estimates** (Based on donation volume):
- $10,000 in donations: ~$320 in fees
- $25,000 in donations: ~$755 in fees
- $50,000 in donations: ~$1,480 in fees
- $100,000 in donations: ~$2,950 in fees

### Shopify Transaction Fees (If using Shopify + Stripe)

**Shopify Basic Plan**: 2.9% + 30¢ (Shopify Payments)
- If using external payment processor (Stripe): Additional 2% fee

**To minimize fees**: Use Shopify Payments (powered by Stripe)

**Example Store Purchase**:
| Purchase Amount | Shopify Fee | Net to PTO |
|-----------------|-------------|------------|
| $25 (T-shirt) | $1.03 | $23.97 |
| $50 (Hoodie) | $1.75 | $48.25 |
| $100 (Bundle) | $3.20 | $96.80 |

**Annual Fee Estimates** (Based on merch sales):
- $5,000 in sales: ~$165 in fees
- $10,000 in sales: ~$320 in fees
- $20,000 in sales: ~$630 in fees

---

## 4. Ongoing Maintenance Costs

### Monthly Maintenance Retainer

**Option 1: Self-Managed** - $0/month
- PTO board members manage content
- Minimal technical support needed
- Best for: Tech-savvy teams
- Risk: Technical issues may require external help

**Option 2: Light Support** - $200 - $300/month
- 4-6 hours/month of developer time
- Content updates and minor changes
- Bug fixes
- Monthly check-ins
- Best for: Most PTOs

**Option 3: Full Support** - $400 - $500/month
- 8-10 hours/month of developer time
- Content updates and changes
- Feature enhancements
- Ongoing optimization
- Priority support
- Best for: High-traffic or complex needs

**Typical Activities**:
- Content updates (news, events)
- Photo uploads and album creation
- Minor design adjustments
- Performance monitoring
- Security updates
- Bug fixes
- Feature requests
- Technical support

**Recommended**: **Light Support** ($200 - $300/month) for first year

---

### Annual Maintenance Tasks

**Cost**: $500 - $1,000/year (one-time)

**Activities**:
- Dependency updates
- Security patches
- Performance audit
- Database optimization
- Backup verification
- Analytics review
- Accessibility audit
- SEO review

**Typically performed**: Once per year (Q4)

---

### Emergency Support

**Hourly Rate**: $100 - $150/hour
**Response Time**: 24-48 hours

**Typical Issues**:
- Payment processing failures
- Site downtime
- Security incidents
- Critical bug fixes

**Budget**: $500 - $1,000/year reserve recommended

---

## 5. Optional/Add-On Costs

### Advanced Analytics

**Google Analytics 4** - $0/month
- ✅ Included in recommendation
- Free tier sufficient for PTO needs

**Vercel Analytics** - Included with Pro Plan
- Real User Monitoring
- Web Vitals tracking

**Mixpanel/Amplitude** - $0 - $50/month
- Advanced user analytics
- ❌ Likely unnecessary

---

### Error Monitoring (Sentry)

**Free Tier** - $0/month
- 5,000 events/month
- ✅ Sufficient for development

**Team Plan** - $26/month
- 50,000 events/month
- Advanced features
- Optional for production

---

### CDN Enhancement

**Cloudflare Pro** - $20/month (optional)
- Enhanced DDoS protection
- Advanced caching
- Web Application Firewall (WAF)
- ❌ Likely unnecessary (Vercel includes CDN)

---

### Backup Service (Additional)

**Supabase Backups** - Included in Pro plan
- Daily automatic backups
- 7-day retention

**Extended Backup Retention** - $0.12/GB/month
- Optional longer retention
- Typically unnecessary

---

### Premium Support

**Vercel Priority Support** - Included with Pro
**Supabase Email Support** - Included with Pro
**Shopify Support** - Included with plan
**Stripe Support** - Free

**Dedicated Support Packages**: $500 - $2,000/month
- ❌ Unnecessary for PTO

---

## 6. Cost Comparison Scenarios

### Scenario A: Minimal Setup
**Best for**: Simple merch store, low traffic

**One-Time**:
- Development: $15,000
- **Total**: $15,000

**Monthly**:
- Vercel Pro: $20
- Supabase Pro: $25
- Domain: $1
- Email (Free tier): $0
- Store (Stripe only): $0
- **Total**: $46/month ($552/year)

**Year 1 Total**: $15,552
**Year 2+ Annual**: $552

---

### Scenario B: Standard Setup
**Best for**: Full-featured site, Shopify store, moderate traffic

**One-Time**:
- Development: $20,000
- **Total**: $20,000

**Monthly**:
- Vercel Pro: $20
- Supabase Pro: $25
- Domain: $1
- Email (Resend Pro): $20
- Store (Shopify Basic): $39
- Maintenance: $250
- **Total**: $355/month ($4,260/year)

**Year 1 Total**: $24,260
**Year 2+ Annual**: $4,260

---

### Scenario C: Premium Setup
**Best for**: High traffic, advanced features, ongoing development

**One-Time**:
- Development: $25,000
- **Total**: $25,000

**Monthly**:
- Vercel Pro: $20
- Supabase Pro: $25
- Domain: $1
- Email (Resend Pro): $20
- Store (Shopify): $39
- Maintenance: $500
- Sentry: $26
- **Total**: $631/month ($7,572/year)

**Year 1 Total**: $32,572
**Year 2+ Annual**: $7,572

---

## 7. Cost Optimization Strategies

### Short-Term (Year 1)

**1. Use Free Tiers Initially**
- Start with Resend free tier (3,000 emails/month)
- Monitor usage, upgrade only when needed
- **Savings**: $240/year

**2. Stripe-Only Store**
- If merchandise is simple, skip Shopify
- Use Stripe Product Catalog + Checkout
- **Savings**: $468/year

**3. Self-Manage Content**
- Train PTO volunteers to manage content
- Reduce maintenance retainer
- **Savings**: $1,200 - $2,400/year

**4. Staged Feature Rollout**
- Launch with essential features only
- Add gallery, volunteer portal in Phase 2
- **Savings**: $2,000 - $4,000 in dev costs

**Potential Year 1 Savings**: $3,900 - $7,100

---

### Long-Term (Year 2+)

**1. Annual Billing**
- Pay for services annually (often 10-20% discount)
- **Savings**: $50 - $100/year

**2. Bundle Services**
- Use Vercel Pro + Supabase Pro only
- Eliminate redundant services
- **Savings**: Variable

**3. Negotiate Rates**
- Negotiate with development team for ongoing work
- Volume discounts on transaction fees (if possible)
- **Savings**: 10-20% on maintenance

**4. Optimize Storage**
- Compress images before upload
- Archive old photos to cheaper storage
- **Savings**: $50 - $200/year

**Potential Annual Savings**: $100 - $400/year

---

## 8. Payment & Billing Schedule

### Development (One-Time)

**Milestone-Based Payments**:

| Milestone | Deliverable | Payment | Timing |
|-----------|-------------|---------|--------|
| **Contract Signing** | SOW agreement | 30% | Week 0 |
| **Design Approval** | Approved mockups | 20% | Week 4 |
| **Alpha Launch** | Functional site on staging | 20% | Week 12 |
| **Launch** | Live production site | 30% | Week 16 |

---

### Recurring Services

**Monthly Billing** (Auto-renew):
- Vercel Pro: Charged 1st of month
- Supabase Pro: Charged 1st of month
- Shopify: Charged 1st of month
- Resend/SendGrid: Charged 1st of month

**Annual Billing**:
- Domain: Renewed annually
- Optional: Pre-pay Vercel/Supabase annually for discount

**Variable Billing**:
- Stripe fees: Deducted from each transaction
- Shopify fees: Deducted from each sale
- Maintenance: Invoiced monthly

---

## 9. Budget Planning Template

### Year 1 Budget (Sample)

```
DEVELOPMENT (One-Time)
  Discovery & Planning             $2,500
  Design                           $4,000
  Core Development                 $7,500
  Feature Development              $5,500
  Testing & Launch                 $1,500
                          Total:  $21,000

INFRASTRUCTURE (Annual)
  Hosting (Vercel Pro)              $240
  Database (Supabase Pro)           $300
  Domain Registration                $12
  Email Service (Resend Pro)        $240
  E-Commerce (Shopify Basic)        $468
                          Total:  $1,260

MAINTENANCE (Annual)
  Monthly Retainer ($250/mo)      $3,000
  Annual Audit/Updates              $750
  Emergency Fund                    $500
                          Total:  $4,250

TRANSACTION FEES (Estimated)
  Stripe Fees (on $30K donations) $1,000
  Shopify Fees (on $10K sales)      $320
                          Total:  $1,320

YEAR 1 TOTAL                     $27,830
```

### Year 2+ Budget (Sample)

```
INFRASTRUCTURE (Annual)           $1,260
MAINTENANCE (Annual)              $4,250
TRANSACTION FEES (Estimated)      $1,320

YEAR 2 TOTAL                      $6,830
```

---

## 10. Funding Recommendations

### Cost Recovery Strategies

**1. Include Website Costs in Annual Budget**
- Transparent line item in PTO budget
- Approved by board and members

**2. Specific Fundraising**
- "Technology Fund" donation category
- Appeal to tech-minded parents
- Corporate sponsorship opportunities

**3. Store Revenue**
- Allocate percentage of merch sales to website fund
- Self-sustaining model

**4. Donation Fee Coverage**
- Option for donors to cover transaction fees
- Add 3% to donation amount
- Common practice for nonprofits

**5. Sponsorship Recognition**
- "Website Sponsor" recognition level
- Logo placement for major sponsors
- $2,500 - $5,000 sponsorship tier

---

## 11. ROI Considerations

### Expected Benefits

**Increased Donations**:
- Convenient online giving = higher participation
- Recurring donation options = predictable revenue
- Expected increase: 20-40% in donation volume

**Improved Engagement**:
- Higher event attendance through better promotion
- More volunteer sign-ups
- Stronger community connection

**Operational Efficiency**:
- Reduced admin time for event management
- Automated donation receipts
- Centralized communication

**Merchandise Revenue**:
- Online store available 24/7
- Broader reach beyond campus events
- Professional branding = higher perceived value

### Break-Even Analysis

**Scenario**: Standard setup ($24,260 Year 1)

**If website generates**:
- Additional $1,000/month in donations ($12,000/year)
- Additional $500/month in merch sales ($6,000/year)
- **Total**: $18,000/year additional revenue

**Break-even**: Within 18 months
**Year 2 ROI**: $18,000 revenue - $6,830 costs = $11,170 net benefit

---

## 12. Frequently Asked Questions

### Can we reduce development costs?

**Yes, options include**:
- Using a template/starter kit ($5,000 - $10,000 savings)
- Phased rollout (launch with fewer features)
- Volunteer development (if skilled parents available)
- **Trade-offs**: Less customization, longer timeline, potential quality issues

### Why can't we use free hosting?

**You can, but**:
- Free plans have limitations (bandwidth, features)
- Unprofessional for donation processing
- Lack of support when issues arise
- **Pro plans ensure reliability and scalability**

### What about using WordPress/Wix/Squarespace?

**Possible, but**:
- Less flexible for custom features
- Ongoing plugin costs can add up
- Performance limitations
- Security concerns
- Harder to integrate with Stripe/Supabase
- **Next.js provides better long-term value**

### Can we get discounts from providers?

**Nonprofit discounts available**:
- Some services offer nonprofit pricing
- Request when signing up
- Provide 501(c)(3) documentation
- **Potential savings: 10-30% on some services**

### What if traffic spikes during major events?

**Vercel and Supabase scale automatically**:
- No downtime or performance issues
- Pay only for usage beyond plan limits
- Typical spike: $0 - $50 additional cost
- **Budget recommendation: $100/month buffer in peak months**

### How do we handle payment disputes?

**Stripe handles all disputes**:
- Integrated dispute management
- Email notifications
- Evidence submission process
- **No additional fees for PTO (Stripe covers)**

---

## 13. Summary & Recommendations

### Recommended Setup for Centner PTO

**Development**: Standard package ($18,000 - $22,000)
- Full-featured website
- Shopify integration
- Professional design
- Comprehensive testing

**Infrastructure**: Standard tier ($105/month)
- Vercel Pro hosting
- Supabase Pro database
- Shopify Basic store
- Resend Pro email
- Custom domain

**Maintenance**: Light support ($250/month)
- Monthly updates and changes
- Bug fixes and optimization
- Technical support

**Total Year 1**: $22,000 - $25,500
**Total Year 2+**: $4,260/year

### Next Steps

1. **Board Approval**: Present this budget to PTO board
2. **Funding Strategy**: Determine how costs will be covered
3. **Vendor Selection**: Choose development partner
4. **Timeline Planning**: Establish launch date
5. **Content Preparation**: Begin gathering assets and content

---

## Appendix A: Service Provider Links

- **Vercel**: https://vercel.com/pricing
- **Supabase**: https://supabase.com/pricing
- **Stripe**: https://stripe.com/pricing
- **Shopify**: https://www.shopify.com/pricing
- **Resend**: https://resend.com/pricing
- **SendGrid**: https://sendgrid.com/pricing
- **Namecheap Domains**: https://www.namecheap.com

---

**Document Prepared By**: Development Team
**Date**: October 14, 2025
**Valid Through**: December 31, 2025 (pricing subject to change)
**Next Review**: April 2026

**Note**: All costs are estimates based on current market rates and service provider pricing as of October 2025. Actual costs may vary. Transaction fees are based on standard rates and actual fee amounts will depend on donation/sales volume. The PTO should budget conservatively and maintain a reserve fund for unexpected costs.
