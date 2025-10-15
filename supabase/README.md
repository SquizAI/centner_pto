# Supabase Setup Guide
## Centner Academy PTO Website

This directory contains all SQL migrations and setup instructions for the Supabase backend.

---

## Quick Start

### Step 1: Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Organization**: Choose or create organization
   - **Project Name**: `centner-pto` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Pro ($25/month) - **You confirmed you accept this cost**
4. Click **"Create new project"**
5. Wait 2-3 minutes for project initialization

### Step 2: Get Project Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:

```bash
Project URL: https://[your-project-ref].supabase.co
anon public key: eyJhbGc...
service_role key: eyJhbGc... (keep this secret!)
```

4. Update your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Do not expose to client!
```

### Step 3: Run Database Migrations

#### Option A: SQL Editor (Recommended for First Time)

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `migrations/001_initial_schema.sql`
4. Paste into the query editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. ✅ You should see: "Success. No rows returned"

7. Repeat for the next migration files:
   - `migrations/002_row_level_security.sql`
   - `migrations/003_storage_buckets.sql`

#### Option B: Supabase CLI (For Advanced Users)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref [your-project-ref]

# Run migrations
supabase db push
```

### Step 4: Create Storage Buckets

1. Go to **Storage** in the Supabase Dashboard (left sidebar)
2. Click **"Create a new bucket"**
3. Create the following buckets:

**Bucket 1: event-photos**
- Name: `event-photos`
- Public: ✅ **Yes**
- Allowed MIME types: `image/*`
- Max file size: `10MB`

**Bucket 2: news-images**
- Name: `news-images`
- Public: ✅ **Yes**
- Allowed MIME types: `image/*`
- Max file size: `5MB`

**Bucket 3: avatars**
- Name: `avatars`
- Public: ✅ **Yes**
- Allowed MIME types: `image/*`
- Max file size: `2MB`

**Bucket 4: documents**
- Name: `documents`
- Public: ❌ **No** (Private)
- Allowed MIME types: `application/pdf`, `image/*`
- Max file size: `10MB`

### Step 5: Verify Database Setup

Run this query in the SQL Editor to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- ✅ donations
- ✅ event_rsvps
- ✅ events
- ✅ news_posts
- ✅ photo_albums
- ✅ photos
- ✅ profiles
- ✅ volunteer_opportunities
- ✅ volunteer_signups

### Step 6: Test Database Connection

1. Start your Next.js development server:
```bash
npm run dev
```

2. The application should connect to Supabase without errors
3. Check browser console for any Supabase connection errors

---

## Database Schema Overview

### Core Tables

#### profiles
Stores user profiles and roles (member, volunteer, admin, super_admin)

#### events
PTO events and activities (fundraisers, meetings, student events)

#### event_rsvps
Event registrations and attendee tracking

#### donations
All donation records with Stripe integration

#### photo_albums
Photo album organization for events

#### photos
Individual photo metadata and storage references

#### news_posts
Blog-style news and announcements

#### volunteer_opportunities
Volunteer needs and available slots

#### volunteer_signups
Volunteer commitments and hours tracking

---

## Row Level Security (RLS)

All tables have RLS enabled with these access patterns:

### Public Access (No Auth Required)
- ✅ View published events
- ✅ View published photo albums and photos
- ✅ View published news posts
- ✅ View open volunteer opportunities
- ✅ Make donations (creates pending record)

### Member Access (Authenticated Users)
- ✅ View and manage own profile
- ✅ Create event RSVPs
- ✅ View own RSVPs and donations
- ✅ Sign up for volunteer opportunities
- ✅ View own volunteer signups

### Admin Access
- ✅ All member permissions
- ✅ Create, edit, delete events
- ✅ Manage photo albums and upload photos
- ✅ Create, edit, delete news posts
- ✅ View all RSVPs and signups
- ✅ View all donations (for reporting)
- ✅ Manage volunteer opportunities

### Super Admin Access
- ✅ All admin permissions
- ✅ User management and role assignment
- ✅ System configuration

---

## Storage Buckets

### event-photos (Public)
- Event and activity photos
- Max size: 10MB
- Formats: JPG, PNG, WebP
- Admin upload only

### news-images (Public)
- Featured images for news posts
- Max size: 5MB
- Formats: JPG, PNG, WebP
- Admin upload only

### avatars (Public)
- User profile pictures
- Max size: 2MB
- Formats: JPG, PNG
- Users upload their own

### documents (Private)
- Internal PTO documents
- Max size: 10MB
- Formats: PDF, Images
- Admin access only

---

## Environment Variables Reference

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only!

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

---

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Make sure you ran all migration files in order (001, 002, 003)

### Issue: "permission denied for table"
**Solution**: Check that RLS policies were applied from `002_row_level_security.sql`

### Issue: "bucket does not exist"
**Solution**: Create storage buckets manually in the Dashboard as described in Step 4

### Issue: Can't upload photos
**Solution**: Verify storage policies were applied from `003_storage_buckets.sql`

### Issue: Authentication not working
**Solution**:
1. Check that environment variables are correctly set in `.env.local`
2. Verify the anon key matches your Supabase project
3. Restart the dev server after changing environment variables

---

## Next Steps

After completing the Supabase setup:

1. ✅ **Create your first admin user**:
   - Sign up through the application
   - Go to Supabase Dashboard → Authentication → Users
   - Click on your user → Edit → Update the role to 'admin' in the profiles table

2. ✅ **Configure Stripe webhooks** (see `/docs/api/API_ROUTES.md`)

3. ✅ **Set up email service** (Resend or SendGrid)

4. ✅ **Configure Shopify** (if using for store)

---

## Useful Supabase Dashboard Links

- **SQL Editor**: Run queries and view data
- **Table Editor**: Visual table browser
- **Authentication**: Manage users and auth settings
- **Storage**: Manage files and buckets
- **API Docs**: Auto-generated API documentation
- **Logs**: View database and API logs

---

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/)
- Project Technical Architecture: `/docs/architecture/TECHNICAL_ARCHITECTURE.md`
