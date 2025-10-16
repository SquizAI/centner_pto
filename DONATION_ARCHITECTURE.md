# Donation System Architecture

Visual overview of how the donation system works.

---

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER DONATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

    User                   Frontend                Server Actions              Stripe
     │                        │                          │                       │
     ├──visits──────────────>│                          │                       │
     │  /donate              │                          │                       │
     │                       │                          │                       │
     │                  [DonationForm]                  │                       │
     │                       │                          │                       │
     ├──fills form──────────>│                          │                       │
     │  (amount, type,       │                          │                       │
     │   frequency, info)    │                          │                       │
     │                       │                          │                       │
     ├──submits─────────────>│──createCheckoutSession()>│                       │
     │                       │                          │                       │
     │                       │                          │──create session────>│
     │                       │                          │   (with metadata)     │
     │                       │                          │                       │
     │                       │<─────session URL─────────│<───session URL───────│
     │                       │                          │                       │
     ├<──redirects───────────│                          │                       │
     │   to Stripe           │                          │                       │
     │                       │                          │                       │
     ├──────────────────────────────────────────────────────>completes payment>│
     │                                                                  (Stripe Checkout)
     │                                                                          │
     │<─────────────────────redirects back to success page──────────────────────│
     │  /donate/success?session_id=xxx                                          │
     │                                                                          │

┌─────────────────────────────────────────────────────────────────────────┐
│                         WEBHOOK FLOW                                     │
└─────────────────────────────────────────────────────────────────────────┘

    Stripe                Webhook Handler                Database
     │                         │                            │
     │──checkout.session.──>│                            │
     │   completed           │                            │
     │   (webhook event)     │                            │
     │                       │                            │
     │                       │──verify signature          │
     │                       │                            │
     │                       │──extract metadata          │
     │                       │  (donor info, amount, etc) │
     │                       │                            │
     │                       │──create donation record──>│
     │                       │                            │
     │                       │<──confirmation─────────────│
     │                       │                            │
     │<──200 OK──────────────│                            │
     │                       │                            │
     │                       │──(optional)                │
     │                       │  send email receipt        │
     │                       │                            │

┌─────────────────────────────────────────────────────────────────────────┐
│                    RECURRING DONATION FLOW                               │
└─────────────────────────────────────────────────────────────────────────┘

    Stripe                Webhook Handler                Database
     │                         │                            │
     │──invoice.paid────────>│  (monthly/quarterly/       │
     │   (subscription)       │   annual charge)           │
     │                       │                            │
     │                       │──verify signature          │
     │                       │                            │
     │                       │──create new donation────>│
     │                       │  record for this period    │
     │                       │                            │
     │<──200 OK──────────────│                            │
     │                       │                            │
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND LAYER                                 │
└─────────────────────────────────────────────────────────────────────────┘

/app/donate/page.tsx
    │
    ├── Hero Section (Heart icon, title, description)
    ├── Impact Section (6 category cards with icons)
    └── DonationForm Component
            │
            ├── Amount Selection
            │   ├── Preset buttons ($25, $50, $100, $250, $500)
            │   └── Custom amount input
            │
            ├── Frequency Selector
            │   ├── One-time
            │   ├── Monthly
            │   ├── Quarterly
            │   └── Annual
            │
            ├── Donation Type Dropdown
            │   ├── General PTO Support
            │   ├── Playground Fund
            │   ├── STEM Programs
            │   ├── Arts & Music
            │   ├── Field Trips
            │   ├── Teacher Appreciation
            │   └── Campus-Specific Projects
            │
            ├── Donor Information Fields
            │   ├── Full Name (required)
            │   ├── Email (required)
            │   ├── Phone (optional)
            │   ├── Student Name (optional)
            │   ├── Student Grade (optional)
            │   ├── Campus (optional)
            │   ├── Message (optional)
            │   └── Anonymous checkbox
            │
            └── Submit Button
                    │
                    └── calls createCheckoutSession()

┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                                    │
└─────────────────────────────────────────────────────────────────────────┘

Server Actions (/app/actions/donation-actions.ts)
    │
    ├── createCheckoutSession()
    │   ├── Validate input (Zod)
    │   ├── Get/create Stripe customer
    │   ├── Build metadata object
    │   ├── Create Stripe session
    │   └── Return session URL
    │
    ├── getDonationHistory()
    │   ├── Authenticate user
    │   ├── Query database
    │   └── Return donations
    │
    ├── getAllDonations()
    │   ├── Check admin role
    │   ├── Apply filters
    │   ├── Query database
    │   └── Return results
    │
    ├── getDonationStats()
    │   ├── Check admin role
    │   ├── Calculate metrics
    │   └── Return statistics
    │
    └── cancelRecurringDonation()
        ├── Verify ownership
        ├── Cancel in Stripe
        └── Update database

Webhook Handler (/app/api/webhooks/stripe/route.ts)
    │
    ├── POST endpoint
    │   ├── Verify webhook signature
    │   ├── Parse event type
    │   └── Route to handlers
    │
    ├── handleDonationCheckout()
    │   ├── Extract metadata
    │   ├── Build donation record
    │   └── Insert into database
    │
    ├── handleRecurringDonation()
    │   ├── Get subscription details
    │   ├── Create donation record
    │   └── Insert into database
    │
    └── handleSubscriptionCancelled()
        ├── Find subscription donations
        └── Mark as cancelled

┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                       │
└─────────────────────────────────────────────────────────────────────────┘

Supabase Database
    │
    ├── donations table
    │   ├── id (UUID, primary key)
    │   ├── stripe_payment_intent_id
    │   ├── stripe_customer_id
    │   ├── stripe_subscription_id
    │   ├── user_id (FK to profiles)
    │   ├── amount (integer, cents)
    │   ├── currency
    │   ├── status (succeeded/failed/cancelled)
    │   ├── donation_type
    │   ├── is_recurring (boolean)
    │   ├── recurring_interval
    │   ├── donor_name
    │   ├── donor_email
    │   ├── is_anonymous
    │   ├── message
    │   ├── metadata (JSONB)
    │   ├── created_at
    │   └── updated_at
    │
    └── profiles table
        ├── id (UUID, FK to auth.users)
        ├── stripe_customer_id (new field)
        └── ... (other profile fields)
```

---

## Data Flow

### One-Time Donation

```
1. User Input
   ↓
2. Frontend Validation
   ↓
3. createCheckoutSession()
   ├── Validate with Zod
   ├── Create/get Stripe customer
   └── Create checkout session
   ↓
4. Redirect to Stripe
   ↓
5. User completes payment
   ↓
6. Stripe webhook → checkout.session.completed
   ↓
7. Webhook handler
   ├── Verify signature
   ├── Extract metadata
   └── Create donation record
   ↓
8. Redirect to success page
```

### Recurring Donation

```
1. User Input (with frequency selection)
   ↓
2. createCheckoutSession()
   ├── mode: 'subscription'
   └── Create price with interval
   ↓
3. Stripe processes subscription
   ↓
4. First invoice → checkout.session.completed
   ↓
5. Create initial donation record
   ↓
6. Subsequent invoices → invoice.paid
   ↓
7. Create new donation record each period
```

---

## Security Layers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SECURITY MEASURES                                │
└─────────────────────────────────────────────────────────────────────────┘

Frontend
    ├── Client-side validation (immediate feedback)
    ├── Amount limits ($5-$10,000)
    ├── Required field validation
    └── No sensitive data stored

Server Actions
    ├── Zod schema validation
    ├── Authentication checks
    ├── Authorization for admin functions
    ├── Parameterized database queries
    └── Error handling

Stripe Integration
    ├── API keys in environment variables
    ├── Webhook signature verification
    ├── PCI DSS Level 1 compliance
    ├── Hosted checkout page (Stripe handles card data)
    └── 3D Secure support

Database
    ├── Row Level Security (RLS)
    ├── Encrypted at rest
    ├── No card data storage
    └── Audit trail (created_at, updated_at)
```

---

## Error Handling

```
User Action → Frontend → Server Action → Stripe/Database
     ↓           ↓            ↓              ↓
   Error      Error        Error          Error
     ↓           ↓            ↓              ↓
   Toast    Validation   ActionResult    Caught
  Message     Error        Error         & Logged
     ↓           ↓            ↓              ↓
  Display   Show Form    Return Error   Webhook
   Error     Errors      to Frontend     Retry
```

---

## Monitoring Points

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      MONITORING & LOGGING                                │
└─────────────────────────────────────────────────────────────────────────┘

1. Stripe Dashboard
   ├── Payment success/failure rates
   ├── Webhook delivery logs
   ├── Dispute notifications
   └── Subscription status

2. Server Logs
   ├── Server action errors
   ├── Webhook processing logs
   ├── Validation failures
   └── Database errors

3. Database
   ├── Donation creation rate
   ├── Status distribution
   ├── Amount trends
   └── Donor retention

4. Frontend
   ├── Form submission rate
   ├── Completion rate
   ├── Error frequency
   └── User journey tracking
```

---

## Integration Points

```
External Services
    │
    ├── Stripe
    │   ├── Checkout Sessions API
    │   ├── Subscriptions API
    │   ├── Customers API
    │   └── Webhooks
    │
    ├── Supabase
    │   ├── PostgreSQL database
    │   ├── Row Level Security
    │   └── Authentication
    │
    └── (Future) Email Service
        ├── Receipt delivery
        └── Notification emails
```

---

## Performance Considerations

### Frontend
- Lazy load components
- Debounce custom amount input
- Optimized form validation
- Minimal re-renders

### Backend
- Async webhook processing
- Database indexing on common queries
- Idempotency keys for retries
- Connection pooling

### Stripe
- Cached customer lookups
- Batched webhook processing
- Retry logic for failed webhooks

---

## Scalability

The system is designed to scale:

1. **Horizontal Scaling**
   - Stateless server actions
   - Webhook handlers can run on multiple instances
   - No in-memory state

2. **Database Optimization**
   - Indexed columns for fast lookups
   - Partitioning strategy ready for large datasets
   - Read replicas for reporting

3. **Stripe Limits**
   - Test mode: 25 requests/second
   - Live mode: 100+ requests/second
   - Webhook retries built-in

---

## System Requirements

### Development
- Node.js 18.18.0+
- npm 9.0.0+
- Stripe account
- Supabase project

### Production
- HTTPS endpoint
- Environment variables
- Webhook endpoint
- Database migrations applied

---

**Last Updated**: October 16, 2025
**Version**: 1.0.0
